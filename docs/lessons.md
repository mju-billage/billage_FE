# lessons — 지우면 안 되는 것 (재발성 함정 · 판단 근거 · 정정 이력 · 운영 값)

> 2026-09-19 문서 압축(7-1)에서 만든 파일이다. **해결된 항목이라도 같은 실수를 반복하게 만드는 것**만 모았다. 아래 원문 인용은 스냅샷 커밋 `e1b6d7b`에서 그대로 가져왔다(줄 번호는 그 커밋 기준). 압축 전 원문 복구: `git show e1b6d7b:<경로>`. `DEV_NOTES.md`·`shots/INDEX.md`는 gitignore라 그 커밋에 없다(사본은 작업 세션 스크래치패드에만 있었다).

## 목차

1. 재발성 함정
2. 운영에 필요한 값 (계정 · URL · 경로 · 키)
3. 판단 근거가 적힌 결정 + 시안↔설명표 불일치 #1~#12
4. 정정 이력(`※ 정정`) 전수 발췌

---

## 1. 재발성 함정

### 1-1. 인코딩 트랩 — `curl -d '한글'`은 서버 버그처럼 보이는 400/실패를 만든다

> 출처: CLAUDE.md (스냅샷 `e1b6d7b` 8행~)

> - API를 직접 호출해 진단할 때는 `scripts/api-call.js`를 쓴다. `curl -d '...'`로 한글을
>   보내지 마라 — 셸 인코딩이 깨져 400 INVALID_REQUEST로 나타나고, 서버 버그로 오진하게
>   된다(2026-09-13 두 번 발생).

> 출처: docs/backend-requests.md — 철회된 오진단 (스냅샷 `e1b6d7b` 281행~)

