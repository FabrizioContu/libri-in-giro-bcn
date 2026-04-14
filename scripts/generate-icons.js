const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const svgPath = path.join(__dirname, '..', 'public', 'icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

const sizes = [
  { size: 192, file: 'android-chrome-192x192.png' },
  { size: 512, file: 'android-chrome-512x512.png' },
  { size: 180, file: 'apple-touch-icon.png' },
];

async function generate() {
  for (const { size, file } of sizes) {
    const outPath = path.join(__dirname, '..', 'public', file);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log(`✓ ${file} (${size}x${size})`);
  }
}

generate().catch(console.error);
