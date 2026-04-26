// Generates a centered, letterboxed OG image from the source screenshot.
// Run: node scripts/make-og.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// Facebook recommends 1200x630 (1.91:1) for OG images
const OUT_W = 1200;
const OUT_H = 630;
const BG = { r: 10, g: 10, b: 10, alpha: 1 }; // matches site theme-color #0a0a0a

const src = path.join(root, 'public/brand/og-image.jpg');
const out = path.join(root, 'public/brand/og-image.tmp.jpg');

const meta = await sharp(src).metadata();
console.log(`source: ${meta.width}x${meta.height}`);

// Scale source to fit fully inside OUT_W × OUT_H while preserving aspect
const scaledHeight = OUT_H;
const scaledWidth = Math.round((meta.width / meta.height) * scaledHeight);

const resized = await sharp(src)
  .resize({ width: scaledWidth, height: scaledHeight, fit: 'contain' })
  .toBuffer();

await sharp({
  create: { width: OUT_W, height: OUT_H, channels: 3, background: BG },
})
  .composite([
    {
      input: resized,
      top: 0,
      left: Math.round((OUT_W - scaledWidth) / 2),
    },
  ])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(out);

console.log(`✓ wrote ${out} → ${OUT_W}x${OUT_H}`);
