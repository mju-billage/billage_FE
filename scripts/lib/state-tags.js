/**
 * 디자인 파일 경로/화면명에서 "상태" 힌트를 뽑아내는 공용 로직.
 * build-design-index.js가 여러 이미지 중 기본값을 고를 때, 상태가 다른 이미지
 * (검색 상태 vs 기본 목록, 그리드 뷰 vs 리스트 뷰 등)를 구분하는 데 쓴다.
 */

const TAG_DEFINITIONS = [
  { tag: 'grid', patterns: [/grid/i, /그리드/] },
  { tag: 'list', patterns: [/list/i, /리스트/] },
  { tag: 'search', patterns: [/search/i, /검색/] },
  { tag: 'empty', patterns: [/empty/i, /빈\s?(목록|결과|상태)?/] },
  { tag: 'loading', patterns: [/loading/i, /로딩/] },
  { tag: 'error', patterns: [/error/i, /에러|오류/] },
];

function extractTags(text) {
  const tags = new Set();
  if (!text) {
    return tags;
  }
  for (const { tag, patterns } of TAG_DEFINITIONS) {
    if (patterns.some(pattern => pattern.test(text))) {
      tags.add(tag);
    }
  }
  return tags;
}

module.exports = { TAG_DEFINITIONS, extractTags };
