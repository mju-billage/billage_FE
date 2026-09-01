#!/usr/bin/env node
/**
 * 디자인 원본(BILLIGE 폴더)을 재귀 순회해 Screen ID → 이미지 파일 목록 인덱스를 만든다.
 * 결과는 scripts/design-index.json에 쓴다.
 *
 * 디자인 원본 경로는 저장소 밖(개인 PC 다운로드 폴더)이라 하드코딩하지 않고
 * BILLAGE_DESIGN_DIR 환경변수로 오버라이드 가능하게 뺐다. 기본값은 이 프로젝트를
 * 만든 개발자 PC 기준이므로, 다른 PC에서 쓸 땐 환경변수로 지정해라:
 *   BILLAGE_DESIGN_DIR="D:\design\BILLIGE" node scripts/build-design-index.js
 *
 * 같은 Screen ID에 이미지가 여러 장 있을 때(상태 변형 캡처, 폴더 중복 배치 등),
 * 파일 경로/화면명에서 상태 힌트(그리드/리스트/검색/빈 상태/로딩/에러)를 뽑아
 * design-verification.md §2의 화면명과 대조해 기본값을 고른다. 화면명에 언급 안 된
 * 상태(예: 검색)의 이미지가 섞여 있으면 그건 후보에서 빼고, 그래도 남은 후보가
 * 둘 이상이면(예: "그리드 뷰"/"리스트 뷰"처럼 화면명 자체가 여러 상태를 가리킴)
 * 기본값을 정하지 않는다 — make-pair.js가 --variant를 요구하게 된다.
 */

const fs = require('fs');
const path = require('path');
const { readPngSize } = require('./lib/png-size');
const { extractTags } = require('./lib/state-tags');

const DEFAULT_DESIGN_DIR = 'C:\\Users\\jotmd\\Downloads\\BILLIGE';
const DESIGN_DIR = process.env.BILLAGE_DESIGN_DIR || DEFAULT_DESIGN_DIR;

const OUTPUT_PATH = path.join(__dirname, 'design-index.json');
const VERIFICATION_DOC_PATH = path.join(__dirname, '..', 'docs', 'design-verification.md');

// Screen ID 형식: {영역코드}-{Depth}-{포맷}-{일련번호}-{변형}
// 파일명에 이 뒤로 추가 "-N"이 더 붙어 있으면(예: COM-2-PAGE-01-0-1.png) 같은
// Screen ID의 여러 파일(상태 변형/중복 배치) 중 하나라는 뜻이라 캡처 그룹엔 안 넣는다.
const SCREEN_ID_PATTERN =
  /(COM|DSH|DTB|FDR|DUE|ETC|ADD)-\d-(PAGE|MODAL|SHEET|SNACKBAR)-\d+-\d+/;

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);

function walk(dir, files) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (error) {
    console.error(`디렉터리를 못 읽음: ${dir}`);
    console.error(error.message);
    return;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
}

// design-verification.md §2 표에서 "| ☐ | `SCREEN_ID` | 화면명 | ..." 행을 읽어
// Screen ID → 화면명 맵을 만든다. 표 형식이 바뀌면(컬럼 순서 등) 이 파서도 같이 고쳐야 한다.
function loadScreenNames() {
  const map = {};
  let content;
  try {
    content = fs.readFileSync(VERIFICATION_DOC_PATH, 'utf8');
  } catch (error) {
    console.error(`design-verification.md를 못 읽음 (화면명 대조 건너뜀): ${error.message}`);
    return map;
  }
  const rowPattern = /^\|\s*☐\s*\|\s*`([A-Z]+-\d-[A-Z]+-\d+-\d+)`\s*\|\s*([^|]+?)\s*\|/;
  for (const line of content.split('\n')) {
    const match = line.match(rowPattern);
    if (match) {
      map[match[1]] = match[2];
    }
  }
  return map;
}

// 후보들 중 파일명이 정확히 "<screenId>.<ext>"인 것(추가 접미사 없는 "원본") 인덱스 목록.
function bareCandidateIndexes(candidates, screenId) {
  return candidates
    .map((c, i) => ({ i, base: path.basename(c.path).toLowerCase() }))
    .filter(({ base }) => {
      const ext = path.extname(base);
      return base === `${screenId.toLowerCase()}${ext}`;
    })
    .map(({ i }) => i);
}

