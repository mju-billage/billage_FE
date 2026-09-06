/** 여러 화면에서 공통으로 재사용하는 문구. */
export const NEXT_BUTTON_LABEL = '다음으로';
export const AGREEMENT_TAG_REQUIRED = '필수' as const;
export const AGREEMENT_TAG_OPTIONAL = '선택' as const;

// 기간 선택 바텀시트(`DuesDateRangeSheet`, Dues·Report 공용, DTB-3-SHEET-01-0)
/** 좌측 보조 버튼 기본 라벨 — 시안마다 문구가 다르다(내역 필터=`이전`, 보고서=`취소`)는
 * 진입 경로 차이(전자는 필터 시트로 복귀, 후자는 시트를 그냥 닫음)일 뿐이라 prop으로
 * 받되, 지금 실제로 이 시트를 쓰는 화면(Dues 생성·수정, Report 기간별 생성)은 전부
 * `취소`가 맞아 기본값으로 둔다. */
export const DATE_RANGE_SHEET_CANCEL_LABEL = '취소';
export const DATE_RANGE_SHEET_START_LABEL = '시작 날짜';
export const DATE_RANGE_SHEET_END_LABEL = '종료 날짜';
/** 미리보기 텍스트가 비어 있을 때 노출하는 placeholder(2자리 연도, 시안 그대로). */
export const DATE_RANGE_SHEET_DATE_PLACEHOLDER = 'YY.MM.DD';
