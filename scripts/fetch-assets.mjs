#!/usr/bin/env node
/*
Fetch images/videos from royalty-free providers (Pexels/Unsplash/Pixabay) for items
in section JSON files referenced by src/data/manifest.json that lack thumbnails or videos.
Saves assets under public/.

Usage:
  PEXELS_API_KEY=... UNSPLASH_ACCESS_KEY=... node scripts/fetch-assets.mjs --provider=pexels --type=all

Notes:
 - Prioritizes cinematic/sophisticated queries by augmenting search terms.
 - Only downloads what is missing; repeatable.
*/

import fs from 'fs';
import path from 'path';
import https from 'https';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const DATA_DIR = path.join(ROOT, 'src', 'data');
const MANIFEST_PATH = path.join(DATA_DIR, 'manifest.json');
const IMAGES_DIR = path.join(ROOT, 'public', 'images');
const VIDEOS_DIR = path.join(ROOT, 'public', 'videos');

const argv = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v] = a.split('=');
  return [k.replace(/^--/, ''), v ?? true];
}));

const provider = (argv.provider || 'pexels').toLowerCase();
const type = (argv.type || 'all').toLowerCase(); // images|videos|all
const hotlink = argv.hotlink === 'true' || provider === 'unsplash'; // Unsplash requires hotlinking per guidelines
const replace = argv.replace === 'true'; // force replace existing assets
const onlySection = argv.only ? String(argv.only) : null; // e.g., workExperience|personalProjects|work

const PEXELS_KEY = process.env.PEXELS_API_KEY || '';
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY || '';
const UNSPLASH_SECRET = process.env.UNSPLASH_SECRET_KEY || '';

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
  });
}

async function downloadTo(url, outPath, headers = {}) {
  const buf = await httpsGet(url, headers);
  fs.writeFileSync(outPath, buf);
}

function buildQuery(item) {
  const phrases = [item.title, item.company, item.role, item.category]
    .filter(Boolean)
    .slice(0, 3)
    .join(' ');
  // Cinematic/sophisticated bias words
  return `${phrases} cinematic sophisticated professional film still bokeh`; 
}

async function searchPexelsImages(q) {
  if (!PEXELS_KEY) return null;
  const url = `https://api.pexels.com/v1/search?per_page=10&query=${encodeURIComponent(q)}`;
  const buf = await httpsGet(url, { Authorization: PEXELS_KEY });
  const data = JSON.parse(buf.toString('utf8'));
  const hits = data.photos || [];
  // Prefer wider images
  const best = hits.sort((a, b) => (b.width * b.height) - (a.width * a.height))[0];
  if (!best) return null;
  return best.src?.large2x || best.src?.large || best.src?.original || best.src?.medium || null;
}

async function searchPexelsVideos(q) {
  if (!PEXELS_KEY) return null;
  const url = `https://api.pexels.com/videos/search?per_page=10&query=${encodeURIComponent(q)}`;
  const buf = await httpsGet(url, { Authorization: PEXELS_KEY });
  const data = JSON.parse(buf.toString('utf8'));
  const hits = data.videos || [];
  const best = hits[0];
  if (!best) return null;
  // Pick a 720p-ish file if available
  const file = (best.video_files || []).find(v => v.height >= 720 && v.quality === 'hd') || best.video_files?.[0];
  return file?.link || null;
}

async function searchUnsplashImages(q) {
  if (!UNSPLASH_KEY) return null;
  const url = `https://api.unsplash.com/search/photos?per_page=10&query=${encodeURIComponent(q)}`;
  const buf = await httpsGet(url, {
    'Authorization': `Client-ID ${UNSPLASH_KEY}`,
    'Accept-Version': 'v1'
  });
  const data = JSON.parse(buf.toString('utf8'));
  const best = (data.results || []).sort((a, b) => (b.width * b.height) - (a.width * a.height))[0];
  if (!best) return null;
  return {
    url: best.urls?.regular || best.urls?.full || best.urls?.small || null,
    download_location: best.links?.download_location,
    credit: {
      photographer: best.user?.name,
      html: best.links?.html
    }
  };
}

async function getImageURL(q) {
  if (provider === 'pexels') return (await searchPexelsImages(q)) || (await searchUnsplashImages(q));
  if (provider === 'unsplash') return (await searchUnsplashImages(q)) || (await searchPexelsImages(q));
  return null;
}

async function getVideoURL(q) {
  if (provider === 'pexels') return await searchPexelsVideos(q);
  // Unsplash/Pixabay: limited/no video via API; prefer Pexels for videos
  return null;
}

