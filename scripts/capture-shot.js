#!/usr/bin/env node
/**
 * Screen ID를 받아 안드로이드 에뮬레이터 화면을 shots/<SCREEN_ID>.png로 저장한다.
 *
 * PowerShell에서 `adb exec-out screencap -p > file.png`는 리다이렉트가 바이너리를
 * 텍스트로 취급해 깨뜨린다(CRLF 변환 등). 여기서는 셸 리다이렉트를 아예 안 쓰고
 * execFileSync로 adb의 stdout을 Buffer로 직접 받아 fs.writeFileSync한다.
 *
 * 사용법:
 *   node scripts/capture-shot.js <SCREEN_ID> [--force]
 *   npm run shot -- <SCREEN_ID> [--force]
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { readPngSize } = require('./lib/png-size');

const SHOTS_DIR = path.join(__dirname, '..', 'shots');
const SCREEN_ID_PATTERN = /^(COM|DSH|DTB|FDR|DUE|ETC|ADD)-\d-(PAGE|MODAL|SHEET|SNACKBAR)-\d+-\d+$/;

function printUsage() {
  console.error('사용법: node scripts/capture-shot.js <SCREEN_ID> [--force]');
  console.error('예:     node scripts/capture-shot.js DTB-1-PAGE-01-0');
}

function checkDeviceConnected() {
  let output;
  try {
    output = execFileSync('adb', ['devices'], { encoding: 'utf8' });
  } catch (error) {
    console.error('adb 실행 실패. adb가 PATH에 있는지, 안드로이드 SDK가 설치돼 있는지 확인해라.');
    console.error(error.message);
    process.exit(1);
  }

  const deviceLines = output
    .split('\n')
    .slice(1)
    .map(line => line.trim())
    .filter(line => line.endsWith('\tdevice') || line.endsWith(' device'));

  if (deviceLines.length === 0) {
    console.error('연결된 안드로이드 기기/에뮬레이터가 없다.');
    console.error('에뮬레이터를 켜거나 `adb devices`로 상태를 확인해라.');
    process.exit(1);
  }
  if (deviceLines.length > 1) {
    console.error('연결된 기기가 여러 개다. 어느 기기에서 캡처할지 특정할 수 없다:');
    deviceLines.forEach(line => console.error(`  ${line}`));
    console.error('불필요한 기기를 끄거나 -s <serial> 옵션 지원이 필요하면 스크립트를 확장해라.');
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const screenId = args.find(arg => !arg.startsWith('--'));

  if (!screenId) {
    printUsage();
    process.exit(1);
  }
  if (!SCREEN_ID_PATTERN.test(screenId)) {
    console.error(`"${screenId}"가 Screen ID 형식({COM|DSH|DTB|FDR|DUE|ETC|ADD}-N-{PAGE|MODAL|SHEET|SNACKBAR}-NN-N)과 안 맞는다.`);
    console.error('그래도 계속 진행한다(오타 확인만 해두면 됨).');
  }

  const destPath = path.join(SHOTS_DIR, `${screenId}.png`);
  if (fs.existsSync(destPath) && !force) {
    console.error(`이미 있음: ${destPath}`);
    console.error('덮어쓰려면 --force를 붙여라.');
    process.exit(1);
  }

  checkDeviceConnected();

  fs.mkdirSync(SHOTS_DIR, { recursive: true });

  let pngBuffer;
  try {
    pngBuffer = execFileSync('adb', ['exec-out', 'screencap', '-p'], {
      encoding: 'buffer',
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch (error) {
    console.error('adb exec-out screencap 실패:');
    console.error(error.message);
    process.exit(1);
  }

  if (!pngBuffer || pngBuffer.length === 0) {
    console.error('캡처 결과가 0바이트다. 에뮬레이터 화면이 켜져 있는지 확인해라.');
    process.exit(1);
  }

  fs.writeFileSync(destPath, pngBuffer);

  const size = readPngSize(pngBuffer);
  const kb = (pngBuffer.length / 1024).toFixed(1);
  if (!size) {
    console.error(`저장은 했지만 PNG 헤더를 못 읽었다 — 파일이 깨졌을 수 있다. (${destPath}, ${kb}KB)`);
    process.exit(1);
  }

  console.log(`저장 완료: ${destPath}`);
  console.log(`크기: ${kb}KB, 해상도: ${size.width}x${size.height}`);
}

main();
