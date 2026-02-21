import sharp from 'sharp';
import { glob } from 'glob';
import { dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const INPUT_DIR = join(root, 'public', 'images');
const OUT_DIR = join(root, 'public', 'images');

async function processImage(file) {
  const name = basename(file).replace(/\.(jpg|jpeg|png)$/i, '');
  const baseOut = join(OUT_DIR, name);
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const image = sharp(file).rotate();

  await image.clone().webp({ quality: 82 }).toFile(`${baseOut}.webp`);
  await image.clone().avif({ quality: 50 }).toFile(`${baseOut}.avif`);
  console.log('Generated:', `${name}.webp`, `${name}.avif`);
}

async function run() {
  const files = await glob(`${INPUT_DIR}/**/*.{jpg,jpeg,png}`);
  if (files.length === 0) {
    console.log('No source images found in public/images');
    return;
  }
  for (const f of files) {
    try {
      await processImage(f);
    } catch (e) {
      console.error('Failed for', f, e);
    }
  }
}

run();

