/**
 * 디자인 원본(BILLIGE 폴더 — `화면명세서\`와 도메인별 크롭 목업 폴더가 들어 있는 루트)의 위치.
 * 개인 PC 경로를 저장소에 박지 않으려고 환경변수로만 받는다:
 *   BILLAGE_SPEC_ROOT="D:\design\BILLIGE" node scripts/build-design-index.js
 * (예전 이름 BILLAGE_DESIGN_DIR도 같은 뜻으로 받는다.)
 *
 * `scripts/design-index.json`과 `scripts/spec-sheet-map.tsv`의 경로는 전부 이 루트 기준 상대경로다.
 */
const fs = require('fs');
const path = require('path');

function getSpecRoot() {
  const root = process.env.BILLAGE_SPEC_ROOT || process.env.BILLAGE_DESIGN_DIR;
  if (!root) {
    console.error('디자인 원본 루트를 모른다. BILLAGE_SPEC_ROOT 환경변수로 BILLIGE 폴더 경로를 지정해라.');
    console.error('  예) BILLAGE_SPEC_ROOT="D:\\design\\BILLIGE" npm run design-index');
    process.exit(1);
  }
  if (!fs.existsSync(root)) {
    console.error(`BILLAGE_SPEC_ROOT가 가리키는 경로가 없다: ${root}`);
    process.exit(1);
  }
  return root;
}

/** 절대경로 → 루트 기준 상대경로('/' 구분, OS 무관). */
function toRelative(root, absolutePath) {
  return path.relative(root, absolutePath).split(path.sep).join('/');
}

/** 저장된 상대경로 → 이 PC의 절대경로. */
function fromRelative(root, relativePath) {
  return path.join(root, ...relativePath.split(/[\\/]/));
}

module.exports = { getSpecRoot, toRelative, fromRelative };
