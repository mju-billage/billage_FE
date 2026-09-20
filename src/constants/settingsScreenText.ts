/**
 * 더보기 > 설정 허브 / 내 프로필 / 프로필 변경 / 비밀번호 변경 / 알림 설정 /
 * 공지사항 / 문의하기 / 약관 전용 문구.
 */

// 설정 허브 (ETC-2-PAGE-09-0)
export const SETTINGS_TITLE = '설정';
export const SETTINGS_NOTIFICATION_LABEL = '알림 설정';
export const SETTINGS_SUPPORT_SECTION_TITLE = '고객 지원 및 정보';
export const SETTINGS_NOTICE_LABEL = '공지사항';
export const SETTINGS_INQUIRY_LABEL = '문의하기';
export const SETTINGS_TERMS_LABEL = '약관 및 정책';
export const SETTINGS_APP_VERSION_LABEL = '앱 버전 정보';
/** 로딩/에러 문구 — 디자인 시안에 해당 상태가 없어 최소 형태로 통일. */
export const SETTINGS_LOADING = '내 정보를 불러오는 중이에요.';
export const SETTINGS_RETRY_LABEL = '다시 시도';

// 내 프로필 (ETC-3-PAGE-07-0)
export const MY_PROFILE_TITLE = '내 프로필';
export const MY_PROFILE_EDIT_LABEL = '프로필 변경';
export const MY_PROFILE_PASSWORD_CHANGE_LABEL = '비밀번호 변경';
export const MY_PROFILE_ACCOUNT_LABEL = '로그인 계정';
export const MY_PROFILE_JOINED_AT_PREFIX = '가입일 ';
export const MY_PROFILE_LOGOUT_LABEL = '로그아웃';
export const MY_PROFILE_WITHDRAW_LABEL = '회원탈퇴';
export const MY_PROFILE_LOGOUT_CONFIRM_TITLE = '로그아웃 할까요?';
export const MY_PROFILE_LOGOUT_CANCEL_LABEL = '취소';
export const MY_PROFILE_LOGOUT_CONFIRM_LABEL = '로그아웃';
export const MY_PROFILE_LOADING = '내 프로필을 불러오는 중이에요.';
export const MY_PROFILE_RETRY_LABEL = '다시 시도';

// 프로필 변경 (ETC-4-PAGE-15-0)
export const PROFILE_EDIT_TITLE = '프로필 변경';
export const PROFILE_EDIT_NAME_LABEL = '이름';
/** 시안 UI 요소 3번: "10자 제한 적용되며 10자 이상 입력시 입력 차단". */
export const PROFILE_EDIT_NAME_MAX_LENGTH = 10;
export const PROFILE_EDIT_SUBMIT_LABEL = '저장하기';
export const SNACKBAR_PROFILE_UPDATED = '변경 사항이 저장되었어요.';
export const PROFILE_EDIT_LEAVE_TITLE = '변경 사항을 저장하지 않고 나갈까요?';
export const PROFILE_EDIT_LEAVE_DESCRIPTION = '지금까지 입력한 내용이 저장되지 않아요.';
export const PROFILE_EDIT_LEAVE_CANCEL_LABEL = '취소';
export const PROFILE_EDIT_LEAVE_CONFIRM_LABEL = '나가기';

// 프로필 변경_사진 변경 바텀시트 (ETC-4-SHEET-02-0)
export const PROFILE_IMAGE_SHEET_CAMERA_LABEL = '사진 촬영하기';
export const PROFILE_IMAGE_SHEET_GALLERY_LABEL = '사진 선택하기';
export const PROFILE_IMAGE_SHEET_RESET_LABEL = '기본 프로필로 변경하기';

// 비밀번호 변경 (ETC-4-PAGE-17-0)
export const PASSWORD_CHANGE_TITLE = '비밀번호 변경';
export const PASSWORD_CHANGE_CURRENT_LABEL = '현재 비밀번호';
export const PASSWORD_CHANGE_CURRENT_PLACEHOLDER = '현재 비밀번호를 입력해주세요';
export const PASSWORD_CHANGE_NEW_LABEL = '새 비밀번호';
export const PASSWORD_CHANGE_CONFIRM_LABEL = '새 비밀번호 확인';
export const PASSWORD_CHANGE_NEW_PLACEHOLDER = '영문 대소문자, 숫자, 특수문자 포함 8자 이상';
export const PASSWORD_CHANGE_SUBMIT_LABEL = '비밀번호 변경';
/** 가입 화면과 같은 규칙(Auth.txt) — 영문 대소문자·숫자·특수문자 포함 8자 이상. */
export const PASSWORD_CHANGE_FORMAT_ERROR = '비밀번호 형식이 올바르지 않습니다.';
export const PASSWORD_CHANGE_MISMATCH_ERROR = '비밀번호가 동일하지 않아요. 다시 입력해주세요.';
export const PASSWORD_CHANGE_CURRENT_MISMATCH_ERROR =
  '현재 비밀번호와 일치하지 않아요. 다시 입력해주세요.';
