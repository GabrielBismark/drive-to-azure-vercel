import { BlobServiceClient } from '@azure/storage-blob';

export async function GET() {
  try {
    const conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const container = process.env.AZURE_CONTAINER;
    if (!conn || !container) {
      return new Response(JSON.stringify({ error: 'AZURE_STORAGE_CONNECTION_STRING ou AZURE_CONTAINER não configurado' }), { status: 500 });
    }

    const service = BlobServiceClient.fromConnectionString(conn);
    const containerClient = service.getContainerClient(container);

    const blobs = [];
    for await (const blob of containerClient.listBlobsFlat()) {
      blobs.push({ name: blob.name, size: blob.properties.contentLength });
    }

    return new Response(JSON.stringify({ blobs }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
