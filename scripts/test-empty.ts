
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
    console.log('Attempting empty doc creation...')
    try {
        const response = await drive.files.create({
            requestBody: {
                name: 'empty-test-doc',
                mimeType: 'application/vnd.google-apps.document',
                parents: process.env.GOOGLE_DRIVE_FOLDER_ID ? [process.env.GOOGLE_DRIVE_FOLDER_ID] : [],
            },
            fields: 'id',
        })
        console.log('Creation SUCCESS! File ID:', response.data.id)

        // Cleanup
        await drive.files.delete({ fileId: response.data.id! })
        console.log('Cleanup successful.')
    } catch (error: any) {
        console.error('Creation FAILED:')
        if (error.response) {
            console.error('Status:', error.response.status)
            console.error('Data:', JSON.stringify(error.response.data, null, 2))
        } else {
            console.error(error)
        }
    }
}

main().catch(console.error)
