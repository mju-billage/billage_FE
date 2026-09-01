#!/usr/bin/env node
/**
 * 디자인 원본(360dp 폭)과 실제 캡처(1080px 폭, 480dpi)를 나란히 붙인 비교 이미지를 만든다.
 * shots/<SCREEN_ID>.png(npm run shot으로 미리 찍어둔 것)를 1/3로 다운스케일해
 * 디자인 이미지와 같은 배율로 맞춘 뒤 shots/pairs/<SCREEN_ID>.png로 저장한다.
 *
 * 사용법:
 *   node scripts/make-pair.js <SCREEN_ID> [--variant N]
 *   npm run pair -- <SCREEN_ID> [--variant N]
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SHOTS_DIR = path.join(__dirname, '..', 'shots');
const PAIRS_DIR = path.join(SHOTS_DIR, 'pairs');
const DESIGN_INDEX_PATH = path.join(__dirname, 'design-index.json');

const ACTUAL_SCALE = 1 / 3; // 1080px(480dpi, 3x) → 360dp
const LABEL_HEIGHT = 34;
const GAP = 16;
const FONT_SIZE = 18;

function printUsage() {
  console.error('사용법: node scripts/make-pair.js <SCREEN_ID> [--variant N]');
}

function labelSvg(width, height, text) {
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1f2933"/>
      <text x="8" y="${height / 2 + FONT_SIZE / 3}" font-family="monospace"
            font-size="${FONT_SIZE}" fill="#ffffff">${text}</text>
    </svg>
  `);
}

async function main() {
  const args = process.argv.slice(2);
  const screenId = args.find(arg => !arg.startsWith('--'));
  const variantFlagIndex = args.indexOf('--variant');
  const variantIndex =
    variantFlagIndex >= 0 ? Number(args[variantFlagIndex + 1]) : null;

  if (!screenId) {
    printUsage();
    process.exit(1);
  }

  if (!fs.existsSync(DESIGN_INDEX_PATH)) {
    console.error('scripts/design-index.json이 없다. 먼저 `npm run design-index`를 돌려라.');
    process.exit(1);
  }
  const designIndex = JSON.parse(fs.readFileSync(DESIGN_INDEX_PATH, 'utf8'));
  const entry = designIndex[screenId];
  if (!entry || entry.candidates.length === 0) {
    console.error(`design-index.json에 "${screenId}" 항목이 없다. 디자인 원본에서 이 Screen ID를 못 찾음.`);
    process.exit(1);
  }
  const candidates = entry.candidates;

  function printCandidates() {
    candidates.forEach((c, i) => {
      const tags = c.tags.length ? ` [${c.tags.join(',')}]` : '';
      console.error(`  [${i}] ${c.path}${tags}`);
    });
  }

  let chosen;
  if (variantIndex != null) {
    chosen = candidates[variantIndex];
    if (!chosen) {
      console.error(`--variant ${variantIndex}는 범위 밖이다. 이 ID엔 파일이 ${candidates.length}개 있다:`);
      printCandidates();
      process.exit(1);
    }
  } else if (entry.defaultIndex != null) {
    chosen = candidates[entry.defaultIndex];
    if (candidates.length > 1) {
      console.log(`이 ID엔 디자인 파일이 ${candidates.length}개 있음. 자동 선택: [${entry.defaultIndex}] ${chosen.path}`);
      console.log(`선택 이유: ${entry.defaultReason}`);
      console.log('다른 걸 쓰려면 --variant N:');
      printCandidates();
    }
  } else {
    console.error(`"${screenId}"는 후보가 ${candidates.length}개인데 기본값을 자동으로 못 골랐다.`);
    console.error(`이유: ${entry.defaultReason}`);
    console.error('--variant N으로 직접 골라라:');
    printCandidates();
    process.exit(1);
  }

  const designPath = chosen.path;
  if (!fs.existsSync(designPath)) {
    console.error(`디자인 파일이 없다: ${designPath}`);
    process.exit(1);
  }

  const actualPath = path.join(SHOTS_DIR, `${screenId}.png`);
  if (!fs.existsSync(actualPath)) {
    console.error(`캡처 파일이 없다: ${actualPath}`);
    console.error(`먼저 실행해라: npm run shot -- ${screenId}`);
    process.exit(1);
  }

  const designImage = sharp(designPath);
  const designMeta = await designImage.metadata();

  const actualImage = sharp(actualPath);
  const actualMeta = await actualImage.metadata();
  const actualScaledWidth = Math.round(actualMeta.width * ACTUAL_SCALE);
  const actualScaledHeight = Math.round(actualMeta.height * ACTUAL_SCALE);
  const actualResizedBuffer = await sharp(actualPath)
    .resize(actualScaledWidth, actualScaledHeight)
    .png()
    .toBuffer();

  const columnGapPx = 2; // 컬럼 사이 구분선 두께
  const canvasWidth = designMeta.width + GAP + columnGapPx + GAP + actualScaledWidth;
  const canvasHeight =
    LABEL_HEIGHT + Math.max(designMeta.height, actualScaledHeight);

  const designLabel = labelSvg(
    designMeta.width,
    LABEL_HEIGHT,
    `DESIGN ${designMeta.width}x${designMeta.height}`,
  );
  const actualLabel = labelSvg(
    actualScaledWidth,
    LABEL_HEIGHT,
    `ACTUAL ${actualMeta.width}x${actualMeta.height} -> ${actualScaledWidth}x${actualScaledHeight}`,
  );

  const actualX = designMeta.width + GAP + columnGapPx + GAP;

  const dividerBuffer = await sharp({
    create: {
      width: columnGapPx,
      height: canvasHeight,
      channels: 3,
      background: { r: 200, g: 200, b: 200 },
    },
  })
    .png()
    .toBuffer();

  const composite = sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  }).composite([
    { input: designLabel, left: 0, top: 0 },
    { input: designPath, left: 0, top: LABEL_HEIGHT },
    { input: dividerBuffer, left: designMeta.width + GAP, top: 0 },
    { input: actualLabel, left: actualX, top: 0 },
    { input: actualResizedBuffer, left: actualX, top: LABEL_HEIGHT },
  ]);

  fs.mkdirSync(PAIRS_DIR, { recursive: true });
  const outPath = path.join(PAIRS_DIR, `${screenId}.png`);
  await composite.png().toFile(outPath);

  console.log(`저장 완료: ${outPath}`);
  console.log(`캔버스: ${canvasWidth}x${canvasHeight}`);
}

main().catch(error => {
  console.error('make-pair 실패:');
  console.error(error);
  process.exit(1);
});
