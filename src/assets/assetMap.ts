// Asset map — imports every image/video so Vite content-hashes them at build time.
// Maps plain filenames (e.g. "FathomImage.jpeg") to hashed URLs.
//
// When adding a new asset: drop it in src/assets/images/ or src/assets/videos/,
// add an import + entry below.

// Images
import danhp from './images/danhp.webp';
import FathomImage from './images/FathomImage.jpeg';
import pipelineEng from './images/pipeline_eng.webp';
import testBac from './images/test_bac.jpeg';
import testJpeg from './images/test.jpeg';
import we1Thumb from './images/we-1-thumb.jpg';
import we2Thumb from './images/we-2-thumb.jpg';
import we3Thumb from './images/we-3-thumb.jpg';

// Videos
import cloud from './videos/cloud.mp4';
import dataBender from './videos/data_bender.mp4';
import FathomVid from './videos/FathomVid.mp4';
import graduation from './videos/graduation.mp4';
import hp1 from './videos/hp1.mp4';
import hps2 from './videos/hps2.mp4';
import mason from './videos/mason.mp4';
import pipeline from './videos/pipeline.mp4';
import testMp4 from './videos/test.mp4';
import we1Clip from './videos/we-1-clip.mp4';
import we2Clip from './videos/we-2-clip.mp4';
import we3Clip from './videos/we-3-clip.mp4';

/** Maps plain filename to Vite-hashed URL. Keys are the exact filenames
 *  (e.g. "FathomImage.jpeg", "hp1.mp4"). */
export const assetMap: Record<string, string> = {
  // images
  'danhp.webp':           danhp,
  'FathomImage.jpeg':     FathomImage,
  'pipeline_eng.webp':    pipelineEng,
  'test_bac.jpeg':        testBac,
  'test.jpeg':            testJpeg,
  'we-1-thumb.jpg':       we1Thumb,
  'we-2-thumb.jpg':       we2Thumb,
  'we-3-thumb.jpg':       we3Thumb,
  // videos
  'cloud.mp4':            cloud,
  'data_bender.mp4':      dataBender,
  'FathomVid.mp4':        FathomVid,
  'graduation.mp4':       graduation,
  'hp1.mp4':              hp1,
  'hps2.mp4':             hps2,
  'mason.mp4':            mason,
  'pipeline.mp4':         pipeline,
  'test.mp4':             testMp4,
  'we-1-clip.mp4':        we1Clip,
  'we-2-clip.mp4':        we2Clip,
  'we-3-clip.mp4':        we3Clip,
};

/**
 * Resolve an asset key to its hashed URL. Returns the original value if it
 * doesn't look like an asset key (starts with / or http).
 */
export function resolveAsset(key: string | undefined): string | undefined {
  if (!key) return key;
  // External URLs and absolute public/ paths pass through
  if (key.startsWith('/') || key.startsWith('http')) return key;
  return assetMap[key] || key;
}
