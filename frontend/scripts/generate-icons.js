#!/usr/bin/env node
/**
 * Generate PWA icons from SVG
 * Run: node scripts/generate-icons.js
 * Requires: npm install sharp
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Sharp not installed. Creating placeholder icons...');
  createPlaceholderIcons();
  process.exit(0);
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = path.join(__dirname, '../public/icons/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

async function generateIcons() {
  console.log('Generating PWA icons...');

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`  Created: icon-${size}x${size}.png`);
  }

  // Create badge icon (for notifications)
  await sharp(inputSvg)
    .resize(72, 72)
    .png()
    .toFile(path.join(outputDir, 'badge-72.png'));
  console.log('  Created: badge-72.png');

  // Create Apple touch icon
  await sharp(inputSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(outputDir, 'apple-touch-icon.png'));
  console.log('  Created: apple-touch-icon.png');

  // Create favicon
  await sharp(inputSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(outputDir, 'favicon-32x32.png'));
  console.log('  Created: favicon-32x32.png');

  await sharp(inputSvg)
    .resize(16, 16)
    .png()
    .toFile(path.join(outputDir, 'favicon-16x16.png'));
  console.log('  Created: favicon-16x16.png');

  console.log('\nDone! All icons generated.');
}

function createPlaceholderIcons() {
  // Create simple colored PNG placeholders without sharp
  console.log('Creating placeholder icons (install sharp for proper icons)...');

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    // Copy SVG as placeholder reference
    fs.copyFileSync(inputSvg, path.join(outputDir, `icon-${size}x${size}.svg`));
    console.log(`  Created placeholder: icon-${size}x${size}.svg`);
  }

  console.log('\nTo generate proper PNG icons:');
  console.log('  npm install sharp');
  console.log('  node scripts/generate-icons.js');
}

generateIcons().catch(console.error);
