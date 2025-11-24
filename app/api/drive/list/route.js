import { google } from 'googleapis';

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });

    const drive = google.drive({ version: 'v3', auth });

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    const res = await drive.files.list({
      q: `'${folderId}' in parents`,
      fields: 'files(id, name, mimeType)'
    });

    return Response.json({ files: res.data.files || [] });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
