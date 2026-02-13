
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
    console.log('--- Google Drive Quota Status ---')
    const about = await drive.about.get({
        fields: 'storageQuota, user'
    })

    console.log('User:', about.data.user?.displayName)
    console.log('Quota details:', JSON.stringify(about.data.storageQuota, null, 2))

    const limit = parseInt(about.data.storageQuota?.limit || '0')
    const usage = parseInt(about.data.storageQuota?.usage || '0')

    if (limit > 0) {
        const percent = ((usage / limit) * 100).toFixed(2)
        console.log(`Usage: ${percent}% (${(usage / 1024 / 1024).toFixed(2)} MB / ${(limit / 1024 / 1024).toFixed(2)} MB)`)
    } else {
        console.log(`Usage: ${(usage / 1024 / 1024).toFixed(2)} MB (Unlimited/Unknown limit)`)
    }

    console.log('\n--- All Visible Files (including shared) ---')
    const files = await drive.files.list({
        pageSize: 20,
        fields: 'files(id, name, mimeType, size, createdTime, owners)',
        orderBy: 'createdTime desc'
    })

    if (files.data.files && files.data.files.length > 0) {
        files.data.files.forEach(f => {
            const owner = f.owners?.[0]?.emailAddress || 'Unknown'
            console.log(`- ${f.name} (${f.mimeType}) | Owner: ${owner} | Created: ${f.createdTime} | ID: ${f.id}`)
        })
    } else {
        console.log('No files found.')
    }
}

main().catch(console.error)
