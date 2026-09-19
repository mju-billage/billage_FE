#!/usr/bin/env node
/**
 * 디자인 원본(BILLIGE 폴더)을 재귀 순회해 Screen ID → 이미지 파일 목록 인덱스를 만든다.
 * 결과는 scripts/design-index.json에 쓴다.
 *
 * 디자인 원본 경로는 저장소 밖(개인 PC)이라 코드에 박지 않고 BILLAGE_SPEC_ROOT
 * 환경변수로만 받는다(없으면 안내 후 종료, `lib/spec-root.js`). 출력 JSON의 경로는
 * 전부 이 루트 기준 상대경로라 개인 경로가 저장소에 남지 않는다:
 *   BILLAGE_SPEC_ROOT="D:\design\BILLIGE" node scripts/build-design-index.js
 *
 * 같은 Screen ID에 이미지가 여러 장 있을 때(상태 변형 캡처, 폴더 중복 배치 등),
 * 파일 경로/화면명에서 상태 힌트(그리드/리스트/검색/빈 상태/로딩/에러)를 뽑아
 * design-verification.md §2의 화면명과 대조해 기본값을 고른다. 화면명에 언급 안 된
 * 상태(예: 검색)의 이미지가 섞여 있으면 그건 후보에서 빼고, 그래도 남은 후보가
 * 둘 이상이면(예: "그리드 뷰"/"리스트 뷰"처럼 화면명 자체가 여러 상태를 가리킴)
 * 기본값을 정하지 않는다 — make-pair.js가 --variant를 요구하게 된다.
 *
 * ⚠️ **이 인덱스는 `화면명세서\` 폴더(원본 스펙시트, [기능]/[데이터]/[상태]/[액션]
 * UI 요소 표가 있는 파일)를 포함하지 않는다 — 구조적 한계다.** `SCREEN_ID_PATTERN`은
 * 파일명에 Screen ID 문자열이 그대로 박혀 있어야 잡아내는데(`ETC-3-PAGE-03-0.png`류),
 * `화면명세서\` 하위 파일은 전부 한글 기능명으로만 돼 있고(`더보기_기록보관_상세보기.png`)
 * Screen ID는 이미지 안 표 셀에만 적혀 있어 OCR 없이는 매칭이 안 된다 — 그래서 전부
 * `skippedNoId`(파일명에서 Screen ID 추출 실패)로 빠진다(2026-09-12, `ETC-3-PAGE-03-0`
 * 작업 중 발견 — design-index가 가리킨 크롭 목업엔 UI 요소 표가 없어서 [액션]/[상태]를
 * 못 보고 놓쳤었다). **이 인덱스가 가리키는 파일은 항상 크롭 목업(표 없음)이다 — [기능]/
 * [데이터]/[상태]/[액션] 판단이 필요하면 `화면명세서\` 아래 해당 도메인 폴더에서 원본
 * 스펙시트를 직접 찾아 읽어야 한다.** 아래 `main()`의 콘솔 로그가 `화면명세서` 하위
 * skip 개수를 별도로 보여준다.
 *
 * **2026-09-12 `specSheet` 필드 추가** — 정규식으로는 원본 스펙시트를 못 찾으므로(위
 * 문단) `scripts/spec-sheet-map.tsv`(손으로 채우는 매핑 표, ScreenID/specSheetPath/
 * 확인방법/비고 4열)를 읽어 각 ID에 `specSheet` 배열(있으면)로 얹는다. 크롭
 * `candidates`는 그대로 두고 **추가 필드**로만 붙인다 — 이 TSV는 점진적으로 채우는
 * 표라 대부분의 ID는 여전히 `specSheet`가 없다(빈 배열), 그게 정상이다.
 */

const fs = require('fs');
const path = require('path');
const { readPngSize } = require('./lib/png-size');
const { extractTags } = require('./lib/state-tags');

const { getSpecRoot, toRelative } = require('./lib/spec-root');

// 모듈 로드 시점이 아니라 main()에서 채운다 — 환경변수가 없으면 거기서 안내하고 종료.
let DESIGN_DIR = '';

const OUTPUT_PATH = path.join(__dirname, 'design-index.json');
const VERIFICATION_DOC_PATH = path.join(__dirname, '..', 'docs', 'design-verification.md');
const SPEC_SHEET_MAP_PATH = path.join(__dirname, 'spec-sheet-map.tsv');

/** `spec-sheet-map.tsv`(ScreenID\tspecSheetPath\t확인방법\t비고)를 읽어
 * ID → [{specSheetPath, 확인방법, 비고}] 맵을 만든다. specSheetPath가 빈 행(아직
 * 미확인인 후보만 있는 행)은 스킵한다 — `candidates`처럼 "실제로 가리키는 파일"만
 * 싣는다, 후보 추정은 TSV의 `비고` 열에만 남긴다.
 *
 * `ScreenID` 칸이 `(ID없음)`/`(미확인)`처럼 괄호로 싸인 행은 **실제 Screen ID가
 * 아니다** — 표 헤더가 비어 있거나 아직 안 읽은 파일이라는 뜻이라 design-index.json에
 * 가짜 키로 넣지 않는다(대신 `unresolvedSpecSheets`로 따로 모아 통계에만 반영). */
