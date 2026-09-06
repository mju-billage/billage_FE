/** 일괄 등록 입력을 쉼표·띄어쓰기·줄바꿈(`[,\s]+`)으로 잘라 이름 목록을 만든다.
 * 서버가 `names` 원문을 자르는 규칙과 동일하다(Member.txt §3) — 버튼 활성화
 * 여부와 클라이언트 사전 검증에만 쓰고, 서버에는 원문 문자열을 그대로 보낸다. */
export function parseMemberNames(text: string): string[] {
  return text
    .split(/[,\s]+/)
    .map(name => name.trim())
    .filter(name => name.length > 0);
}
