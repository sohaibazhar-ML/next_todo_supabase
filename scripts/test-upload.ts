
import { google } from 'googleapis'
import * as dotenv from 'dotenv'
dotenv.config()

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
})

const drive = google.drive({ version: 'v3', auth })

async function main() {
    console.log('Attempting test upload...')
    try {
        const response = await drive.files.create({
            requestBody: {
                name: 'test-shared-folder-upload.txt',
                mimeType: 'text/plain',
                parents: process.env.GOOGLE_DRIVE_FOLDER_ID ? [process.env.GOOGLE_DRIVE_FOLDER_ID] : [],
            },
            media: {
                mimeType: 'text/plain',
                body: 'test content in shared folder',
            },
        })
        console.log('Upload SUCCESS! File ID:', response.data.id)

        // Cleanup
        await drive.files.delete({ fileId: response.data.id! })
        console.log('Cleanup successful.')
    } catch (error: unknown) {
        console.error('Upload FAILED:')
        const err = error as { response?: { status: number; data: unknown } }
        if (err.response) {
            console.error('Status:', err.response.status)
            console.error('Data:', JSON.stringify(err.response.data, null, 2))
        } else {
            console.error(error)
        }
    }
}

main().catch(console.error)