function loadSpecSheetMap() {
  const map = new Map();
  const unresolved = [];
  let content;
  try {
    content = fs.readFileSync(SPEC_SHEET_MAP_PATH, 'utf8');
  } catch (error) {
    console.error(`spec-sheet-map.tsv를 못 읽음 (specSheet 필드 없이 진행): ${error.message}`);
    return { map, unresolved };
  }
  const lines = content.split('\n').slice(1); // 헤더 제외
  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }
    const [screenId, specSheetPath, 확인방법, 비고] = line.split('\t');
    if (!screenId || !specSheetPath || !specSheetPath.trim()) {
      continue;
    }
    const entry = {
      // TSV의 경로는 이미 루트 기준 상대경로 — 구분자만 '/'로 통일해 그대로 싣는다.
      specSheetPath: specSheetPath.trim().split(/[\\/]/).join('/'),
      확인방법: (확인방법 || '').trim(),
      비고: (비고 || '').trim(),
    };
    if (/^\(.*\)$/.test(screenId.trim())) {
      unresolved.push({ screenId: screenId.trim(), ...entry });
      continue;
    }
    if (!map.has(screenId)) {
      map.set(screenId, []);
    }
    map.get(screenId).push(entry);
  }
  return { map, unresolved };
}

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
  DESIGN_DIR = getSpecRoot();

  const screenNames = loadScreenNames();
  const { map: specSheetMap, unresolved: unresolvedSpecSheets } = loadSpecSheetMap();

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
      path: toRelative(DESIGN_DIR, filePath),
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
      specSheet: specSheetMap.get(screenId) || [],
    };
  }
  // 크롭 후보가 아예 없는 ID인데 spec-sheet-map.tsv엔 매핑이 있는 경우도 놓치지 않는다.
  for (const [screenId, entries] of specSheetMap) {
    if (!index[screenId]) {
      index[screenId] = {
        screenName: screenNames[screenId] || null,
        candidates: [],
        defaultIndex: null,
        defaultReason: '크롭 후보 없음 — spec-sheet-map.tsv 매핑만 존재',
        specSheet: entries,
      };
    }
  }

  const skippedSpecSheetCount = skippedNoId.filter(p =>
    p.includes(`${path.sep}화면명세서${path.sep}`),
  ).length;

  const idsWithSpecSheet = Object.values(index).filter(e => e.specSheet.length > 0).length;
  const mappedSpecSheetFiles = new Set();
  for (const entries of specSheetMap.values()) {
    for (const e of entries) {
      mappedSpecSheetFiles.add(e.specSheetPath);
    }
  }
  for (const u of unresolvedSpecSheets) {
    mappedSpecSheetFiles.add(u.specSheetPath);
  }
  const idConfirmedCount = unresolvedSpecSheets.filter(u => u.screenId !== '(미확인)').length; // (ID없음) 등 헤더는 읽었으나 ID가 비어 있는 것

  const output = {
    _meta: {
      warning:
        '이 인덱스는 화면명세서(원본 스펙시트, UI 요소 표 있음) 폴더를 포함하지 않는다 — ' +
        '파일명이 한글이라 Screen ID 패턴 매칭이 안 되는 구조적 한계다(build-design-index.js ' +
        '상단 주석 참고). 각 Screen ID의 candidates는 전부 크롭 목업(표 없음)이다. ' +
        '[기능]/[데이터]/[상태]/[액션] 판단이 필요하면 specSheet 필드(scripts/spec-sheet-map.tsv ' +
        '기반)를 먼저 보고, 없으면 화면명세서\\<도메인> 폴더에서 원본 스펙시트를 직접 찾아 읽어라.',
      specSheetsSkipped: skippedSpecSheetCount,
      specSheetMapCoverage: `${mappedSpecSheetFiles.size}/${skippedSpecSheetCount}장 매핑(그중 ID 미확정 ${idConfirmedCount}장), ${idsWithSpecSheet}/${Object.keys(index).length}개 ID가 specSheet 보유 (scripts/spec-sheet-map.tsv)`,
      unresolvedSpecSheets,
    },
    ...index,
  };
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + '\n');

  const screenIdCount = Object.keys(index).length;
  const fileCount = Object.values(index).reduce((sum, entry) => sum + entry.candidates.length, 0);
  console.log(`디자인 원본 루트(BILLAGE_SPEC_ROOT): ${DESIGN_DIR}`);
  console.log(`인덱싱된 Screen ID: ${screenIdCount}개 (이미지 파일 ${fileCount}개, 전부 크롭 목업)`);
  console.log(`Screen ID 없어서 제외된 이미지: ${skippedNoId.length}개 (그중 화면명세서\\ 하위 원본 스펙시트: ${skippedSpecSheetCount}개, 나머지는 아이콘/컴포넌트 시안 등)`);
  console.log(`⚠️ 원본 스펙시트(화면명세서\\)는 크롭 인덱스엔 없다 — scripts/spec-sheet-map.tsv로 손매핑 중: ${mappedSpecSheetFiles.size}/${skippedSpecSheetCount}장 매핑(ID 미확정 ${idConfirmedCount}장 포함), ${idsWithSpecSheet}/${screenIdCount}개 ID가 specSheet 보유`);
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
