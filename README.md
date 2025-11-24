# Drive → Azure (Vercel-ready)

Projeto Next.js com rotas de API para listar arquivos do **Google Drive** e do **Azure Blob Storage**, e migrar arquivos do Drive para o Blob.

**Contêiner usado por padrão**: `Aluno_gabriel_bismark`

## Como usar (local / Vercel)

1. Instale dependências:
   ```bash
   npm install
   ```

2. Variáveis de ambiente (no Vercel: Settings → Environment Variables):
   - `GOOGLE_SERVICE_ACCOUNT_JSON` = JSON inteiro do service account (cole o JSON completo como valor)
   - `AZURE_STORAGE_CONNECTION_STRING` = sua connection string do Azure Storage
   - `AZURE_CONTAINER` = `Aluno_gabriel_bismark`

3. Rodar local (para testar):
   - Você pode usar `next dev` mas lembre-se: localmente o GoogleAuth pode precisar do arquivo JSON em disco.
   - Para rodar local sem expor o JSON em repositório, defina `GOOGLE_SERVICE_ACCOUNT_JSON` como o conteúdo do JSON.

4. Deploy no Vercel:
   - Crie um novo projeto no Vercel apontando para este repositório (ou faça upload do ZIP).
   - Configure as environment variables (ver acima).
   - Deploy.

## Endpoints
- `GET /api/drive/list?folderId=<ID>` → lista arquivos do Google Drive na pasta.
- `GET /api/azure/list` → lista blobs no container (`AZURE_CONTAINER`).
- `POST /api/migrate` (JSON body: `{ "folderId": "<ID>" }`) → migra os arquivos da pasta do Drive pro container.

## Observações de segurança
- Não comite o JSON da service account nem a connection string.
- Use variáveis de ambiente seguras no Vercel.
