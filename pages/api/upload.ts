import type { NextApiRequest, NextApiResponse } from 'next';
import type { Fields, Files, Part } from 'formidable';
import { IncomingForm as IncomingFormClass } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

async function saveFile(req: NextApiRequest): Promise<{ fields: Fields; files: Files }> {
  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const form = new IncomingFormClass({
      multiples: false,
      uploadDir: uploadsDir,
      keepExtensions: true,
      filename: (name: string, ext: string, part: Part) => {
        const timestamp = Date.now();
        const original = part.originalFilename || 'file';
        return `${timestamp}-${original}`;
      },
    });
    form.parse(req, (err: Error | null, fields: Fields, files: Files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Upload API called. Method:', req.method);
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }
  try {
    const { files } = await saveFile(req);
    const fileKey = Object.keys(files)[0];
    const fileCandidate = files[fileKey];
    const file = Array.isArray(fileCandidate)
      ? fileCandidate[0]
      : fileCandidate;
    if (!file || typeof file.filepath !== 'string') {
      res.status(400).json({ success: false, error: 'File upload failed.' });
      return;
    }
    console.log('File uploaded:', file?.originalFilename, file?.filepath);
    res.status(200).json({
      success: true,
      file: {
        name: file?.originalFilename,
        path: `/uploads/${path.basename(file.filepath)}`,
      },
    });
  } catch (error: unknown) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
} 