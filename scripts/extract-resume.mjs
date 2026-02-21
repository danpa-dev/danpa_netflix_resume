#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const pdfPath = path.resolve(process.cwd(), 'public', 'DanParkResume.pdf');
if (!fs.existsSync(pdfPath)) {
  console.error(`PDF not found at ${pdfPath}`);
  process.exit(1);
}

const outPath = path.resolve(process.cwd(), '.taskmaster', 'docs', 'resume-text.txt');
fs.mkdirSync(path.dirname(outPath), { recursive: true });

try {
  const buf = fs.readFileSync(pdfPath);
  const data = await pdfParse(buf);
  fs.writeFileSync(outPath, data.text || '', 'utf8');
  console.log(`Extracted resume text to ${outPath}`);
} catch (err) {
  console.error('Failed to extract PDF text:', err?.message || err);
  process.exit(2);
}

