// Asset map — imports every image/video so Vite content-hashes them at build time.
// Maps plain filenames (e.g. "FathomImage.jpeg") to hashed URLs.
//
// When adding a new asset: drop it in src/assets/images/ or src/assets/videos/,
// add an import + entry below.

// Images
import danhp from './images/danhp.webp';
import FathomImage from './images/FathomImage.jpeg';
import galaxy from './images/galaxy.jpeg';
import infra from './images/infra.jpeg';
import language from './images/language.jpeg';
import pipelineEng from './images/pipeline_eng.webp';
import testJpeg from './images/test.jpeg';

// Videos
import car from './videos/car.mp4';
import danpardy from './videos/danpardy.mp4';
import FathomVid from './videos/FathomVid.mp4';
import hp1 from './videos/hp1.mp4';
import hps2 from './videos/hps2.mp4';
import infraVideo from './videos/infra.mp4';
import languageVideo from './videos/language.mp4';
import pipeline from './videos/pipeline.mp4';
import spar from './videos/spar.mp4';
import swat from './videos/swat.mp4';
import testMp4 from './videos/test.mp4';
import we1Clip from './videos/we-1-clip.mp4';
import we3Clip from './videos/we-3-clip.mp4';

/** Maps plain filename to Vite-hashed URL. Keys are the exact filenames
 *  (e.g. "FathomImage.jpeg", "hp1.mp4"). */
export const assetMap: Record<string, string> = {
  // images
  'danhp.webp': danhp,
  'FathomImage.jpeg': FathomImage,
  'galaxy.jpeg': galaxy,
  'infra.jpeg': infra,
  'language.jpeg': language,
  'pipeline_eng.webp': pipelineEng,
  'test.jpeg': testJpeg,
  // videos
  'car.mp4': car,
  'danpardy.mp4': danpardy,
  'FathomVid.mp4': FathomVid,
  'hp1.mp4': hp1,
  'hps2.mp4': hps2,
  'infra.mp4': infraVideo,
  'language.mp4': languageVideo,
  'pipeline.mp4': pipeline,
  'spar.mp4': spar,
  'swat.mp4': swat,
  'test.mp4': testMp4,
  'we-1-clip.mp4': we1Clip,
  'we-3-clip.mp4': we3Clip,
};

/**
 * Resolve an asset key to its hashed URL. External URLs and absolute public
 * paths pass through unchanged. Unknown bare asset keys are rejected.
 */
export function resolveAsset(key: string | undefined): string | undefined {
  if (!key) return key;
  // External URLs and absolute public/ paths pass through
  if (
    key.startsWith('/') ||
    key.startsWith('http://') ||
    key.startsWith('https://')
  )
    return key;
  const resolved = assetMap[key];
  if (!resolved) throw new Error(`Unknown asset key: ${key}`);
  return resolved;
}
