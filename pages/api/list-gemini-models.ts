import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
    return;
  }
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  res.status(200).json(data);
} 