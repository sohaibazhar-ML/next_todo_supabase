'use server'

import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'
import { Readable } from 'stream'
import { prisma } from '@/lib/prisma'

// Initialize Auth
// Note: We use environmental variables for credentials
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/documents'
    ],
})

const drive = google.drive({ version: 'v3', auth })

/**
 * Helper to call the Google Apps Script Bridge
 */
async function callBridge(action: string, payload: any) {
    const bridgeUrl = process.env.GOOGLE_BRIDGE_URL;
    const bridgeSecret = process.env.GOOGLE_BRIDGE_SECRET;

    if (!bridgeUrl || !bridgeSecret) {
        throw new Error('Google Bridge not configured in environment');
    }

    const response = await fetch(bridgeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            key: bridgeSecret,
            action,
            ...payload
        })
    });

    const result = await response.json();
    if (result.error) {
        throw new Error(`Bridge Error: ${result.error}`);
    }
    return result;
}

/**
 * Uploads a DOCX file to Google Drive and converts it to a Google Doc.
 * Used by Admin when creating a template.
 */
export async function uploadTemplateToDrive(fileBuffer: Buffer, fileName: string) {
    // Verify Admin (Optional but recommended)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    try {
        console.log(`[DEBUG] Converting buffer to base64 for ${fileName} (${fileBuffer.length} bytes)`)
        const fileBase64 = fileBuffer.toString('base64');
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

        console.log(`[DEBUG] Calling bridge for upload. Bridge URL present: ${!!process.env.GOOGLE_BRIDGE_URL}`)
        const result = await callBridge('upload', {
            name: fileName,
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            fileBase64,
            folderId
        });

        console.log(`[DEBUG] Bridge upload result:`, result)

        if (!result.id) throw new Error('Failed to get File ID from Bridge');

        return result.id;
    } catch (error) {
        console.error('[DEBUG] uploadTemplateToDrive Error:', error)
        throw error
    }
}

/**
 * Creates a unique copy of the template for the user to edit.
 * Shares it with "Anyone with link (Writer)" so the user can open different tab.
 */
export async function createEditingSession(documentId: string, templateFileId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('You must be logged in to edit documents')
    }

    try {
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

        // 1. Copy the Template via Bridge
        const result = await callBridge('copy', {
            fileId: templateFileId,
            name: `Edit - Doc ${documentId.slice(0, 8)}... - ${user.email}`,
            folderId
        });

        const fileId = result.id
        if (!fileId) throw new Error('Failed to copy document via Bridge')

        // 2. The bridge already shared it with "Anyone with Link" in our script
        // 3. Get the URL via Bridge (or build it manually)
        const editUrl = `https://docs.google.com/document/d/${fileId}/edit`;

        // 4. Update Database (create or update user_document_version)
        const lastVersion = await prisma.user_document_versions.findFirst({
            where: {
                original_document_id: documentId,
                user_id: user.id
            },
            orderBy: { version_number: 'desc' }
        })

        const nextVersion = (lastVersion?.version_number || 0) + 1

        const version = await prisma.user_document_versions.create({
            data: {
                original_document_id: documentId,
                user_id: user.id,
                version_number: nextVersion,
                version_name: `Draft ${nextVersion}`,
                original_file_type: 'google',
                google_drive_file_id: fileId,
                google_edit_link: editUrl,
                is_draft: true
            }
        })

        return {
            success: true,
            editUrl,
            versionId: version.id
        }

    } catch (error) {
        console.error('Create Session Error:', error)
        throw new Error('Failed to start editing session')
    }
}

/**
 * Finalizes the editing session:
 * 1. Exports Google Doc to PDF
 * 2. Uploads PDF to Supabase
 * 3. Updates database record
 */