export const SNACKBAR_PASSWORD_CHANGED = '비밀번호가 변경되었어요.';
export const PASSWORD_CHANGE_LEAVE_TITLE = '비밀번호 변경을 그만둘까요?';
export const PASSWORD_CHANGE_LEAVE_DESCRIPTION = '입력한 내용이 저장되지 않아요.';
export const PASSWORD_CHANGE_LEAVE_CANCEL_LABEL = '취소';
export const PASSWORD_CHANGE_LEAVE_CONFIRM_LABEL = '그만두기';

// 알림 설정 (ETC-3-PAGE-08-0)
export const NOTIFICATION_SETTINGS_TITLE = '알림 설정';
export const NOTIFICATION_SETTINGS_GROUP_ACTIVITY_LABEL = '모임 활동 알림';
export const NOTIFICATION_SETTINGS_GROUP_ACTIVITY_DESCRIPTION =
  '멤버 가입 및 주요 모임 활동 상태 안내';
export const NOTIFICATION_SETTINGS_APPROVAL_LABEL = '승인 요청 알림';
export const NOTIFICATION_SETTINGS_APPROVAL_DESCRIPTION =
  '멤버의 승인 요청 및 승인 대기 상태 알림';
export const NOTIFICATION_SETTINGS_DUES_LABEL = '납부 관리 알림';
export const NOTIFICATION_SETTINGS_DUES_DESCRIPTION = '회비 납부 일정 및 납부현황 알림';
export const NOTIFICATION_SETTINGS_NOTICE_LABEL = '공지 및 업데이트 알림';
export const NOTIFICATION_SETTINGS_NOTICE_DESCRIPTION =
  '서비스 주요 공지사항 및 새 기능 업데이트 안내';
export const NOTIFICATION_SETTINGS_MARKETING_LABEL = '마케팅 알림';
export const NOTIFICATION_SETTINGS_MARKETING_DESCRIPTION = '이벤트 및 혜택 알림';
export const NOTIFICATION_SETTINGS_NIGHT_TIME_LABEL = '야간 수신 동의';
export const NOTIFICATION_SETTINGS_NIGHT_TIME_DESCRIPTION =
  '야간 시간대(21:00 ~ 08:00) 알림 수신';
export const NOTIFICATION_SETTINGS_LOADING = '알림 설정을 불러오는 중이에요.';
export const NOTIFICATION_SETTINGS_RETRY_LABEL = '다시 시도';
export const NOTIFICATION_SETTINGS_UPDATE_ERROR = '설정을 저장하지 못했어요. 다시 시도해주세요.';

// 공지사항 (ETC-3-PAGE-09-0 / ETC-4-PAGE-18-0)
export const NOTICE_LIST_TITLE = '공지사항';
export const NOTICE_LIST_LOADING = '공지사항을 불러오는 중이에요.';
export const NOTICE_LIST_RETRY_LABEL = '다시 시도';
export const NOTICE_LIST_EMPTY = '아직 등록된 공지사항이 없어요.';
export const NOTICE_DETAIL_LOADING = '공지사항을 불러오는 중이에요.';
export const NOTICE_DETAIL_RETRY_LABEL = '다시 시도';

// 문의하기 (ETC-3-PAGE-10-0) — 디자인 '진행' 중(2026.05.27 기준)
export const INQUIRY_TITLE = '문의하기';
export const INQUIRY_FAQ_SECTION_TITLE = '자주 묻는 질문 (FAQ)';
export const INQUIRY_LOADING = 'FAQ를 불러오는 중이에요.';
export const INQUIRY_RETRY_LABEL = '다시 시도';
export const INQUIRY_EMPTY = '등록된 FAQ가 없어요.';
export const INQUIRY_CONTACT_LABEL = '문의하기';
/** 시안 고정 문구 — 상태: 읽기 전용(터치 액션 없음). */
export const INQUIRY_CONTACT_EMAIL = 'billage0202@gmail.com';

