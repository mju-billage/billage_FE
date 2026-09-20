/** 폴더 탭(FolderScreen 및 관련 화면) 전용 문구. */
export const FOLDER_SCREEN_TITLE = '폴더';
export const FOLDER_SEARCH_PLACEHOLDER = '검색어를 입력해주세요.';
export const FOLDER_EMPTY_TITLE = '아직 폴더 및 장부가 존재하지 않아요.';
export const FOLDER_EMPTY_SUBTITLE =
  '새로운 장부를 생성하여 내역을 관리해보세요.';
/** 폴더 목록 개수 단위(폴더는 `개`, 장부 내역 목록은 `건` — `LEDGER_COUNT_SUFFIX`, 의도된 구분이라 통일하지 말 것).
 * 시안 목업은 "6 개"(숫자와 단위 사이 공백 있음), 설명표는 "{N}개" — 불일치 #11, 목업을 따른다.
 * 폴더 메인·폴더 상세는 같은 화면(`FolderScreen`)이라 이 상수 하나를 쓴다. 폴더 상세 목업만 "2 건"인데
 * 설명표(No.3 "{N}개")를 따라 단위는 `개`로 통일 — 불일치 #13(같은 시트 Case A 목업은 "2 개", 메인 프레임만 "2 건"이라 시안 내부 오기로 확정, 기획 확인 불필요). */
export const FOLDER_COUNT_SUFFIX = '개';
export const FOLDER_SEARCH_EMPTY_TITLE = '해당 검색어에 대한 내역이 없어요.';
export const FOLDER_SEARCH_EMPTY_SUBTITLE = '검색어를 다시 입력해주세요.';
/** 로딩/에러 문구 — 디자인 시안에 해당 상태가 없어 최소 형태로 통일(api-integration-plan.md "표준 패턴" 참고). */
export const FOLDER_LOADING = '폴더 정보를 불러오는 중이에요.';
export const FOLDER_RETRY_LABEL = '다시 시도';
/** 장부 목록(하위 폴더 아님)이 아직 없어 예산이 null일 때 표시하는 서브타이틀.
 * 목록 API(`GET /folders/{folderId}/ledgers`)엔 생성일이 없어(docs/api-gaps.md
 * 필드 공백) 디자인 시안의 날짜 대신 예산 상태를 보여준다. */
export const LEDGER_ITEM_BUDGET_UNSET = '예산 미설정';

export const NEW_ITEM_SHEET_LEDGER_LABEL = '새 장부 생성하기';
export const NEW_ITEM_SHEET_FOLDER_LABEL = '새 폴더 생성하기';

export const FOLDER_MENU_SELECT_MOVE = '선택 이동';
export const FOLDER_MENU_RENAME = '폴더 이름 변경';
export const FOLDER_MENU_UNLINK = '폴더 해제';
/** 시안(폴더_메인화면.png Case A)이 "예산 설정"으로 고정 노출 — 예전엔
 * "전체 예산 설정"이었다(2026-09-18 정정). */
export const FOLDER_MENU_BUDGET_LIST = '예산 설정';
export const FOLDER_MENU_BACKUP = '전체 백업';

export const VIEW_TOGGLE_GRID_LABEL = '그리드';
export const VIEW_TOGGLE_LIST_LABEL = '리스트';

/** 폴더명 공통 제약(공통규칙 §4 / Folder.txt "최대 20자"). */
export const FOLDER_NAME_MAX_LENGTH = 20;

export const NEW_FOLDER_DIALOG_TITLE = '새 폴더 생성하기';
export const NEW_FOLDER_NAME_PLACEHOLDER = '폴더 이름을 입력해주세요.';
export const NEW_FOLDER_CREATE_LABEL = '생성';

export const RENAME_FOLDER_DIALOG_TITLE = '폴더 이름 변경하기';
export const RENAME_NAME_PLACEHOLDER = '변경할 이름을 입력해주세요.';
export const RENAME_CONFIRM_LABEL = '변경';

export const UNLINK_FOLDER_DIALOG_TITLE = '폴더를 해제하시겠습니까?';
export const UNLINK_FOLDER_DIALOG_DESCRIPTION =
  '폴더 내 항목은 삭제되지 않습니다.';
export const UNLINK_CONFIRM_LABEL = '해제';

export const BACKUP_DIALOG_TITLE = '현재까지 장부를 모두 보관할까요?';
export const BACKUP_DIALOG_DESCRIPTION = '보관된 장부는 수정이 불가합니다.';
export const BACKUP_TITLE_PLACEHOLDER = '보관 제목을 입력해주세요.';
export const BACKUP_CONFIRM_LABEL = '보관';

export const SNACKBAR_FOLDER_CREATED_SUFFIX = ' 폴더가 생성되었어요.';
export const SNACKBAR_FOLDER_RENAMED = '폴더 이름이 변경되었어요.';
export const SNACKBAR_FOLDER_UNLINKED_SUFFIX = ' 폴더가 해제되었어요.';
export const SNACKBAR_FOLDER_MOVED = '폴더 이동이 완료되었어요.';
export const SNACKBAR_LEDGER_CREATED_SUFFIX = ' 장부가 생성되었어요.';
export const SNACKBAR_BACKUP_DONE_TITLE = '모든 장부가 보관되었어요.';
export const SNACKBAR_BACKUP_DONE_DESCRIPTION =
  '보관된 내역은 자동 숨기기 되었습니다.';

export const SELECT_MOVE_TITLE = '선택 이동';
export const SELECT_MOVE_CONFIRM_LABEL = '선택하기';
export const SELECT_MOVE_CONFIRM_SUFFIX = '개 선택하기';
export const SELECT_MOVE_EMPTY_TITLE = '이동할 수 있는 항목이 없어요.';
/** 폴더 선택 화면 로딩/에러 문구(3-B, 서버 트리 조회로 전환). */
export const SELECT_MOVE_LOADING = '목록을 불러오는 중이에요.';
export const SELECT_MOVE_RETRY_LABEL = '다시 시도';

export const MOVE_DESTINATION_TITLE = '폴더 선택';
export const MOVE_DESTINATION_ROOT_TITLE = '전체';
export const MOVE_DESTINATION_CONFIRM_LABEL = '여기로 이동하기';
export const MOVE_DESTINATION_NO_SUBFOLDER = '하위 폴더가 없어요.';
export const MOVE_DESTINATION_MOVING_LABEL = '이동 중...';

export const BUDGET_LIST_TITLE = '예산 설정';
export const BUDGET_LIST_EMPTY_TITLE =
  '아직 예산 설정할 장부가 존재하지 않아요.';
export const BUDGET_LIST_EMPTY_SUBTITLE = "'폴더'에서 장부를 생성해주세요.";
export const BUDGET_SHEET_PLACEHOLDER = '예산을 입력해주세요.';
export const BUDGET_SAVE_LABEL = '저장하기';
export const SNACKBAR_BUDGET_SAVED = '예산이 저장되었어요.';
/** 로딩/에러 문구 — 디자인 시안에 해당 상태가 없어 최소 형태로 통일. */
export const BUDGET_LIST_LOADING = '장부 목록을 불러오는 중이에요.';
export const BUDGET_LIST_RETRY_LABEL = '다시 시도';