export async function finishEditingSession(versionId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const version = await prisma.user_document_versions.findUnique({
        where: { id: versionId }
    })

    if (!version || version.user_id !== user.id) {
        throw new Error('Version not found or unauthorized')
    }

    if (!version.google_drive_file_id) {
        throw new Error('No Google Drive file associated with this version')
    }

    try {
        console.log(`[DEBUG] Finishing session for version: ${versionId}`)
        console.log(`[DEBUG] Google Drive File ID: ${version.google_drive_file_id}`)

        // 1. Export to DOCX via Bridge
        console.log('[DEBUG] Calling bridge: export as DOCX...')
        const result = await callBridge('export', {
            fileId: version.google_drive_file_id,
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });

        if (!result.base64) {
            console.error('[DEBUG] Bridge returned no base64 data', result)
            throw new Error('Bridge returned empty DOCX data')
        }

        console.log(`[DEBUG] Received DOCX data (${result.base64.length} chars base64)`)
        const docBuffer = Buffer.from(result.base64, 'base64');

        // 2. Upload to Supabase Storage
        const fileName = `${version.original_document_id}/${version.id}/final.docx`
        const mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        console.log(`[DEBUG] Uploading to Supabase: documents/${fileName}`)

        const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(fileName, docBuffer, {
                contentType: mimeType,
                upsert: true
            })

        if (uploadError) {
            console.error('[DEBUG] Supabase Upload Error:', uploadError)
            throw new Error(`Upload failed: ${uploadError.message}`)
        }

        // 3. Update Database
        console.log('[DEBUG] Updating database record...')
        await prisma.user_document_versions.update({
            where: { id: versionId },
            data: {
                exported_file_path: fileName,
                exported_mime_type: mimeType,
                is_draft: false,
                updated_at: new Date()
            }
        })

        // 4. Update Download Count
        console.log('[DEBUG] Logging final download...')
        await prisma.download_logs.create({
            data: {
                document_id: version.original_document_id,
                user_id: user.id,
                context: 'Google Docs Export'
            }
        })

        // Generate a signed URL for download (bucket is private)
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('documents')
            .createSignedUrl(fileName, 60 * 60) // 1 hour expiry

        if (signedUrlError || !signedUrlData) {
            console.error('[DEBUG] Failed to create signed URL:', signedUrlError)
            throw new Error('Failed to generate download URL')
        }

        console.log(`[DEBUG] Signed URL generated: ${signedUrlData.signedUrl}`)
        console.log(`[DEBUG] Session finished successfully (DOCX)`)
        return { success: true, fileUrl: signedUrlData.signedUrl }

    } catch (error) {
        console.error('[DEBUG] CRITICAL ERROR in finishEditingSession:', error)
        throw error instanceof Error ? error : new Error('Failed to finish editing session')
    }
}

/**
 * Manually converts an existing DOCX file to a Google Doc.
 */
export async function convertDocumentAction(documentId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 1. Get document info
    const document = await prisma.documents.findUnique({
        where: { id: documentId }
    })

    if (!document) throw new Error('Document not found')

    try {
        // 2. Download from Supabase
        const { data: fileData, error: downloadError } = await supabase.storage
            .from('documents')
            .download(document.file_path)

        if (downloadError || !fileData) {
            throw new Error(`Failed to download file from storage: ${downloadError?.message}`)
        }

        // 3. Convert to Base64
        const arrayBuffer = await fileData.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const fileBase64 = buffer.toString('base64')

        // 4. Send to Bridge
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID
        const result = await callBridge('upload', {
            name: document.file_name,
            mimeType: document.mime_type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            fileBase64,
            folderId
        })

        if (!result.id) throw new Error('Failed to get File ID from Bridge')

        // 5. Update Database
        await prisma.documents.update({
            where: { id: documentId },
            data: { google_drive_template_id: result.id }
        })

        return { success: true, googleDriveTemplateId: result.id }
    } catch (error) {
        console.error('Manual Conversion Error:', error)
        throw error instanceof Error ? error : new Error('Failed to convert document')
    }
}
