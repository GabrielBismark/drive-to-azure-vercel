import { google } from "googleapis";
import { BlobServiceClient } from "@azure/storage-blob";

export async function POST() {
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
      scopes: ["https://www.googleapis.com/auth/drive.readonly"]
    });

    const drive = google.drive({ version: "v3", auth });

    const blobService = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobService.getContainerClient(process.env.AZURE_CONTAINER);
    await containerClient.createIfNotExists();

    const filesResponse = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType)",
    });

    const files = filesResponse.data.files || [];
    const results = [];

    function sanitizeName(name) {
      return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9.\-_]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "")
        .trim();
    }

    function safeFileName(original) {
      let base = original.replace(/\.[^/.]+$/, "");
      let ext = original.includes(".") ? original.split(".").pop() : "bin";
      base = sanitizeName(base);
      ext = sanitizeName(ext);
      if (!base) base = "arquivo";
      if (!ext) ext = "bin";
      return `${base}.${ext}`;
    }

    for (const file of files) {
      try {
        if (file.mimeType.startsWith("application/vnd.google-apps")) {
          results.push({ file: file.name, status: "ignored-google-doc" });
          continue;
        }

        const download = await drive.files.get(
          { fileId: file.id, alt: "media" },
          { responseType: "arraybuffer" }
        );

        const buffer = Buffer.from(download.data);
        const filename = safeFileName(file.name);

        const blobClient = containerClient.getBlockBlobClient(filename);
        await blobClient.uploadData(buffer, { overwrite: true });

        results.push({ file: file.name, savedAs: filename, status: "ok" });
      } catch (err) {
        results.push({ file: file.name, status: "error", msg: err.message });
      }
    }

    return new Response(JSON.stringify({ migrated: results }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