// 탈퇴하기_안내 (COM-1-PAGE-02-0)
export const WITHDRAW_GUIDE_TITLE = '탈퇴하기';
export const WITHDRAW_GUIDE_HEADING = '빌리지 탈퇴 전에 꼭 확인해주세요.';
export const WITHDRAW_GUIDE_BULLETS = [
  '현재 참여 중인 모든 모임에서 나가게 돼요.',
  '만약 본인이 유일한 총무인 모임이 있다면, 모임의 원활한 운영을 위해 다른 멤버에게 권한을 위임해주셔야 해요.',
  '모임의 삭제를 원하시면 탈퇴 전에 직접 삭제해주세요.',
  '작성하신 모임의 내역과 자료는 남은 멤버들이 계속 조회할 수 있어요. 삭제를 원하시면 탈퇴 전에 직접 삭제해주세요.',
  '작성자로 표시되던 회원님의 닉네임은 익명으로 보호돼요.',
  '참여자가 본인 한 명뿐인 모임이라면 탈퇴 즉시 모든 데이터가 삭제되어 다시는 열람할 수 없어요.',
];
export const WITHDRAW_GUIDE_CONFIRM_LABEL = '확인했어요';
export const WITHDRAW_GUIDE_LOADING = '모임 정보를 확인하는 중이에요.';
export const WITHDRAW_GUIDE_RETRY_LABEL = '다시 시도';

// 탈퇴하기_권한 이전 (COM-2-PAGE-04-0)
export const WITHDRAW_TRANSFER_TITLE = '탈퇴하기';
export function withdrawTransferHeading(groupCount: number): string {
  return `현재 ${groupCount}곳의 모임에서\n총무 권한을 갖고있어요!`;
}
export const WITHDRAW_TRANSFER_DESCRIPTION =
  '총무 권한을 타 멤버에게 위임 후 탈퇴할 수 있어요.';
export const WITHDRAW_TRANSFER_SUBMIT_LABEL = '권한 넘겨주기';
export const WITHDRAW_TRANSFER_LOADING = '모임원 목록을 불러오는 중이에요.';
export const WITHDRAW_TRANSFER_RETRY_LABEL = '다시 시도';

// 탈퇴하기_사유 선택 (COM-2-PAGE-05-0) + 최종 확인 모달 (COM-3-MODAL-01-0)
export const WITHDRAW_REASON_TITLE = '탈퇴하기';
export const WITHDRAW_REASON_HEADING = '빌리지 탈퇴 전에 꼭 확인해주세요.';
export const WITHDRAW_REASON_USAGE_UNCLEAR_LABEL = '사용 방법을 모르겠어요';
export const WITHDRAW_REASON_REJOIN_LABEL = '다시 가입할 거예요';
export const WITHDRAW_REASON_MISSING_FEATURE_LABEL = '원하는 기능이 없어요';
export const WITHDRAW_REASON_NO_LONGER_NEEDED_LABEL = '이용할 필요가 없어졌어요';
export const WITHDRAW_REASON_ETC_LABEL = '직접 입력할게요';
export const WITHDRAW_REASON_ETC_PLACEHOLDER = '탈퇴 사유를 입력해주세요';
export const WITHDRAW_REASON_ETC_MAX_LENGTH = 30;
/** 시안 판독 결과(2026-09-11): 표 Description(No.4)과 사유선택 화면 Case A
 * 프레임은 "선택 완료"라 적었지만, 같은 화면의 메인 프레임 2장(COM-2-PAGE-05-0)과
 * 다음 화면(COM-3-MODAL-01-0)의 배경 프레임까지 총 3곳이 "탈퇴하기"로 그려져
 * 있다 — 시각적 다수를 따라 "탈퇴하기"로 확정. */
export const WITHDRAW_REASON_SUBMIT_LABEL = '탈퇴하기';
export const WITHDRAW_CONFIRM_TITLE = '정말 탈퇴하시겠어요?';
export const WITHDRAW_CONFIRM_DESCRIPTION = '탈퇴 시 모든 정보와 이용 내역이 삭제돼요.';
export const WITHDRAW_CONFIRM_CANCEL_LABEL = '취소';
export const WITHDRAW_CONFIRM_SUBMIT_LABEL = '탈퇴하기';
export const SNACKBAR_WITHDRAW_COMPLETE = '탈퇴가 완료되었어요';

// 약관 및 정책 (ETC-3-PAGE-11-0)
export const TERMS_LIST_TITLE = '이용 약관';
export const TERMS_LIST_SERVICE_LABEL = '서비스 이용 약관';
export const TERMS_LIST_PRIVACY_LABEL = '개인정보 처리방침';
export const TERMS_LIST_AUTO_RECORD_LABEL = '자동 기록 서비스 이용 약관';
export const TERM_DETAIL_LOADING = '약관을 불러오는 중이에요.';
export const TERM_DETAIL_RETRY_LABEL = '다시 시도';