> - **(2026-09-13, 철회) 보고서 제목에 한글이 들어가면 생성이 실패한다고 잘못 진단했던 건**:
>   최초 curl 테스트(`-d '...'`, 셸 리터럴)에서 한글이 Windows 환경 인코딩 문제로 깨진 채
>   나갔을 가능성을 안 걷어내고 서버 버그로 잘못 결론 내렸습니다. UTF-8 파일을 만들어
>   `--data-binary @req.json`으로 다시 보내니(바이트 확인: "진단테스트" 5자 15바이트,
>   정확한 UTF-8) `201 Created`로 정상 성공했습니다 — **서버는 한글 제목을 문제없이
>   받습니다.** 실제 원인은 두 가지가 겹쳐 있었습니다: (1) 처음 실패를 봤던 캡처는 사용자가
>   내역이 0건인 장부("B", ledgerId 22)를 선택한 상태였고, 서버는 `REPORT_RANGE_EMPTY`
>   (선택한 장부·기간에 담을 내역이 없음, 명세에 이미 정의된 정상 에러 코드)를 정확히
>   돌려주고 있었습니다 — 진짜 버그가 아니라 데이터 조건 문제입니다. (2) 다만
>   `constants/apiErrorMessages.ts`에 Report 도메인 에러 블록 자체가 없어서
>   `REPORT_RANGE_EMPTY`가 매핑에 없는 코드로 취급돼 기본 fallback 문구("일시적인 문제가
>   발생했어요...")로 덮여 있었습니다 — 이건 진짜 프론트 버그였고 `REPORT_ERROR_MESSAGES`
>   블록을 새로 추가해 고쳤습니다. 서버 조치 불필요합니다. 재현 과정에서 만든 `reportId`
>   13/14/15(groupId 5, 전부 진단용 텍스트)는 Report `DELETE` API가 없어 못 지웠습니다 —
>   아래 "부탁" 섹션 참고.

**규칙**: 한글이 든 API 진단은 `scripts/api-call.js`(UTF-8 파일로 전송)를 쓴다. 셸 리터럴로 한글을 보내지 않는다.

### 1-2. edge-to-edge 강제 — `windowSoftInputMode=adjustResize` 단독은 키보드를 못 피한다

> 출처: docs/design-verification.md §5-12 (스냅샷 `e1b6d7b` 1523행~)

> **진단.** `AndroidManifest.xml`엔 `windowSoftInputMode="adjustResize"`가 이미 설정돼
> 있었지만 효과가 없었다 — `compileSdk`/`targetSdk`가 36(Android 16 기준)이라 edge-to-edge가
> OS 레벨에서 강제 적용된다. `windowOptOutEdgeToEdgeEnforcement`는 API35까지만 유효한
> 옵트아웃이고 API36에선 그 속성 자체가 OS에서 제거돼 끌 수 없다. `android/gradle.properties`의
> `edgeToEdgeEnabled=false`는 RN 자체 헬퍼(`enableEdgeToEdge()` 호출 여부)만 제어하는
> 별개 스위치라 OS 강제 적용을 못 막는다. edge-to-edge를 끄는 것도 답이 아니다 — 상태바
> 영역까지 배경이 올라가는 현재 디자인이 edge-to-edge를 전제로 한다. 코드 전수 조사 결과
> `KeyboardAvoidingView`/`Keyboard.*`/`keyboardShouldPersistTaps` 등 키보드 대응 코드가
> 전혀 없었다 — `adjustResize` 하나에만 의존하고 있었고 그게 무력화된 상태였다.

**규칙**: 키보드 대응은 `react-native-keyboard-controller`로 통일(전체화면 폼 `ScreenContainer`, 모달/시트 `Dialog`/`BottomSheet`). 화면마다 `KeyboardAvoidingView`를 따로 넣지 않는다(`§5-12`).

### 1-3. fallback 에러 문구가 원인을 가린다 — "일시적인 문제가 발생했어요"가 뜨면 서버를 의심하기 전에 매핑부터

> 출처: `src/constants/apiErrorMessages.ts` 파일 헤더 주석(코드 읽기, 2026-09-19)

> ⚠️ 도메인 블록이 통째로 빠지면 서버가 보낸 구체적 원인이 fallback 문구로 덮인다. 2026-09-13 `REPORT_RANGE_EMPTY`가 이 경로로 "일시적인 문제가 발생했어요"로 표시돼 서버 장애로 오독됐다(실제로는 선택한 장부에 내역 0건 — 정상 에러였다). 이 문구가 뜨면 서버를 의심하기 전에 여기 매핑부터 확인할 것 — 서버 명세 대비 미매핑 코드 전체 목록은 `docs/design-verification.md` §5-8 참고.

### 1-4. Swagger 문서의 함정 — `userId` 쿼리 파라미터는 무시한다

> 출처: docs/api-wiring.md (스냅샷 `e1b6d7b` 19행~)

> ## ⚠️ Swagger 문서 자체의 함정 — `userId` 쿼리 파라미터
>
> **거의 모든 엔드포인트에 `userId *`(필수, query)가 붙어 있지만 무시해라.** 그동안의 모든
> 실호출이 이 파라미터 없이 `Authorization` 헤더만으로 정상 동작했다(200/201/204 전부) —
> 인증 리졸버가 컨트롤러 메서드 시그니처에 노출되면서 springdoc이 잘못 문서화한
> 아티팩트로 보인다. **프론트에 이 파라미터를 추가하지 마라 — 추가하면 오히려 망가진다.**
> `docs/backend-requests.md`에 `@Parameter(hidden = true)` 처리 요청을 남겼다.
>

### 1-5. 서버 태그·명세 상태가 낡아 있을 수 있다 — 존재 여부는 Swagger/실호출이 진실

- 2026-09-11 Swagger 전수 대조(`docs/api-wiring.md`): 명세 txt의 "구현/진행중/미구현" 태그가 상당수 낡아 있었다. **Swagger에 컨트롤러/경로가 있으면 "구현"이다.** 예: 이메일 인증 경로는 명세엔 `/auth/email/verification`(단수)이었지만 실제는 `/auth/email-verifications`(복수) — 예전 경로는 `401`이 나서 "서버 미구현"으로 오판하기 쉬웠다(`docs/backend-requests.md`).
- `401 UNAUTHORIZED`가 토큰 없이도 똑같이 나오면 **라우트가 매칭되지 않은 것**일 수 있다(전역 인증 필터로 떨어짐).

### 1-6. `[구현]`은 "코드가 있다"는 뜻이지 "동작한다"가 아니다

- 2026-09-12 보관함 7화면을 `[구현]`으로 올렸는데 실기기에서 첫 화면(`ArchiveListScreen`)이 진입 즉시 Render Error로 죽었다(존재하지 않는 서버 필드 `archivedAt`을 읽음 — 실제는 `createdAt`). 코드 존재·타입 정합성만으로는 실행 가능 여부를 보장하지 못한다(`docs/design-verification.md` §1 경고). Swagger 예시값만 보고 타입을 맞추면 필드명이 실제와 다를 수 있다.

### 1-7. 이미지로 판단하지 말 것

- 축소된 이미지(다운스케일)의 **텍스트 색·자간(letterSpacing)은 판별할 수 없다**(`docs/typography-audit.md`: 360px 이미지로 자간 판별 불가 → 코드 전수 대조로 대체). 색은 원본 픽셀을 샘플링해서 판단한다.
- 스펙시트 크롭 목업(`design-index.json`)에는 [기능]/[상태]/[액션] 표가 없다 — 판단이 필요하면 `화면명세서\` 원본 시트를 직접 연다(`docs/design-verification.md` §4-0).
- 시안 목업의 숫자(예: 글자수 10자)와 설명표의 숫자가 다르면 임의로 정하지 않는다(아래 불일치 #8).

### 1-8. 캐러셀 스냅 — `snapToInterval`은 스크롤뷰의 비대칭 인셋을 안 넣는다

- `pagingEnabled` + 슬라이드 폭 = 화면 폭 + 카드 여백은 슬라이드 안쪽 padding — 이렇게 하면 `snapToInterval` 없이 항상 맞는다(`docs/design-verification.md` §5-15, 2026-09-18). 카드 폭 + gap 단위 `snapToInterval` + 스크롤뷰 좌측 패딩 조합이 2페이지부터 어긋났던 원인이다.

### 1-9. 공유 컴포넌트/상수를 고칠 때는 사용처를 전수로 찾는다

- `FolderItem` 그리드 정렬을 한 화면(`ReportLedgerSelectScreen`)만 고치고 `FolderScreen`을 빠뜨렸던 사례(`docs/design-diff.md` 6-7). `FOLDER_GRID_COLUMN_GAP`처럼 상수를 올리면 같은 상수를 쓰는 화면(`ReportLedgerSelectScreen`)의 간격도 함께 바뀐다.
- `TransactionListItem` 같은 공용 컴포넌트는 prop으로 한 화면만 고치지 말고 컴포넌트 안에서 통일한다(6-8).

### 1-10. 작은 코드 함정

- JS `-0`: `(-0).toLocaleString()`은 `"-0"`이다. 호출부가 `-amount`로 지출을 넘기면 0원 지출이 `-0원`이 된다(`formatExpense`/`TransactionListItem`).
- `PanResponder.create`는 최초 렌더에서 한 번만 만들어져 핸들러가 그 시점 값을 붙잡는다 — 훅 값(`useWindowDimensions`)을 쓰려면 매 렌더 갱신되는 ref로 읽는다(`ZoomableImage`).
- `SafeAreaView`는 인셋을 padding으로 주므로 그 바로 아래 `position:absolute` 자식의 `bottom`은 인셋을 무시하고 화면 끝 기준일 수 있다(Yoga absolute는 padding box 기준 — **추정, 실기기 미확인**). `ScreenContainer`로 옮기면 위치가 바뀔 수 있어 스낵바 7개 마이그레이션이 대기 중이다(`docs/design-verification.md` §5-18).

### 1-11. 이 PC의 개발 환경 트랩 (Windows + Git Bash)

- `react-native run-android` 전에 같은 PowerShell 호출 안에서 `$env:NoDefaultCurrentDirectoryInExePath = ''`로 지운다(그렇지 않으면 `gradlew.bat`을 못 찾는다). Metro가 이미 떠 있으면 `--no-packager`(아니면 8082 포트 프롬프트에서 멈춘다). PowerShell `Start-Job`은 호출이 끝나면 죽는다 — 백그라운드는 도구의 `run_in_background`를 쓴다.
- Git Bash에서 `adb shell/pull`에 `/sdcard/...`를 넘길 땐 `MSYS_NO_PATHCONV=1`을 앞에 붙이고, `adb pull` 목적지는 Windows 경로(`C:\Users\...`)로 준다.

### 1-12. 명세서 자동 측정의 프레임 좌표 함정 (2026-09-19, 8-1~8-5)

> **명세서 자동 측정의 프레임 좌표 함정** — 명세서 목업 왼쪽에 붙은 번호 마커(①②③) 때문에 연결요소 바운딩 박스가 프레임 밖까지 잡힌다. 여백 스트립을 재면 흰 종이를 재게 되어 블루 화면이 흰색으로 판정된다. v1~v4가 전부 이 오류. 해결: 프레임 우측 테두리를 격자(x=410/790)에 스냅하고 폭 360으로 고정. **자동 측정 결과는 반드시 원본 크롭 육안 확인으로 교차검증할 것.**

- 증상 모음: v1(파일 단위)은 한 파일 안의 다른 Case(스낵바가 뜬 부모 화면 등)까지 세서 폼 화면이 블루로, v3는 프레임 왼쪽이 실제 테두리(x=50)보다 18~24px 바깥(x=26/32)에 잡혀 `FDR-1-PAGE-01-0`·`DSH-1-PAGE-01-0`(둘 다 블루)이 흰색으로 나왔다.
- 이 때문에 8-1·8-3에서 §2에 반영했던 `PAGE` 행 판정은 전부 철회했다(`docs/design-verification.md` §1). 기준점(직접 실측한 화면)이 하나라도 틀리면 그 측정 결과 전체를 쓰지 않는다.
- 같은 사고의 부산물: 딤 처리된 모달 프레임은 측정값이 스크림 색이라 **요소 표면색이 아니라 뒤 화면**을 잰 것이다 — 모달·시트·스낵바 행의 배경 열은 요소 표면색(컴포넌트 근거)으로 통일하고 부모 색은 비고에 둔다(§1 맨 위 규칙, 8-4).

---

## 2. 운영에 필요한 값

### API BASE_URL

- 개발 서버: `https://52-78-148-114.nip.io` (`.env`의 `API_BASE_URL`, `scripts/api-call.js`의 `API_CALL_BASE_URL` 기본값). 로컬 스프링 서버는 `http://localhost:8080`이지만 안드로이드 에뮬레이터에서는 `10.0.2.2`로 접근한다.
- 진단 호출은 `scripts/api-call.js`(로그인 후 호출, `API_CALL_PASSWORD` 환경변수). 전수 검증은 `scripts/api-verify.js` + `scripts/api-verify-cases/`.

### 테스트 계정 / 데이터

> 출처: docs/api-integration-plan.md (스냅샷 `e1b6d7b` 344행~)

> 2026-09-04 실호출 검증(§api-gaps.md "확정됨" 절, Dues `startDate`/`SCHEDULED`, Entry 전체 목록
> 3건)에 새 계정을 만들어 썼다:
>
> | 항목 | 값 |
> |---|---|
> | 계정(총무) | `billage.verify.dues.test@example.com` / `userId: 6` |
> | 모임 | `VerifyDues` / `groupId: 2` |
> | 폴더 | `VerifyFolder` / `folderId: 1` |
> | 장부 | `VerifyLedger` / `ledgerId: 1`, 예산 1,000,000원 |
> | 모임원 | `Verify1` / `memberId: 1` |
> | 내역 | `VerifyEntry`(지출 25,000원) / `entryId: 1` — **정리 안 함**(정책상 유지) |
> | 회비(검증용, 정리 완료) | `duesId 1·2·3` — 확인 직후 `DELETE`로 전부 제거, 목록 재조회로 빈 상태 확인함 |
>
> 비밀번호는 이 문서에 기록하지 않았다(세션 내에서만 사용) — 그런데 바로 이 판단 때문에
> `Step1Group`처럼 **다음 세션에서 못 쓰는 계정이 또 나올 뻔했다**. 아래부터는 예외적으로 비밀번호를
> 그대로 적는다(비번 재설정 API가 없어 유실 시 복구 불가 — 기록 안 하는 쪽의 리스크가 더 크다고
> 판단 변경).
>
> | 계정 | 값 |
> |---|---|
> | 총무 | `billage.verify.dues.test@example.com` / 비밀번호 `Billage1!Verify` / `userId: 6` |
> | 일반(MEMBER) | `billage.verify.member.test@example.com` / 비밀번호 `Billage1!Member` / `userId: 7` — 2026-09-05 생성, `VerifyDues`에 `membershipId: 5`로 참여(`role: MEMBER`, `GET /groups/2/memberships` 확인) |
> | 두 번째 계정(2026-09-13) | `billage.verify.newcheck9999@example.com` / 비밀번호 `Password123!` / `userId: 9`, 이름 `새계정확인` — **`POST /auth/signup` 직접 호출로 생성, 이메일 인증(발송이 `MAIL_SEND_FAILED`로 막혀 있어 인증 자체가 불가)을 거치지 않은 상태.** 로그인은 인증 여부와 무관하게 정상 동작함을 확인(`scripts/api-call.js`로 검증). `groupId 6`("탈퇴테스트모임", `VerifyDues`가 단독 총무)에 `membershipId 11`로 참여(`role: MEMBER`) — `COM-2-PAGE-04-0`(탈퇴하기 > 권한 넘기기) 캡처용으로 이 조합을 만들었다. 계정 두 개가 필요한 다른 검증에도 재사용할 것. |
>
> **이 두 계정이 새 주 계정이다** — 다음 라운드부터 `billage.group.step{N}...` 대신 이 계정들과
> `VerifyDues` 모임을 재사용할 것. `Step1Group` 이름 규칙 자체는 유효하니, 앞으로 새 계정이
> 필요하면 `billage.verify.{용도}.test@example.com` 형태를 따른다.
>

### 디자인 원본 · 키

- 디자인 원본 폴더: `%BILLAGE_SPEC_ROOT%\`(`화면명세서\` = 원본 스펙시트, 나머지 = 크롭 목업; 경로는 환경변수 `BILLAGE_SPEC_ROOT`로 지정). 명세 원본(API txt): `%BILLAGE_SPEC_ROOT%\api\`.
- 소셜 로그인 콘솔 등록용(`android/app/debug.keystore`, 팀 전원 동일): SHA-1 `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`, 카카오 키 해시 `Xo8WBi6jzSxKDVR4drqm84yr9iU=`, 패키지명 `com.billage`. `.env` 필수 키: `KAKAO_NATIVE_APP_KEY`, `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`, `GOOGLE_WEB_CLIENT_ID`, `API_BASE_URL`.

---

## 3. 판단 근거가 적힌 결정 + 시안↔설명표 불일치

결정은 결론만 남기지 않는다 — 근거가 없으면 다음에 또 조사한다. 아래 #1~#12은 **기획 확인 전까지 전부 미해결**이며 원문은 `docs/design-verification.md` §5-4에도 그대로 있다.

> 출처: docs/design-verification.md §5-4 — 불일치 #1~#11 (스냅샷 `e1b6d7b` 577행~)

> 1. `ETC-2-PAGE-06-0`(보관함 목록) — 날짜 표기: 표 "기간 {YYYY.MM.DD} - {YYYY.MM.DD}" vs
>    목업 "단일 일시(2026.01.20 · 14:15)". 구현은 목업(그림) 따름, 기획 확인 필요.
> 2. `COM-2-PAGE-05-0`(탈퇴 사유) — 사유 문구: 목업 "다시 가입 예정이에요" vs 표(+같은 시트
>    Case A) "다시 가입할 거예요". 구현은 표 따름.
> 3. `COM-2-PAGE-05-0`(탈퇴 사유) — CTA 문구: 목업 3곳 "탈퇴하기" vs 표(+Case A) "선택 완료".
>    구현은 시각적 다수인 목업 따름(2026-09-11 결정).
> 4. `DUE-3-PAGE-04-0`(회비 요청) — 앱바: 목업 "회비 요청" vs 표 No.1 "납부 요청". 구현은
>    목업 따름.
> 5. `DUE-3-PAGE-06-0`(회비 수정) — 앱바: 표 "우측 X(닫기)" vs 목업 좌측 백버튼만, 우측
>    아이콘 없음. 구현은 목업 따름.
> 6. `DUE-3-PAGE-02-0`(회비 수정_모임원 선택) — 페이지 경로: 표 "납부관리 > 회비 상세 >
>    회비 수정하기 > 모임원 선택" vs 실제 진입은 "납부관리 > 회비 상세 > 모임원 선택"(회비
>    상세 ⋮ 메뉴에서 바로, 한 단계 얕음). 실제 구현(상세→바로 진입)이 시안 Case A 메뉴와
>    일치한다고 판단, 표 쪽이 낡은 경로 표기로 보임.
> 7. `FDR-2-PAGE-02-0`(예산 설정) — 빈 화면 문구: 목업 "'폴더'에서 장부를 생성해주세요." vs
>    표 "장부를 먼저 생성해주세요". 구현은 목업 따름.
> 8. `FDR-3-MODAL-03-0`(장부 이름 변경) — 글자수 제한: 목업 "최대 10자 이내로 입력해주세요."
>    vs 표 No.2/No.3 "최대 20자"(두 번 명시). **결론: 20자 확정(2026-09-18)** — 앱 내
>    이름/제목 필드 4/4(`FOLDER_NAME_MAX_LENGTH`/`LEDGER_NAME_MAX_LENGTH`/
>    `DUES_TITLE_MAX_LENGTH`/장부 이름 변경)가 20이고, 그중 3개는 서버 도메인 문서 근거
>    (`Folder.txt`/`Ledger.txt`—2026-08-30 서버 확인/`Dues.txt`), 같은 명세서 설명표 자체가
>    20을 두 번 명시한다. 시안 목업의 "10"만 유일하게 다르다 — 불일치는 이 목록에 #8로
>    분리 기록, 기획 확인 필요.
> 9. **수입 금액 부호 표기가 화면마다 다름**(2026-09-19 6-8, 코드 조사만 — 시안 대조 필요). 요청서 문구는
>    "부호 없음 6곳(AmountCard, 보고서 상세 2, ArchiveDetailScreen, 내역 상세 2) vs '+' 접두 2곳(ReportCard,
>    StatisticsScreen)"이었으나 코드로 다시 세니 **6/2가 재현되지 않는다** — 내역 상세 2곳
>    (`ReportEntryDetailScreen`/`ArchiveEntryDetailScreen`)은 INCOME이면 `+`를 붙인다. 실제 현황:
>    - **부호 없음(`N원`)**: `AmountCard`, `ReportByLedgerDetailScreen`, `ReportByPeriodDetailScreen`,
>      `ArchiveDetailScreen`(4곳). `TransactionListItem`은 값 자체의 부호만(수입 양수는 `+` 없음, 지출은 `-N원`) — 호출 6곳.
>    - **`+` 접두(수입만)**: `ReportCard`(`+N`, '원' 없음), `StatisticsScreen`(`+N원`),
>      `ReportEntryDetailScreen`, `ArchiveEntryDetailScreen`, `TransactionDetailScreen`, `Calendar`
>      셀(`amount > 0`일 때만)(6곳).
>    - 0일 때 `+0`이 나오던 `ReportCard`·`StatisticsScreen`은 0이면 부호를 안 붙이게만 고쳤다(6-8). `+`를 쓸지는
>      결정하지 않았다 — 어느 쪽이 맞는지는 시안(보고서 조회·통계·내역 상세) 대조 필요.
> 10. `FDR-1-PAGE-01-0`(폴더 메인) — 빈 화면(Case B) 문구: 설명표 No.5-1 "생성한 폴더/장부가 없어요" vs 시안 목업 제목 "아직 폴더 및 장부가 존재하지 않아요." + 부제 "새로운 장부를 생성하여 내역을 관리해보세요.". **구현은 목업을 따른다**(2026-09-19 확인 — 앱 문구는 이미 목업과 일치, 코드 변경 없음). 검색 무결과(Case D) 문구는 표에 별도 서술이 없고 목업 "해당 검색어에 대한 내역이 없어요." / "검색어를 다시 입력해주세요."와 앱이 일치. 표 쪽이 낡은 문구로 보이나 기획 확인 필요.
> 11. `FDR-1-PAGE-01-0`(폴더 메인) — 목록 개수 표기: 목업 "6 개"(숫자와 단위 사이 공백 있음) vs 설명표 No.3 "{N}개"(형식 `(N)개`, 예 `6개`, 공백 없음). 앱은 그동안 "1 건"(단위도 다름)이었고 2026-09-19 목업을 따라 **"N 개"(공백 있음)** 로 고쳤다 — 표기 자체(공백 유무)는 목업·표 불일치라 기획 확인 필요.
> 12. `ETC-3-PAGE-04-0`(증빙자료 상세) — 배경: 시안(원본 크롭 육안 확인, 2026-09-19) 흰색(앱바·하단 버튼 영역, 중앙은 사진 자리표시자) vs 구현 `FILL_INVERSE`(어두운 배경). 사진 뷰어 UX상 어두운 배경이 나을 수 있어 기획 확인 필요 — 이번엔 안 고침.
>

### 기타 확정 결정(근거 포함)

> 출처: docs/backend-requests.md — `ARCHIVE_EMPTY` 조건 확정(2026-09-12 실기기) (스냅샷 `e1b6d7b` 261행~)

> - **폴더 전체 백업이 항상 실패하던 원인**: `archiveService.ts`가 `POST /groups/{groupId}/folders/archive`
>   (실제로는 존재하지 않는 경로)를 부르고 있었습니다 — 실호출로 `404 RESOURCE_NOT_FOUND` 확인.
>   진짜 경로는 다른 archive 함수들과 같은 `POST /groups/{groupId}/archives`였고, 고친 뒤 실호출로
>   `422 ARCHIVE_EMPTY`까지 확인했습니다 — 라우팅 문제였을 뿐 서버 로직은 정상입니다. **2026-09-12
>   실기기로 조건도 정확히 확정**: 모임에 내역이 1건도 없으면 `ARCHIVE_EMPTY`(장부가 여러 개 있어도
>   막힘), 내역이 1건이라도 있으면 성공하고 이때 빈 장부까지 전부 함께 보관됩니다 — 다이얼로그 문구
>   ("현재까지 장부를 모두 보관할까요?")와 일치하는 의도된 동작으로 보여 서버 쪽 조치는 불필요합니다.
>   저희 쪽 에러 문구만 조건에 맞게 고쳤습니다("아직 등록된 내역이 없어요...").
> - **이메일 인증 발송/확인 경로**: 명세 `Auth.txt`엔 `/auth/email/verification`(단수)이라 적혀 있어
>   그대로 구현했는데, 실제 서버 경로는 `/auth/email-verifications`(복수, 하이픈)입니다. 예전 경로로는
>   `401`이 나서 "서버 미구현이라 나는 에러"로 오판하기 쉬웠습니다 — 새 경로로 고친 뒤 실호출하니
>   `500 MAIL_SEND_FAILED`가 나서 **라우팅은 정상, 개발 서버 메일 발송 설정만 안 돼 있는 상태**임을
>   확인했습니다(위 1순위 참고). 확인 응답 스키마도 예전 가정(`{verificationToken}`)과 달리
>   `{email, verified, verifiedAt}`이라 회원가입 요청에서 `verificationToken` 필드를 없앴습니다
>   (`POST /auth/signup` 스키마에도 그 필드가 없었습니다).

- **폴더 그리드 열 간격 16dp**: 명세서 원본 `폴더_메인화면.png`(1920×3778, 목업 프레임 360px = 1px = 1dp) 실측(2026-09-19, 6-11). 아이템 폭 `(W−48−32)/3` = 360dp에서 93.33dp. 앨범 그리드(`ReceiptGrid`)는 미실측(목업 여백 약 20/간격 약 7~8로 보임) — 묶지 않는다.
- **`FDR-1-PAGE-01-0` 개수 표기 "N 개"(공백 있음)**: 목업을 따름, 설명표는 `(N)개` — 불일치 #11.
- **빈 화면/검색 무결과 문구는 목업을 따른다**: 불일치 #10.
- **`ScreenContainer background` 미판정 화면은 `primary` + `미판정-추정 적용`으로 표시**, 코드가 이미 색을 준 화면은 그 색을 유지(`코드 기존값 유지`) — 근거 있는 값을 근거 없는 값으로 덮지 않는다(6-6).


---

## 4. 정정 이력 전수 발췌 (`※ 정정` / `정정(` 이 들어간 줄, 스냅샷 원문)

> 왜 틀렸는지가 자산이라 압축 대상에서 제외했고, 흩어져 잃어버리지 않도록 여기에도 모았다. `출처파일:행`은 스냅샷 `e1b6d7b` 기준.

### docs/design-verification.md (14줄)

- `design-verification.md:117` | ☐ | `DSH-2-PAGE-03-0` | 대시보드 캘린더 | Page | 총무 | 예정 | 1장 | `[확인필요]` | 미판정(코드 기존값 흰색 유지 — 캡처 필요) | `screens/Calendar/CalendarScreen.tsx` — **2026-09-12 정정: "이미지 0장"은 오류였다.** 원본 스펙시트(`화면명세서\대시보드\대시보드_캘린더.png`, 헤더 확인)가 실제로 존재한다 — IA의 디자인 '예정' 표기와 달리 시트 자체는 "디자인 중" 상태로 이미 나와 있다. UI 요소 표까지 확인: 3번 "월간 캘린더 뷰"는 일자별로 수입(+, 블루)/지출(-, 그레이) **두 줄을 따로** 표기하는데, 지금 `Calendar` 컴포넌트는 `income - expense` 합산값 하나만 표시한다(픽셀 대조 필요). 4번 "일별 상세 내역 리스트"는 날짜 선택 시 하단에 장부명/내역명/증빙아이콘/상태뱃지/금액을 보여주고 항목 탭 시 "내역 상세 보기"로 이동 — 현재 구현이 이 인터랙션을 다 갖췄는지 재확인 필요. 시안 확보로 "판별 불가"는 풀렸지만 위 두 가지가 새로 드러나 `[확인필요]` 등급은 유지, 사유만 교체. 상세: [design-diff.md#dsh-2-page-03-0-대시보드-캘린더](design-diff.md#dsh-2-page-03-0-대시보드-캘린더) |
- `design-verification.md:127` | ☐ | `DTB-2-PAGE-03-0` | 상세 내역_승인요청 | Page | 총무 | 완료 | 1장 | `[부족함]` | 미판정 | **2026-09-12 정정: "이미지 0장"은 오류였다.** 원본 스펙시트(`화면명세서\내역\내역_상세내역조회_승인요청내역.png`)가 존재한다 — 다만 그 표의 Screen ID 셀 자체가 `--`(공백)라 이 ID로 확정된 문서상 근거는 아니다. 그래도 페이지명("상세 내역_승인 요청 내역")과 페이지 경로("내역 > 상세 내역 > 승인 요청 내역")가 이 ID와 정확히 일치해 이 화면으로 판단한다. **내용 대조 결과 기존 판정이 틀렸다**: 승인 API(`POST /entries/{entryId}/approve`)가 `screens/Folder/TransactionDetailScreen.tsx`에 승인 버튼으로 붙어 있는 건 맞지만, 시안 UI 요소 3번은 지출일/내역명/담당자/장부/메모 **각 항목을 탭하면 개별 바텀시트로 그 자리에서 수정**하는 인라인 편집 화면을 요구한다("각 항목 터치 시 해당 정보를 수정할 수 있는 개별 바텀시트 호출") — 지금 구현은 이 필드들을 읽기 전용으로만 보여주고, 수정하려면 별도 편집 화면(연필 아이콘)으로 나가야 한다. 승인 자체는 되지만 시안이 요구하는 "승인 대기 중 바로 고쳐서 승인" 흐름은 없다 — `[미구현]`(시안 없어 착수 불가)이 아니라 `[부족함]`(화면은 있으나 인라인 편집 인터랙션이 빠짐)으로 재분류 |
- `design-verification.md:405` **정정(6-A, 2026-09-01)**: 아래 목록 중 `DUE-1-PAGE-01-0`/`DUE-2-PAGE-03-0`/`DUE-2-PAGE-03-1` 3개는 실제로는 이미지가 있다 — `design-index.json`이 스캔하는 폴더가 아니라 `화면명세서\DUE\` 안의 스펙 시트에 시안이 임베드돼 있어서 이 조사 때 놓쳤다. 나머지 DUE 화면(6-B/6-C 대상)도 같은 폴더를 다시 확인하면 이미지가 있을 가능성이 있다 — 이번엔 이 3개만 실제로 열어봤다.
- `design-verification.md:407` **정정(8-A, 2026-09-06)**: `ETC-5-SNACKBAR-06-0`(프로필 변경 완료)도 같은 이유로 실제로는 이미지가 있다 — `글로벌설정_내프로필_프로필변경.png`(ETC-4-PAGE-15-0) 스펙 시트 안에 "Case A" 스낵바로 임베드돼 있는데, **정작 그 안에서 Screen ID가 `COM-1-SNACKBAR-02-0`으로 잘못 적혀 있다**(§5-2 참고 — 이 ID가 완전히 다른 도메인 3곳에 더 재사용되고 있어 스펙 문서 전반에 퍼진 복붙 실수로 보인다). 문구("변경 사항이 저장되었어요.")는 확인해 반영했다.
- `design-verification.md:413` **정정(2026-09-11)**: `DUE-3-PAGE-04-0`(회비 요청 작성, 4장)·`DUE-4-SNACKBAR-01-0`(회비 생성 완료, 1장)도 `design-index.json`엔 실제로 이미지가 인덱싱돼 있다 — 이 §5-1 목록 자체가 낡은 스캔 결과였다(위 두 정정과 같은 패턴). 두 화면 다 코드도 이미 있었다(§2 해당 행 `[구현]` 참고).
- `design-verification.md:419` **정정(8-A, 2026-09-06)**: `ETC-4-SHEET-02-0`은 이제 매핑됐다 — "프로필 변경_사진 변경"(촬영/앨범선택/기본프로필 3항목 바텀시트), `ProfileEditScreen.tsx`에서 구현. `COM-1-SNACKBAR-02-0`은 여전히 IA에 없는 채로 남아 있다 — 위 §5-1 정정에서 확인했듯 실제로는 "프로필 변경 완료"(`ETC-5-SNACKBAR-06-0`)의 오기라 이 ID 자체로는 화면을 만들지 않았다. 같은 ID가 `DUE\모임원관리\`·`DUE\회비상세정보\`(2곳)·`ETC\모임 관리\`에도 붙어 있어(design-index.json 확인) 스펙 문서 전반에서 재사용된 복붙 실수로 보인다 — 그 각 위치의 실제 스낵바 문구를 다시 볼 때 이 오기를 감안할 것.
- `design-verification.md:558` 대상에서 뺐다. **정정 2건**: `ADD-4-SNACKBAR-01-0`(낡은 서술, 인앱 그리드 폐기됨), `ADD-4-PAGE-01-0`
- `design-verification.md:560` 로딩/에러" 4개 ID 중 폼 2개. 정정은 원문을 지우지 않고 해당 항목 바로 아래 `※ 정정(2026-09-18)`
- `design-verification.md:728` ※ 정정(2026-09-18 재검증): **사실과 다름(낡은 서술)** — "실제 구현은 숫자가 정확히 일치"라는 문장이 가리키던 인앱 사진 그리드 화면은 2026-09-11 이후 존재하지 않는다. `ReceiptGalleryPickerScreen.tsx:1-10`(주석)·`:26`에 적힌 대로 지금은 그리드를 그리지 않고 마운트 즉시 시스템 포토 피커(`launchImageLibrary`)를 띄우는 다리 역할뿐이라 "N 선택" 헤더 자체가 없다. 남은 개수 제한은 `TRANSACTION_REGISTER_RECEIPT_MAX = 10`(`transactionScreenText.ts:43`)과 `remainingSlots`(`TransactionRegisterScreen.tsx:588`)로만 걸린다. "시안 4 선택 오기 여부" 질문은 유효하나, 대조할 우리 쪽 화면이 없다.
- `design-verification.md:731` ※ 정정(2026-09-18 재검증): **부분적으로 사실과 다름** — "스캔 성공 즉시 금액이 자동으로 채워진다"는 서술은 충돌이 없을 때만 맞다. `TransactionRegisterScreen.tsx:540-554`(`handleScanComplete`)는 이미 입력된 금액이 0이 아니고 스캔값과 다르거나(`amountConflict`) 날짜가 오늘도 스캔값도 아니면(`dateConflict`) 즉시 반영하지 않고 `scanApply` 확인 다이얼로그(`:543-547`, `@screen ADD-5-MODAL-01-0`)를 띄워 `handleApplyScanResult`/`handleDiscardScanResult`(`:556-570`)로 사용자가 반영/취소를 고르게 한다. 충돌이 없을 때만(`:550-553`) 즉시 `setAmount`. 질문("별도 확인 단계가 있어야 하나")의 전제가 반쯤 이미 구현돼 있다 — 기획 확인 시 이 조건부 구조를 같이 전달할 것.
- `design-verification.md:1288` `docs/backend-requests.md` 1순위 기록은 **정정할 필요 없음 — 그대로 맞다.** 다만
- `design-verification.md:1825` | `CheckBox` | `shape` | `CheckBoxShape` | 0 | 필요 — `shape="circle"` 변형은 어떤 화면도 안 씀(기본값 `square`만 사용). ※ 정정(2026-09-19): 이 칸에 원래 "§5-4 기존 기록이 틀렸다"고 적었는데 **오독이었다** — 해당 서술은 §5-4가 아니라 §5-10(1352행)에 있고, 그 내용("시안이 정사각형이라 기본값 `square`가 이미 맞다 — 정상")은 `shape`를 넘긴다고 주장한 게 아니라 안 넘겨도 맞다는 뜻이라 사실과 일치한다. 기록은 틀리지 않았다 |
- `design-verification.md:1869` - 위 "추가" 열 정정: `ae095bd`는 폴더 이동 커밋이다. 최초 생성은 `BackupCard`·`ReportCard`·`Receipt` `609b114`(2026-08-05), `Tooltip` `ae095bd`, `PlaceholderNotice` `8bc30fd`(2026-07-30) — `git log --follow --diff-filter=A` 기준.
- `design-verification.md:1937` - 정정: 이 중 `FDR-2-PAGE-02-0`(`FolderBudgetListScreen`)은 입력 `TextField`가 `BottomSheet` 안(`:210-231`)에만 있어 시트가 자체로 키보드를 처리하므로, 제외하면 **19개 파일 / 21개 ID**다. 나머지 19개 파일은 검색창·폼이 화면 본문에 있다.

### docs/design-diff.md (2줄)

- `design-diff.md:131` `MoreScreen.tsx`가 부분 재구현됐지만, **전면 해소는 아니다** — 정정: "모임 관리" 항목(L102)만
- `design-diff.md:309` **2026-09-12 정정 — "디자인 없음"은 오류였다.** `design-index.json`(크롭 목업 인덱스)엔 이

### docs/api-mapping.md (2줄)

- `api-mapping.md:33` ### User (사용자) — 경로 정정: `/users/me`가 아니라 `/auth/me`
- `api-mapping.md:137` | `POST /dues/{duesId}/close` | 구현 완료. **미납자 있어도 마감 허용**으로 정정(2026-08-30, 기존 `UNPAID_MEMBER_EXISTS` 제약 제거 — "구현 수정 필요"라고 명세가 스스로 표시) | DUE-3-MODAL-02-0(회비 마감) — **[미구현]** | 없음(7-B 대상) | OWNER |

### §3 끝에서 옮긴 정정 발췌 (7-2에서 §3 → §4로 이동, 원문 그대로)

> 출처: docs/api-wiring.md — 이번 라운드(2026-09-11) 정정 요약(절 전체) (스냅샷 `e1b6d7b` 27행~)

> ## 이번 라운드(2026-09-11) 정정 요약
>
> - **프론트 버그 3건 발견 및 수정**: 이메일 인증 발송/확인 경로(`/auth/email/verification`
>   → 실제로는 `/auth/email-verifications`), 폴더 전체 백업 경로(`/groups/{id}/folders/archive`
>   → 실제로는 `/groups/{id}/archives`), 비밀번호 변경 바디에 `refreshToken` 누락. 셋 다
>   실호출로 재현·검증 후 코드 수정 완료(`services/authService.ts`, `archiveService.ts`).
> - **"미구현/시작 전"이었는데 실제론 구현된 것들**: 이메일 인증, 회원 탈퇴(`DELETE /auth/me`),
>   내 프로필(`GET/PATCH /auth/me`), 통계(`/statistics`), 보관함(`/archives` 전부),
>   대시보드 캘린더(`/calendar`), 대시보드 응답의 `calendar`/`upcomingDues`/
>   `hasUnreadNotification` 블록. 아래 각 절에 반영.
> - **Swagger에 있는데 이 문서에 없던 행 22개 추가**: 아래 "전수 대조 결과" 참고.
> - **정말로 서버에 없는 것 확인**: 알림·고객지원(Notification & Support) 전체, OCR —
>   Swagger 16개 컨트롤러 어디에도 관련 컨트롤러가 없다. "명세만 존재, 서버 없음"으로
>   명확히 표기.
>
> ---
>

> 출처: docs/design-verification.md §5-4 — 재검증 결과(2026-09-18) 서두 (스냅샷 `e1b6d7b` 554행~)

> **재검증 결과(2026-09-18 전수 대조): 확인됨 33 / 정정 2 / 검증 불가 2** — 대조 대상 37건(“어떤
> 화면이 어떤 컴포넌트/문구/동작을 쓴다”는 서술이 있는 항목, 아래 불일치 목록 1~9 포함) 기준.
> 서술이 서버 응답·에셋 상태·기획 질문뿐이라 코드로 대조할 게 없는 5건(`시안 0장 재확인`,
> `ADD-2-SHEET-07-0`, `DTB-3-MODAL-01-0`/`DTB-3-PAGE-01-0`, 알림 도메인 범위, D-2 상태 불명 16개)은
> 대상에서 뺐다. **정정 2건**: `ADD-4-SNACKBAR-01-0`(낡은 서술, 인앱 그리드 폐기됨), `ADD-4-PAGE-01-0`
> (충돌 시 확인 모달 누락). **검증 불가 2건**: `FDR-2-MODAL-02-0` "장부 0건" 서버 재현, "시안 없음 —
> 로딩/에러" 4개 ID 중 폼 2개. 정정은 원문을 지우지 않고 해당 항목 바로 아래 `※ 정정(2026-09-18)`
> 줄로 덧붙였다. 소스 코드는 건드리지 않았다.
>
> 참고 — 이 재검증의 계기였던 "`WithdrawReasonScreen`의 `CheckBox shape="circle"` 기록이 사실과
> 다르다"는 판단은 **잘못 짚은 것이다**: 그 서술은 §5-4가 아니라 §5-10(1352행 부근)에 있고,
> 실제 내용("시안이 정사각형이라 기본값 `square`가 맞다 — 정상")은 코드(`WithdrawReasonScreen.tsx:147-150`이
> `shape`를 안 넘김, `CheckBox.tsx:24` 기본값 `'square'`)와 일치한다. §5-17 표의 해당 칸에 이 정정을
> 남겼다. §5-4 전체가 미검증이라는 가설은 이번 대조로 반증됐다(위 33/37이 확인됨).
>
