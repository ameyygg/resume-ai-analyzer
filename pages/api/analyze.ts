import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const { filePath, role } = req.body;
  if (!filePath || !role) {
    res.status(400).json({ success: false, error: 'Missing filePath or role' });
    return;
  }

  try {
    // Read and extract text from the resume file
    const resumeAbsPath = path.join(process.cwd(), 'public', filePath.replace(/^\/uploads\//, 'uploads/'));
    let resumeContent = '';
    if (resumeAbsPath.endsWith('.pdf')) {
      const pdfBuffer = fs.readFileSync(resumeAbsPath);
      const pdfData = await pdfParse(pdfBuffer);
      resumeContent = pdfData.text;
    } else if (resumeAbsPath.endsWith('.txt')) {
      resumeContent = fs.readFileSync(resumeAbsPath, 'utf8');
    } else {
      // For unsupported formats, return an error
      res.status(400).json({ success: false, error: 'Only PDF and TXT files are supported for analysis.' });
      return;
    }

    console.log('Extracted resume text (first 500 chars):', resumeContent.slice(0, 500));

    // Prepare the prompt for OpenAI
    const prompt = `You are an expert resume reviewer for software development roles. Analyze the following resume for the role of ${role}. Provide:
1. A summary of the resume
2. Key skills extracted
3. Missing important skills
4. Formatting or structure improvements
5. Overall mistakes from different sections
6. Suggestions to make the resume stronger

Resume:
${resumeContent}

Respond ONLY with valid JSON inside triple backticks, with keys: summary, keySkills (array), missingSkills (array), formatting, mistakes, suggestions. Do not include any explanation or text outside the JSON code block.`;

    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`;
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });
    const data = await geminiRes.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('Gemini raw response:', text);
    let analysis = null;
    try {
      // Extract JSON from triple backticks if present
      const match = text.match(/```(?:json)?\n([\s\S]*?)```/i);
      const jsonString = match ? match[1] : text;
      analysis = JSON.parse(jsonString);
      console.log('Parsed analysis:', analysis);
    } catch {
      // fallback: return raw text if not valid JSON
      analysis = { raw: text };
      console.log('Failed to parse JSON, using raw text.');
    }
    res.status(200).json({ success: true, analysis });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
} 