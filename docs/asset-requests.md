# 디자인 에셋 요청 목록

코드에 쓸 수 있는 에셋이 없어서 대체물로 두고 있는 것을 한곳에 모은다. **대체물을 직접 그리거나 비슷한 아이콘으로 바꾸지 않는다** — 여기 적고 디자이너에게 요청한다. 에셋이 오면 이 표에서 지우고 `docs/design-diff.md`에 해결로 기록한다.

수집 범위: `docs/design-diff.md`·`docs/design-verification.md`에서 "에셋 없음/자리표시자"로 보고된 것 전부(2026-09-20, 10-8). 카메라 프리뷰처럼 에셋이 아니라 런타임 기능인 것은 제외했다(아래 참고).

| # | 용도 | 사용 화면 | 시안 근거(파일#프레임) | 현재 대체물 | 상태 |
|---|---|---|---|---|---|
| 1 | 검색 필드 지우기 아이콘 — **원형 ⊗**(채운 회색 원 + 흰 X, `#9AA1AE`), 돋보기 왼쪽 | `SearchField`의 `onClear`(지금은 `LedgerSearchScreen` `FDR-3-PAGE-02-0` 한 곳, 다른 7곳은 시안 확인 후) **+ 로그인 비밀번호 필드**(`COM-1-PAGE-01-0`, 시안 Case B에서 사선 눈 왼쪽에 ⊗ — 현재 로그인 화면은 `onClear`를 안 켬, 에셋이 오면 함께). 참고: `ETC-4-PAGE-17-0` 비밀번호 변경 시트 Case A/B(디자인 중)도 비밀번호 필드에 ⊗ + 사선 눈 | `화면명세서/폴더/폴더_메인화면.png` Case C(`FDR-1-PAGE-01-0`), `화면명세서/폴더/폴더_장부상세_검색.png` Case A(`FDR-3-PAGE-02-0`), `화면명세서/회원가입&로그인/회원가입/로그인_메인화면.png` Case B(로그인 비밀번호 필드) | `assets/icons/action/Close.png`(사각 X, 96×96 원본, 코드에서 16×16 `#9B9B9B`) | 요청 필요 |
| 2 | 소셜 로그인 아이콘 3종 — 카카오톡(노란 원 + 말풍선) / 네이버(초록 원 + N) / 구글(흰 원 + G). **디자이너 제작이 아니라 각 플랫폼의 공식 에셋을 내려받아 쓴다.** | `LoginScreen`의 `SocialLoginBadge`(`COM-1-PAGE-01-0`) | `화면명세서/회원가입&로그인/회원가입/로그인_메인화면.png`(디자인 현황 = 디자인 완료) No.5, 프레임 #0·Case A·Case B 세 곳 모두 같은 아이콘 3개 | 원형 배경 + 글자(`K`/`N`/`G`), 노랑·초록·흰 원 48×48 | **공식 에셋 다운로드 필요**(코드상 아직 글자 자리표시자 확인, 2026-09-20) |
| 3 | ~~앱 로고 아이콘 마크~~ — **요청 불필요, 연결만 하면 됨(2026-09-20 11-1)** | `LoginScreen`(`COM-1-PAGE-01-0`) | 같은 시트의 로고(책 모양 남색 아이콘 + `Billage` 워드마크, 가로 배치). 이미지를 열어 비교: `assets/images/Billage_simbol_big.png`(120×116)가 시안의 아이콘 마크와 같은 도형(남색 큐브에 밝은 노치)이다 | `assets/images/Billage_logo.png`(워드마크만, 152×44)를 로그인 화면이 쓴다. 심볼 파일은 어디에서도 참조되지 않는다(`SplashScreen`은 `Billage_logo_big.png`) | 심볼을 워드마크 왼쪽에 붙여 가로 배치하면 된다 |

**소셜 로그인 아이콘 공급처(2번)**: 카카오/네이버/구글 공식 로그인 아이콘. 각 플랫폼이 브랜드 가이드라인 에셋을 배포하므로 디자이너 제작이 아니라 **공식 에셋 다운로드**가 맞다. 카카오: Kakao Developers 로그인 버튼 에셋. 네이버: 네이버 로그인 개발 가이드. 구글: Google Identity 브랜딩 가이드라인. 임의로 그리면 가이드라인 위반이다.

**에셋 요청이 아닌 것(참고)**
- 영수증 스캔의 카메라 프리뷰·촬영 버튼 진행 링(`ADD-3-PAGE-01-0`): 에셋이 아니라 실제 카메라 기능 문제. 시스템 카메라 인텐트로 대체 확정(`design-verification.md` §5-5 `react-native-vision-camera` 도입 여부).
- `assets/images/receipt-graphic.png`: 있었지만 미사용이던 에셋 — 9-3에서 `ReceiptScanFailedView`에 연결해 해결.

**`TextField`의 `onClear`도 같은 `Close.png`(사각 X)를 쓴다** — 사용처: `GroupProfileEditScreen`·`JoinGroupSheet`·`ProfileEditScreen`·`TransactionTextInputSheet`·`Dialog`(텍스트 필드). 이쪽 시안이 원형 ⊗인지는 아직 대조하지 않았다(1번 에셋이 오면 함께 확인).
