import { put } from '@vercel/blob';
import path from 'path';
import { fileURLToPath } from 'url';

// Load root .env if available, regardless of where this script is executed from
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnv = path.resolve(__dirname, '../../../.env');
try { process.loadEnvFile(rootEnv); } catch {}


export async function uploadFileToBlob(
  fileBuffer: Buffer,
  fileName: string,
  token?: string,
): Promise<string> {
  const { url } = await put(fileName, fileBuffer, {
    access: 'public',
    token: token || process.env.BLOB_READ_WRITE_TOKEN,
  });
  return url;
}
