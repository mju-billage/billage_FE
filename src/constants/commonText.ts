/** 여러 화면에서 공통으로 재사용하는 문구. */
export const NEXT_BUTTON_LABEL = '다음으로';

// 카메라 촬영/갤러리 선택(react-native-image-picker, `utils/imagePicker.ts`) 공용 —
// 증빙자료/모임 프로필/내 프로필 등 진입점이 여럿이라 여기 둔다.
export const SNACKBAR_CAMERA_PERMISSION_DENIED =
  '카메라 권한이 없어서 촬영할 수 없어요. 다시 시도하면 권한을 요청해요.';
export const SNACKBAR_CAMERA_ERROR = '촬영에 실패했어요. 잠시 후 다시 시도해주세요.';
export const SNACKBAR_GALLERY_PERMISSION_DENIED =
  '갤러리 권한이 없어서 사진을 가져올 수 없어요. 다시 시도하면 권한을 요청해요.';
export const SNACKBAR_GALLERY_ERROR = '사진을 가져오지 못했어요. 잠시 후 다시 시도해주세요.';
/** "다시 묻지 않음"으로 영구 거부된 경우 — 시스템 권한 다이얼로그를 다시 못
 * 띄우므로 스낵바가 아니라 설정 앱으로 보내는 Dialog를 띄운다. 취소/설정이동
 * 버튼 문구는 카메라·갤러리 공용이라 하나로 둔다. */
export const CAMERA_PERMISSION_DIALOG_TITLE = '카메라 권한이 꺼져 있어요';
export const CAMERA_PERMISSION_DIALOG_DESCRIPTION =
  '설정에서 카메라 권한을 허용하면 촬영할 수 있어요.';
export const GALLERY_PERMISSION_DIALOG_TITLE = '갤러리 권한이 꺼져 있어요';
export const GALLERY_PERMISSION_DIALOG_DESCRIPTION =
  '설정에서 갤러리 권한을 허용하면 사진을 가져올 수 있어요.';
export const PERMISSION_DIALOG_CANCEL_LABEL = '닫기';
export const PERMISSION_SETTINGS_BUTTON_LABEL = '설정으로 이동';
/** 촬영/선택 직후 자동 업로드(`fileService.uploadFile`)가 실패했을 때 — 증빙자료/
 * 모임 프로필/내 프로필 셋 다 같은 문구를 쓴다. */
export const SNACKBAR_IMAGE_UPLOAD_FAILED =
  '이미지 업로드에 실패했어요. 잠시 후 다시 시도해주세요.';
/** `fileService.MAX_UPLOAD_FILE_SIZE_BYTES`(File.txt "최대 10MB") 초과 시 —
 * 업로드를 시도하지도 않고 이 문구로 막는다. */
export const SNACKBAR_IMAGE_TOO_LARGE = '이미지 용량은 최대 10MB까지 첨부할 수 있어요.';
export const AGREEMENT_TAG_REQUIRED = '필수' as const;
export const AGREEMENT_TAG_OPTIONAL = '선택' as const;

// 기간 선택 바텀시트(`DuesDateRangeSheet`, Dues·Report 공용, DTB-3-SHEET-01-0)
/** 좌측 보조 버튼 기본 라벨 — 시안마다 문구가 다르다(내역 필터=`이전`, 보고서=`취소`)는
 * 진입 경로 차이(전자는 필터 시트로 복귀, 후자는 시트를 그냥 닫음)일 뿐이라 prop으로
 * 받되, 지금 실제로 이 시트를 쓰는 화면(Dues 생성·수정, Report 기간별 생성)은 전부
 * `취소`가 맞아 기본값으로 둔다. */
/** 시트 타이틀 — 명세(`더보기_보고서생성하기_기간별_기간선택.png` No.2) "기간 선택" 고정 노출,
 * 호출부(Dues/Report)가 각자 폼 필드 라벨("기간")을 넘기던 것과 다르다 — 필드 라벨과
 * 시트 타이틀은 별개라 이 시트 내부 고정값으로 뺐다. */
export const DATE_RANGE_SHEET_TITLE = '기간 선택';
export const DATE_RANGE_SHEET_CANCEL_LABEL = '취소';
export const DATE_RANGE_SHEET_START_LABEL = '시작 날짜';
export const DATE_RANGE_SHEET_END_LABEL = '종료 날짜';
/** 미리보기 텍스트가 비어 있을 때 노출하는 placeholder(2자리 연도, 시안 그대로). */
export const DATE_RANGE_SHEET_DATE_PLACEHOLDER = 'YY.MM.DD';
