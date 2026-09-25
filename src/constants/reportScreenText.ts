/** 보고서 생성 5화면(ETC-2-PAGE-04-0/ETC-3-SHEET-05-0/ETC-4-PAGE-03-0/
 * ETC-5-PAGE-01-0/ETC-4-PAGE-04-0) 전용 문구. 조회 플로우(보고서 상세)는
 * 다음 단계 대상이라 이 파일에 없다. */

// 보고서 생성 메인 (ETC-2-PAGE-04-0)
export const REPORT_MAIN_TITLE = '보고서 생성';
export const REPORT_TAB_BY_LEDGER = '장부별';
export const REPORT_TAB_BY_PERIOD = '기간별';
export const REPORT_MAIN_COUNT_SUFFIX = '건';
export const REPORT_MAIN_EMPTY_BY_LEDGER = '장부별 보고서를 생성해보세요.';
export const REPORT_MAIN_EMPTY_BY_PERIOD = '기간별 보고서를 생성해보세요.';
export const REPORT_MAIN_LOADING = '보고서 목록을 불러오는 중이에요.';
export const REPORT_MAIN_LOADING_MORE = '불러오는 중이에요.';
export const REPORT_MAIN_RETRY_LABEL = '다시 시도';

// 보고서 생성하기 바텀시트 (ETC-3-SHEET-05-0)
export const REPORT_CREATE_SHEET_TITLE = '보고서 생성';
export const REPORT_CREATE_SHEET_BY_LEDGER_LABEL = '장부별 보고서 생성하기';
export const REPORT_CREATE_SHEET_BY_PERIOD_LABEL = '기간별 보고서 생성하기';

// 장부별/기간별 생성 폼 공통 (ETC-4-PAGE-03-0 / ETC-4-PAGE-04-0)
export const REPORT_TITLE_FIELD_LABEL = '보고서 제목';
export const REPORT_TITLE_PLACEHOLDER = '제목을 입력해주세요.';
/** Report.txt "title: 필수, 공백 불가, 최대 20자". */
export const REPORT_TITLE_MAX_LENGTH = 20;
export const REPORT_TYPE_FIELD_LABEL = '구분';
export const REPORT_SUBMIT_LABEL = '생성하기';
export const REPORT_LEAVE_TITLE = '보고서 생성을 그만둘까요?';
export const REPORT_LEAVE_DESCRIPTION = '작성중인 내용은 저장되지 않아요.';
export const REPORT_LEAVE_CANCEL_LABEL = '취소';
export const REPORT_LEAVE_CONFIRM_LABEL = '그만두기';
export const SNACKBAR_REPORT_CREATED = '보고서가 생성되었어요.';

// 장부별 생성 (ETC-4-PAGE-03-0)
export const REPORT_BY_LEDGER_TITLE = '장부별 보고서 생성';
export const REPORT_LEDGER_FIELD_LABEL = '장부';
export const REPORT_LEDGER_FIELD_COUNT_SUFFIX = '건';
export const REPORT_LEDGER_SELECT_LABEL = '선택하기';

// 장부 선택 (ETC-5-PAGE-01-0)
export const REPORT_LEDGER_SELECT_TITLE = '장부 선택';
export const REPORT_LEDGER_SELECT_SEARCH_PLACEHOLDER = '검색어를 입력해주세요.';
export const REPORT_LEDGER_SELECT_COUNT_SUFFIX = '건';
export const REPORT_LEDGER_SELECT_ITEM_COUNT_SUFFIX = '개의 항목';
export const REPORT_LEDGER_SELECT_EMPTY = '표시할 폴더·장부가 없어요.';
export const REPORT_LEDGER_SELECT_LOADING = '불러오는 중이에요.';
export const REPORT_LEDGER_SELECT_RETRY_LABEL = '다시 시도';
export const REPORT_LEDGER_SELECT_CONFIRM_SUFFIX = '개 선택하기';

// 기간별 생성 (ETC-4-PAGE-04-0)
export const REPORT_BY_PERIOD_TITLE = '기간별 보고서 생성';
export const REPORT_PERIOD_FIELD_LABEL = '기간';
export const REPORT_PERIOD_PLACEHOLDER = 'YY.MM.DD ~ YY.MM.DD';

// 조회 플로우 공통 (ETC-3-PAGE-02-0 / ETC-3-PAGE-03-0 / ETC-4-PAGE-05-0 / ETC-4-PAGE-07-0)
export const REPORT_DETAIL_CREATED_AT_LABEL = '생성 일시';
export const REPORT_DETAIL_PERIOD_LABEL = '기간';
export const REPORT_DETAIL_LOADING = '보고서를 불러오는 중이에요.';
export const REPORT_DETAIL_EMPTY = '포함된 장부가 없어요.';
export const REPORT_DETAIL_INCOME_LABEL = '수입';
export const REPORT_DETAIL_EXPENSE_LABEL = '지출';
export const REPORT_ENTRY_LIST_EMPTY = '내역이 없어요.';
export const REPORT_ENTRY_LIST_COUNT_SUFFIX = '건';
/** `Share.share()` 메시지 조립용 — 서버 웹뷰/PDF 응답이 없어(Report.txt 정책 메모)
 * 텍스트 요약만 공유한다. */
export const REPORT_SHARE_INCOME_LABEL = '수입';
export const REPORT_SHARE_EXPENSE_LABEL = '지출';

// 장부 상세 내역 (ETC-4-PAGE-05-0, 장부별·기간별 공용)
export const REPORT_LEDGER_ENTRIES_TAB_ALL = '전체';
export const REPORT_LEDGER_ENTRIES_TAB_INCOME = '수입';
export const REPORT_LEDGER_ENTRIES_TAB_EXPENSE = '지출';

// 상세 내역 조회 (ETC-5-PAGE-02-0, 전체 조회 플로우 공용 착지점)
export const REPORT_ENTRY_DETAIL_TITLE = '상세 내역';
export const REPORT_ENTRY_DETAIL_LEDGER_LABEL = '장부';
export const REPORT_ENTRY_DETAIL_TYPE_LABEL = '구분';
export const REPORT_ENTRY_DETAIL_DATE_LABEL = '발생일';
export const REPORT_ENTRY_DETAIL_AMOUNT_LABEL = '금액';
export const REPORT_ENTRY_DETAIL_TITLE_LABEL = '내역명';
/**
 * 이 화면은 보고서 생성 시점 스냅샷만 보여준다 — 원본 내역이 이후 수정·삭제돼도
 * 안 바뀐다(Report.txt 정책 메모). **영수증·메모가 아예 안 보이는 건 스냅샷에
 * 그 필드가 없어서다(entryId도 없음 — `services/reportService.ts`
 * 주석) — 시안은 원래 영수증 원본·상세 메모까지 조회 가능하다고 적었으니 지금은
 * 임시로 빠진 상태다(서버가 스냅샷에
 * memo/receipts를 추가해주면 채울 것).** 문구도 "원래 이렇게 설계됐다"처럼
 * 안 읽히게 "아직"을 넣어 임시 상태임을 드러낸다.
 */
export const REPORT_ENTRY_DETAIL_SNAPSHOT_NOTICE =
  '이 내역은 보고서 생성 시점 기준이에요. 원본이 나중에 바뀌어도 반영되지 않고, 영수증·메모는 아직 이 화면에서 볼 수 없어요.';
