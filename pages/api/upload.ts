import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, Fields, Files } from 'formidable';
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
    const form = new IncomingForm({
      multiples: false,
      uploadDir: uploadsDir,
      keepExtensions: true,
      filename: (name: string, ext: string, part: any) => {
        const timestamp = Date.now();
        const original = part.originalFilename || 'file';
        return `${timestamp}-${original}`;
      },
    });
    form.parse(req, (err: any, fields: Fields, files: Files) => {
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
    const file = Array.isArray(files[fileKey]) ? files[fileKey][0] : files[fileKey];
    console.log('File uploaded:', file?.originalFilename, file?.filepath);
    res.status(200).json({
      success: true,
      file: {
        name: file?.originalFilename,
        path: file ? `/uploads/${path.basename(file.filepath)}` : null,
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
} 