function normalizeFilename(id, suffix, ext) {
  return `${id}-${suffix}.${ext}`.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
}

async function run() {
  ensureDir(IMAGES_DIR);
  ensureDir(VIDEOS_DIR);

  const manifest = readJSON(MANIFEST_PATH);
  const sections = Array.isArray(manifest.sections) ? manifest.sections : [];
  const metadataSourceId = manifest.metadataSource || sections.find(s => s.enabled)?.id;
  const metadataSourceSection = sections.find(s => s.id === metadataSourceId);
  const metadataSourceContent = metadataSourceSection
    ? readJSON(path.join(DATA_DIR, metadataSourceSection.path))
    : null;
  const defaults = metadataSourceContent?.metadata?.defaults || {};
  let updates = 0;
  let updatedFiles = 0;

  for (const section of sections) {
    if (!section.enabled) continue;
    if (onlySection && section.type !== onlySection && section.id !== onlySection) continue;
    const sectionPath = path.join(DATA_DIR, section.path);
    const sectionContent = readJSON(sectionPath);
    if (!Array.isArray(sectionContent.items)) continue;
    let sectionUpdated = false;
    for (const item of sectionContent.items) {
      const q = buildQuery(item);
      const baseId = item.id || item.title.replace(/\s+/g, '-');

      const isPlaceholderThumb = () => {
        const t = item.thumbnailUrl || '';
        if (!t) return true;
        if (defaults?.thumbnailUrl && t === defaults.thumbnailUrl) return true;
        if (/test\.(jpg|jpeg|png)$/i.test(t)) return true;
        if (/logo/i.test(t)) return true; // treat logos as placeholders for cinematic covers
        return false;
      };

      const isPlaceholderVideo = () => {
        const v = item.videoUrl || '';
        if (!v) return true;
        if (defaults?.videoUrlMp4 && v === defaults.videoUrlMp4) return true;
        if (/test\.(mp4|webm)$/i.test(v)) return true;
        return false;
      };

      // Images
      if ((type === 'images' || type === 'all') && (replace || isPlaceholderThumb())) {
        try {
          const result = await getImageURL(q);
          if (result) {
            if (provider === 'unsplash' || hotlink) {
              // Unsplash hotlinking: set direct URL and register download event
              const url = typeof result === 'string' ? result : result.url;
              const downloadLoc = typeof result === 'object' ? result.download_location : null;
              if (url) {
                item.thumbnailUrl = url;
                // Optionally store credit fields for UI display later
                if (result.credit) item._unsplashCredit = result.credit;
                updates++;
                sectionUpdated = true;
              }
              if (downloadLoc) {
                try {
                  await httpsGet(downloadLoc, {
                    'Authorization': `Client-ID ${UNSPLASH_KEY}`,
                    'Accept-Version': 'v1'
                  });
                } catch {}
              }
            } else {
              const url = typeof result === 'string' ? result : result.url;
              if (url) {
                const name = normalizeFilename(baseId, 'thumb', 'jpg');
                const outPath = path.join(IMAGES_DIR, name);
                await downloadTo(url, outPath, provider === 'pexels' ? { Authorization: PEXELS_KEY } : {});
                item.thumbnailUrl = `/images/${name}`;
                updates++;
                sectionUpdated = true;
              }
            }
          }
        } catch (e) {
          console.warn('Image fetch failed for', item.title, e.message);
        }
      }

      // Videos (best-effort via Pexels)
      if ((type === 'videos' || type === 'all') && (replace || isPlaceholderVideo())) {
        try {
          const url = await getVideoURL(q);
          if (url) {
            const name = normalizeFilename(baseId, 'clip', 'mp4');
            const outPath = path.join(VIDEOS_DIR, name);
            await downloadTo(url, outPath, { Authorization: PEXELS_KEY });
            item.videoUrl = `/videos/${name}`;
            updates++;
            sectionUpdated = true;
          }
        } catch (e) {
          console.warn('Video fetch failed for', item.title, e.message);
        }
      }
    }
    if (sectionUpdated) {
      writeJSON(sectionPath, sectionContent);
      updatedFiles++;
    }
  }

  if (updates > 0) {
    console.log(`Updated ${updatedFiles} section file(s) with ${updates} asset reference(s).`);
  } else {
    console.log('No updates made. Assets likely already present.');
  }

  console.log('Done. Remember to run: npm run generate:images to create WebP/AVIF variants.');
}

run();
