"use client";
import { useState } from "react";

export default function Home() {
  const [driveFiles, setDriveFiles] = useState([]);
  const [azureFiles, setAzureFiles] = useState([]);
  const [log, setLog] = useState("");

  async function listarDrive() {
    const res = await fetch(`/api/drive/list`);
    const data = await res.json();
    setDriveFiles(data.files || []);
  }

  async function listarAzure() {
    const res = await fetch(`/api/azure/list`);
    const data = await res.json();
    setAzureFiles(data.blobs || []);
  }

  async function migrar() {
    setLog("Migrando...");
    const res = await fetch("/api/migrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    const data = await res.json();
    setLog(JSON.stringify(data, null, 2));
    
    // Atualiza listas
    listarDrive();
    listarAzure();
  }

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Migração Google Drive → Azure Blob</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 30 }}>
        <button onClick={listarDrive} style={btn}>Listar Drive</button>
        <button onClick={listarAzure} style={btn}>Listar Azure</button>
        <button onClick={migrar} style={{ ...btn, background: "#4CAF50" }}>Migrar Tudo</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, marginBottom: 40 }}>
        <div>
          <h2>Google Drive</h2>
          <table style={table}>
            <thead>
              <tr><th>Nome</th><th>MIME</th><th>Modificado</th></tr>
            </thead>
            <tbody>
              {driveFiles.map(file => (
                <tr key={file.id}>
                  <td>{file.name}</td>
                  <td>{file.mimeType}</td>
                  <td>{new Date(file.modifiedTime).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h2>Azure Blob Storage</h2>
          <table style={table}>
            <thead>
              <tr><th>Nome</th><th>Tamanho (bytes)</th></tr>
            </thead>
            <tbody>
              {azureFiles.map(blob => (
                <tr key={blob.name}>
                  <td>{blob.name}</td>
                  <td>{blob.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3>Logs</h3>
        <pre style={{ background: "#222", color: "#0f0", padding: 15, borderRadius: 5 }}>{log}</pre>
      </div>
    </main>
  );
}

const btn = { padding: "10px 20px", borderRadius: 6, border: "none", cursor: "pointer", background: "#1976D2", color: "white", fontSize: 15 };
const table = { width: "100%", borderCollapse: "collapse", background: "white", boxShadow: "0 0 6px rgba(0,0,0,0.1)" };
