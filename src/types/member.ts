/**
 * 납부 관리·모임원 명단용 사람 데이터(서버 `Member`). 가입 사용자/모임 관리자 권한
 * (`GroupMembership`)과는 별개 엔티티이며 자동 연결하지 않는다(API 공통 규칙 §17).
 * 총무가 [모임원 추가]로 별도 등록해야 이 명단에 올라간다. 권한 컬럼이 없다.
 *
 * DUE(회비) 도메인 화면이 아직 없어 이 타입을 쓰는 목 데이터·함수는 없다 — 타입만
 * 미리 갈라 둔다(api-type-design.md §1).
 */
export type Member = {
  memberId: string;
  groupId: string;
  name: string;
  phoneNumber: string | null;
  tags: string[];
  memo: string | null;
  createdAt: string;
};
