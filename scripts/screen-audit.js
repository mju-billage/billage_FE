#!/usr/bin/env node
/**
 * `docs/design-verification.md` §2와 `src/screens/**`의 `@screen <ID>` JSDoc 주석을
 * 서로 대조한다. 2026-09-11까지 문서가 낡아 코드는 이미 있는데 `[미구현]`으로
 * 남아 있는 행이 세 라운드 연속 발견됐다(배치 D/E/F) — 손으로 매번 찾는 대신
 * 이 스크립트로 반복 가능하게 만든다.
 *
 * 사용법: node scripts/screen-audit.js (npm run screen-audit)
 *
 * 확인하는 두 방향:
 *  1. 코드에 `@screen` 주석은 있는데 문서가 `[미구현]`인 행 — 문서 갱신 누락 후보
 *  2. 문서가 `[구현]`인데 코드 어디에도 그 ID의 `@screen` 주석이 없는 행 — 문서 오기
 *     또는 주석 누락 후보(코드 자체는 있는데 주석만 안 달았을 수도 있어 참고용)
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const SCREENS_DIR = path.join(REPO_ROOT, 'src', 'screens');
const DESIGN_VERIFICATION_PATH = path.join(REPO_ROOT, 'docs', 'design-verification.md');

const SCREEN_ID_PATTERN = /^[A-Z]+-\d+-[A-Z]+-\d+(-\d+)?$/;

/** src/screens 아래 .tsx 파일을 전부 찾는다. */
function listScreenFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listScreenFiles(fullPath));
    } else if (entry.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

/** 파일 하나에서 `@screen <ID>` 주석을 전부 뽑는다(파일당 여러 개 가능). */
function extractScreenIdsFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const ids = [];
  const regex = /@screen\s+([A-Za-z0-9-]+)/g;
  let match = regex.exec(content);
  while (match) {
    if (SCREEN_ID_PATTERN.test(match[1])) {
      ids.push(match[1]);
    }
    match = regex.exec(content);
  }
  return ids;
}

/** 코드 전체에서 Screen ID → 주석이 있는 파일 목록(상대경로) 맵을 만든다. */
function buildCodeScreenMap() {
  const map = new Map();
  for (const filePath of listScreenFiles(SCREENS_DIR)) {
    const relativePath = path.relative(REPO_ROOT, filePath).replace(/\\/g, '/');
    for (const id of extractScreenIdsFromFile(filePath)) {
      if (!map.has(id)) {
        map.set(id, []);
      }
      map.get(id).push(relativePath);
    }
  }
  return map;
}

/** design-verification.md §2 표에서 `| ☐ | \`ID\` | ... | \`[상태]\` | ...` 행을 전부 뽑는다. */
function extractDocRows() {
  const content = fs.readFileSync(DESIGN_VERIFICATION_PATH, 'utf8');
  const rows = [];
  const lineRegex = /^\|\s*☐\s*\|\s*`([A-Za-z0-9-]+)`\s*\|(.*)$/gm;
  let match = lineRegex.exec(content);
  while (match) {
    const id = match[1];
    const rest = match[2];
    const statusMatch = rest.match(/`\[([^\]]+)\]`/);
    if (SCREEN_ID_PATTERN.test(id) && statusMatch) {
      rows.push({ id, status: statusMatch[1] });
    }
    match = lineRegex.exec(content);
  }
  return rows;
}

function main() {
  const codeScreenMap = buildCodeScreenMap();
  const docRows = extractDocRows();

  // 문서 한 ID가 여러 행(탭 상태 등 변형)으로 나올 수 있어 첫 행 기준으로만 본다.
  const docStatusById = new Map();
  for (const row of docRows) {
    if (!docStatusById.has(row.id)) {
      docStatusById.set(row.id, row.status);
    }
  }

  const codeExistsButDocMissing = [];
  const docImplementedButNoCode = [];

  for (const [id, status] of docStatusById) {
    const codeFiles = codeScreenMap.get(id);
    if (codeFiles && status === '미구현') {
      codeExistsButDocMissing.push({ id, files: codeFiles });
    }
    if (!codeFiles && status === '구현') {
      docImplementedButNoCode.push({ id });
    }
  }

  console.log(`검사한 문서 행: ${docStatusById.size}개, 코드에서 찾은 @screen ID: ${codeScreenMap.size}개\n`);

  console.log(
    `[1] 코드에 @screen 주석은 있는데 문서가 [미구현]인 행 — ${codeExistsButDocMissing.length}건`,
  );
  for (const item of codeExistsButDocMissing) {
    console.log(`  - ${item.id} → ${item.files.join(', ')}`);
  }

  console.log(
    `\n[2] 문서가 [구현]인데 코드에 @screen 주석이 없는 행 — ${docImplementedButNoCode.length}건`,
  );
  for (const item of docImplementedButNoCode) {
    console.log(`  - ${item.id}`);
  }

  console.log('\n(참고) [2]는 코드 자체가 없다는 뜻이 아니라 @screen 주석만 안 달렸을 수도 있다 — 각 행을 직접 열어 확인할 것.');
}

main();
