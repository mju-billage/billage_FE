// Color_Definition.pdf(1-0 Primitive Color) 기준 팔레트 + 시멘틱 컬러.
// 팔레트 22개 값은 Color_Definition.pdf와 대조해 전부 정확히 일치함을 확인함(docs/design-verification.md §3-1).

// ── Palette ──────────────────────────────────────────
export const NAVY_800 = '#070A23';
export const NAVY_500 = '#111957';
export const NAVY_200 = '#A0A3BC';

export const BLUE_500 = '#4A7FE7';
export const BLUE_400 = '#6CA1EE';
export const BLUE_300 = '#9BC1F5';
export const BLUE_100 = '#DCE8FB';
export const BLUE_50 = '#F0F5FE';

export const GREY_800 = '#374151';
// GREY_700과 GREY_800이 동일한 이유: PDF 원본에서 700/800이 둘 다 #374151로 정의돼 있음.
// 코드 실수 아님 — 디자이너 확인 필요(docs/design-questions.md #1, docs/design-verification.md §3-1).
export const GREY_700 = '#374151';
export const GREY_600 = '#4B5563';
export const GREY_400 = '#9B9B9B';
export const GREY_300 = '#C1C5CD';
export const GREY_200 = '#E5E7EB';
export const GREY_100 = '#F3F4F6';

export const BASIC_0 = '#FFFFFF';
export const BASIC_100 = '#000000';

export const YELLOW_500 = '#FFBF2A';
export const YELLOW_50 = '#FFF9EA';

export const RED_400 = '#FB6E67';
export const RED_50 = '#FFEDEC';

// ── Foreground (텍스트/아이콘) ──────────────────────────
export const FOREGROUND_PRIMARY = NAVY_800;
export const FOREGROUND_SECONDARY = BLUE_500;
export const FOREGROUND_NEUTRAL_NORMAL = GREY_600;
export const FOREGROUND_NEUTRAL_SUBTLE = GREY_400;
export const FOREGROUND_INVERSE = BASIC_0;
export const FOREGROUND_DISABLED = GREY_300;
export const FOREGROUND_INACTIVE = NAVY_200;

// ── Background (페이지/모달 등 넓은 면) ──────────────────
export const BACKGROUND_PRIMARY = BLUE_50;
export const BACKGROUND_SECONDARY = BASIC_0;

// ── Fill (카드 이하 크기의 면) ───────────────────────────
export const FILL_PRIMARY = NAVY_500;
export const FILL_SECONDARY_BOLD = BLUE_500;
export const FILL_SECONDARY_SUBTLE = BLUE_100;
export const FILL_SECONDARY_SUBTLER = BLUE_50;
export const FILL_NEUTRAL_NORMAL = GREY_100;
export const FILL_NEUTRAL_SUBTLE = BASIC_0;
export const FILL_INVERSE = GREY_800;
export const FILL_DISABLED = GREY_100;

// ── Border (선 요소) ────────────────────────────────────
export const BORDER_NEUTRAL_BOLD = GREY_400;
export const BORDER_NEUTRAL_NORMAL = GREY_200;
export const BORDER_NEUTRAL_SUBTLE = GREY_100;
export const BORDER_SECONDARY_BOLD = BLUE_500;
export const BORDER_SECONDARY_SUBTLE = BLUE_100;

// ── Feedback (상태값) ───────────────────────────────────
export const FEEDBACK_POSITIVE_SUBTLE = BLUE_100;
export const FEEDBACK_POSITIVE_BOLD = BLUE_500;
export const FEEDBACK_WARNING_SUBTLE = YELLOW_50;
export const FEEDBACK_WARNING_BOLD = YELLOW_500;
export const FEEDBACK_NEGATIVE_SUBTLE = RED_50;
export const FEEDBACK_NEGATIVE_BOLD = RED_400;

// ── Folder Colors ─────────────────────────────
export const FOLDER_BACKGROUND = BLUE_400;
export const FOLDER_FRONT = BLUE_300;

// ── Overlay (모달/시트 배경 스크림) ──────────────────────
// 시안 실측 역산 (내역_상세내역조회_삭제.png#0 #707070 → α0.56, 납부관리_회비상세_삭제.png#0 #6A6C70 → α0.56(뒤 화면이 블루 #F0F5FE라 채널이 일치, 흰색 기준이면 0.58). 2026-09-20
// 시트 14개 17프레임 실측 중 15프레임이 α0.56(흰 배경 #707070 · 블루 배경 #6A6C70), 같은 시트 2프레임(폴더_장부예산설정_금액기입.png #484A4C)만 α0.70 — docs/design-verification.md §5-28.
export const OVERLAY_SCRIM = 'rgba(0, 0, 0, 0.56)';
// ⋮ 메뉴(팝오버) 백드롭 — 시안 실측: 메뉴가 열린 프레임(폴더_메인화면 Case A, 폴더_폴더상세 Case A, 폴더_장부상세, 납부관리_회비상세, 더보기_모임관리_모임원관리, 더보기_모임전환_전체모임관리)에서
// 화면이 전혀 어두워지지 않는다(스크림 회색 픽셀 0.4~0.5% = 글자/아이콘뿐, 모달 프레임은 32%). 즉 α0. 바깥 터치로 닫는 용도의 투명 백드롭. 2026-09-21
export const OVERLAY_MENU_BACKDROP = 'rgba(0, 0, 0, 0)';

// ── color.pdf 범위 밖 (브랜드/화면 전용 액센트) ────────────
export const SOCIAL_NAVER_GREEN = '#03C75A';
export const SOCIAL_KAKAO_YELLOW = '#FEE500';
export const SOCIAL_KAKAO_TEXT = '#3C1E1E';