function pickDefaultIndex(candidates, screenId, screenName) {
  const expectedTags = extractTags(screenName);

  if (expectedTags.size === 0) {
    // 화면명에 상태 힌트가 없다 — 태그 필터링 없이 "원본 파일명" 우선 규칙만 적용.
    const bare = bareCandidateIndexes(candidates, screenId);
    if (bare.length === 1) {
      return { index: bare[0], reason: '화면명에 상태 힌트 없음, 원본 파일명(-접미사 없음) 단독 후보' };
    }
    return { index: null, reason: bare.length === 0
      ? '화면명에 상태 힌트 없고, 원본 파일명 후보도 없음 — 후보 여러 개 중 선택 불가'
      : '화면명에 상태 힌트 없고, 원본 파일명 후보가 여러 개 — 선택 불가' };
  }

  const inScope = [];
  const offTopic = [];
  candidates.forEach((c, i) => {
    const tags = new Set(c.tags);
    const overlaps = [...tags].some(t => expectedTags.has(t));
    if (tags.size === 0 || overlaps) {
      inScope.push(i);
    } else {
      offTopic.push(i);
    }
  });

  if (inScope.length === 0) {
    return { index: null, reason: '화면명 상태 힌트와 일치하는 후보가 없음 — 전체 후보 검토 필요' };
  }
  if (inScope.length === 1) {
    return { index: inScope[0], reason: `화면명 상태 힌트(${[...expectedTags].join(',')})와 일치하는 후보가 하나뿐` };
  }

  const bareInScope = inScope.filter(i =>
    bareCandidateIndexes(candidates, screenId).includes(i),
  );
  if (bareInScope.length === 1) {
    return { index: bareInScope[0], reason: `화면명 상태 힌트와 맞는 후보 중 원본 파일명 단독 후보 (제외됨: ${offTopic.length}개 상태 불일치)` };
  }

  return {
    index: null,
    reason: `화면명이 여러 상태(${[...expectedTags].join(',')})를 동시에 가리켜 자동 선택 불가 (제외됨: ${offTopic.length}개 상태 불일치) — --variant로 직접 골라야 함`,
  };
}

function main() {
  if (!fs.existsSync(DESIGN_DIR)) {
    console.error(`디자인 원본 경로가 없다: ${DESIGN_DIR}`);
    console.error('BILLAGE_DESIGN_DIR 환경변수로 실제 경로를 지정해라.');
    process.exit(1);
  }

  const screenNames = loadScreenNames();

  const allFiles = [];
  walk(DESIGN_DIR, allFiles);

  const rawGroups = {};
  const skippedNoId = [];

  for (const filePath of allFiles) {
    const ext = path.extname(filePath).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) {
      continue;
    }
    const basename = path.basename(filePath);
    const match = basename.match(SCREEN_ID_PATTERN);
    if (!match) {
      skippedNoId.push(filePath);
      continue;
    }
    const screenId = match[0];

    let resolution = null;
    try {
      const buffer = fs.readFileSync(filePath);
      resolution = readPngSize(buffer);
    } catch (error) {
      resolution = null;
    }

    if (!rawGroups[screenId]) {
      rawGroups[screenId] = [];
    }
    rawGroups[screenId].push({
      path: filePath,
      resolution: resolution ? `${resolution.width}x${resolution.height}` : null,
      tags: [...extractTags(filePath)],
    });
  }

  const index = {};
  let ambiguousCount = 0;
  for (const [screenId, rawCandidates] of Object.entries(rawGroups)) {
    const candidates = [...rawCandidates].sort((a, b) => a.path.localeCompare(b.path));
    const screenName = screenNames[screenId] || null;
    const picked = candidates.length === 1
      ? { index: 0, reason: '후보 1개뿐' }
      : pickDefaultIndex(candidates, screenId, screenName);
    if (picked.index === null) {
      ambiguousCount += 1;
    }
    index[screenId] = {
      screenName,
      candidates,
      defaultIndex: picked.index,
      defaultReason: picked.reason,
    };
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(index, null, 2) + '\n');

  const screenIdCount = Object.keys(index).length;
  const fileCount = Object.values(index).reduce((sum, entry) => sum + entry.candidates.length, 0);
  console.log(`디자인 원본: ${DESIGN_DIR}`);
  console.log(`인덱싱된 Screen ID: ${screenIdCount}개 (이미지 파일 ${fileCount}개)`);
  console.log(`Screen ID 없어서 제외된 이미지: ${skippedNoId.length}개 (아이콘/컴포넌트 시안 등)`);
  console.log(`기본값 자동 선택 불가(여러 장 + 판단 불가): ${ambiguousCount}개 — make-pair.js 실행 시 --variant 필요`);
  console.log(`결과: ${OUTPUT_PATH}`);

  // 대표 해상도 집계
  const resolutionCounts = {};
  for (const entry of Object.values(index)) {
    for (const candidate of entry.candidates) {
      if (!candidate.resolution) {
        continue;
      }
      resolutionCounts[candidate.resolution] = (resolutionCounts[candidate.resolution] || 0) + 1;
    }
  }
  const sorted = Object.entries(resolutionCounts).sort((a, b) => b[1] - a[1]);
  console.log('\n해상도 분포 (상위 5개):');
  sorted.slice(0, 5).forEach(([resolution, count]) => {
    console.log(`  ${resolution}: ${count}장`);
  });
}

main();
