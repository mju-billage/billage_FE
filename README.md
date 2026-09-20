# 📱 Billage React Native 프로젝트 가이드

> 이 문서는 프로젝트 실행 방법과, 코드 일관성을 위해 반드시 지켜야 하는 규칙을 정리한 문서입니다.
> 새로운 규칙이 필요하면 팀 논의 후 이 문서에 추가합니다.

---

## 0. 시작하기 (Getting Started)

### 0.1 Metro 실행

프로젝트 루트에서 JS 번들러인 Metro를 먼저 실행합니다.

```sh
npm start
```

### 0.2 앱 빌드 및 실행

Metro가 켜진 상태에서, 새 터미널을 열어 아래 명령으로 빌드합니다.

**Android**

에뮬레이터가 꺼져 있다면 먼저 Android Studio의 Device Manager에서 실행하거나, 터미널에서:

```sh
emulator -avd <AVD 이름>
```

에뮬레이터가 부팅되면:

```sh
npm run android
```

**iOS** (macOS 전용)

```sh
bundle install          # 최초 1회
bundle exec pod install # 네이티브 의존성 변경 시마다
npm run ios
```

### 0.3 코드 수정 확인

코드를 저장하면 [Fast Refresh](https://reactnative.dev/docs/fast-refresh)로 실행 중인 앱에 즉시 반영됩니다. 반영이 안 되면 `Ctrl+M`(Windows/Linux) 또는 `Cmd+M`(macOS)으로 Dev Menu를 열고 Reload 하세요.

### 0.4 APK 생성 (Android)

`.env`(`.env.example` 참고)를 채운 뒤 프로젝트 루트에서:

```sh
cd android
./gradlew assembleRelease      # Windows: gradlew.bat assembleRelease
```

결과물: `android/app/build/outputs/apk/release/app-release.apk`. 현재 `release` 빌드타입이 **debug 키스토어로 서명**(`android/app/build.gradle`)되므로 배포용이 아니라 테스트 설치용이다. 스토어 배포 전엔 별도 keystore와 signingConfig가 필요하다. 개발 중 설치는 `npm run android`(0.2)로 충분하다.

---

## 1. 네이밍 규칙

### 1.1 TypeScript / React 코드

| 대상 | 규칙 | 예시 |
|---|---|---|
| 컴포넌트 | PascalCase | `SignupScreen`, `SignupButton` |
| 함수 / 변수 | camelCase | `fetchUserData()`, `isLoggedIn` |
| 커스텀 훅 | `use` 접두사 + camelCase | `useAuth()`, `useSignupForm()` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `BASE_URL` |
| 타입 / 인터페이스 | PascalCase | `RootStackParamList`, `SignupButtonProps` |
| 제네릭 타입 | 대문자 한 글자 | `T`, `K`, `V` |
| Boolean 변수 | is / has / can 접두사 | `isLoading`, `hasPermission`, `canSubmit` |

- 축약어는 사용하지 않는다. (`usr` ❌ → `user` ⭕)
- 함수 이름은 동사로 시작한다. (`userData()` ❌ → `getUserData()` ⭕)
- Props 타입 이름은 `{컴포넌트명}Props`로 짓는다. (`props` ❌ → `SignupButtonProps` ⭕)
- 이벤트 핸들러는 `on` + 동사(Props) / `handle` + 동사(내부 함수)로 짓는다. (`pppp` ❌ → `onPress`(prop), `handlePress`(내부 함수) ⭕)

### 1.2 파일 / 폴더

| 대상 | 규칙 | 예시 |
|---|---|---|
| 컴포넌트 / 화면 파일 | PascalCase, 대표 export와 이름 동일 | `SignupButton.tsx`, `SignupScreen.tsx` |
| 훅 파일 | camelCase | `useAuth.ts` |
| 유틸 / 상수 파일 | camelCase | `formatDate.ts`, `constants.ts` |
| 폴더 | camelCase | `screens`, `components`, `navigation` |

- 파일 이름은 그 안의 대표 컴포넌트/함수 이름과 동일하게 한다.

---

## 2. 프로젝트 구조

**타입(역할) 기반 구조**를 사용한다. 새 화면을 추가할 때는 `screens/`에, 재사용 컴포넌트는 `components/`에 추가한다.

```
src
├── assets
│   └── images          # 이미지, 폰트 등 정적 리소스
├── components           # 여러 화면에서 재사용하는 프레젠테이셔널 컴포넌트
├── constants             # 색상, 약관 전문 등 화면 전반에서 재사용하는 상수
├── screens               # 화면 단위 컴포넌트 (route 하나당 폴더/파일 하나)
├── navigation            # Navigator, RootStackParamList 등 네비게이션 설정
├── hooks                 # 재사용 커스텀 훅
├── services              # API 호출, 외부 연동 (서버 응답은 여기서만 다룬다)
├── types                 # 여러 파일에서 공유하는 타입 정의
└── utils                 # 순수 함수 유틸 (포맷터, 검증 함수 등)
```

규칙:
- 서버 응답 타입(DTO)은 `services/`에만 두고, 화면에서는 가공된 타입(`types/`)으로 변환해서 사용한다.
- 한 화면에 관련된 로직이 커지면 `screens/{화면명}/` 폴더로 승격하고, 그 안에 화면 전용 컴포넌트·훅을 함께 둔다.
- `components/`에 두는 컴포넌트는 특정 화면의 상태를 직접 알아서는 안 된다. (props로만 데이터를 받는다)

---

## 3. 아키텍처 규칙

- 데이터 흐름은 단방향으로: `Screen → Hook/Service → State`, 상태 변경은 다시 Screen을 리렌더링하는 방식으로만 이루어진다.
- **화면 컴포넌트 (`screens/`)**
    - UI 조합과 사용자 입력 전달만 담당한다. 복잡한 로직은 커스텀 훅으로 분리한다.
    - 콘솔 로그, 임시 테스트 코드는 커밋 전 제거한다.
- **커스텀 훅 (`hooks/`)**
    - 상태와 로직을 화면에서 분리할 때 사용한다. 훅은 컴포넌트 없이도 로직만 테스트할 수 있어야 한다.
- **서비스 (`services/`)**
    - 네트워크/스토리지 접근을 화면과 훅이 직접 하지 않고 이 레이어를 통해서만 하도록 한다.
- **네비게이션 (`navigation/`)**
    - 모든 라우트 파라미터는 `RootStackParamList`(또는 하위 네비게이터별 타입)에 명시하고, 화면 컴포넌트는 이 타입으로 props를 받는다. `any` 타입의 네비게이션 prop 금지.
- 전역 상태 관리 라이브러리(Context, Zustand 등)를 도입하면 이 섹션에 사용 규칙을 추가한다.

---

## 4. 코드 스타일

- ESLint(`@react-native` 설정)와 Prettier를 그대로 따른다. 커밋 전 아래 명령으로 검사/포맷한다.
  ```sh
  npm run lint
  npx prettier --write .
  ```
- 프로젝트 Prettier 설정(`.prettierrc.js`): 문자열은 `'작은따옴표'`, 여러 줄 값에는 trailing comma, 화살표 함수 파라미터는 괄호 생략(`x => x`).
- 들여쓰기: 스페이스 2칸 (Prettier 기본값).
- 함수형 컴포넌트만 사용한다. 클래스 컴포넌트 금지.
- 컴포넌트는 `export default`로 내보내고, 파일당 하나의 컴포넌트만 정의한다.
- 타입 정의:
    - `any` 사용 금지. 타입을 모르면 `unknown` + 타입 가드를 사용한다.
    - Props 타입은 `type`으로 선언한다 (`interface`보다 `type` 우선).
- 널/옵셔널 처리:
    - `!`(non-null assertion) 사용 금지. 옵셔널 체이닝(`?.`)과 기본값으로 처리한다.
- `let`보다 `const`를 우선 사용한다.
- 매직 넘버/문자열 금지. 의미 있는 상수로 추출한다. (`type === "Naver"` 반복 ❌ → `SocialType` 상수/유니언 타입으로 추출 ⭕)
- 스타일은 항상 `StyleSheet.create`로 정의하고, JSX에 인라인 스타일 객체를 직접 작성하지 않는다.

---

## 5. Git 규칙

### 5.1 브랜치

```
main        # 배포 가능한 상태만 유지
develop     # 개발 통합 브랜치
feature/*   # 기능 개발  → feature/signup
fix/*       # 버그 수정  → fix/crash-on-splash
refactor/*  # 리팩토링   → refactor/navigation-types
```

- `main`, `develop`에 직접 push 금지. 반드시 PR을 통해 병합한다.

### 5.2 커밋 메시지 (Conventional Commits)

```
feat: 회원가입 화면 UI 구현
fix: 스플래시 화면 진입 시 크래시 수정
refactor: RootNavigator 타입 분리
docs: README 실행 방법 추가
chore: 라이브러리 버전 업데이트
style: 코드 포맷팅 (로직 변경 없음)
test: SignupScreen 테스트 추가
```

- 제목은 50자 이내, 무엇을 왜 했는지 알 수 있게 작성한다.
- 하나의 커밋에는 하나의 작업만 담는다.

### 5.3 PR

- PR 제목은 커밋 컨벤션과 동일한 형식으로 작성한다.
- PR 본문에 작업 내용, 스크린샷(UI 변경 시), 테스트 방법을 적는다.

---

## 6. 금지 / 주의 사항

- 🚫 **하드코딩 문자열 금지** — 사용자에게 보이는 모든 텍스트는 상수 파일이나 i18n 리소스로 분리한다.
- 🚫 **API 키, 시크릿을 코드에 직접 작성 금지** — `.env` + `react-native-config` 등으로 관리하고, 시크릿 파일은 `.gitignore`에 포함한다.
- 🚫 **커밋에 `console.log` 남기지 않기** — 디버깅용 로그는 PR 전에 제거한다.
- 🚫 **`any` 타입 남용 금지** — 타입을 모르면 `unknown`으로 시작해 좁혀 나간다.
- 🚫 **주석 처리된 죽은 코드 커밋 금지** — 필요 없는 코드는 삭제한다. (Git에 기록이 남는다)
- 🚫 **의미 없는 임시 이름 금지** (`pppp`, `data2`, `temp` 등) — 실제 역할을 드러내는 이름을 쓴다.
- ⚠️ 리스트(`FlatList`/`.map()`)에는 반드시 안정적인 `key`를 지정한다.
- ⚠️ 이미지/폰트 등 정적 리소스는 `assets/` 하위에 종류별로 정리한다.
- ⚠️ 네비게이션 파라미터를 추가/변경하면 `RootStackParamList`도 함께 갱신한다.

---

## 7. 주석 규칙

**Export되는 컴포넌트/함수/훅에는 어떤 역할을 하는지 설명하는 주석을 작성한다.** JSDoc 형식(`/** */`)을 사용한다.

```ts
/**
 * 이메일과 비밀번호로 로그인을 요청하고 결과를 상태로 반환한다.
 *
 * @param email 사용자 이메일
 * @param password 사용자 비밀번호
 */
async function login(email: string, password: string) {
  // ...
}
```

- 한 줄로 충분한 간단한 함수는 설명 한 줄만 작성해도 된다.

```ts
/** 입력된 이메일이 올바른 형식인지 검사한다. */
function isValidEmail(email: string): boolean {
  // ...
}
```

- 함수 내부 주석은 "무엇을"이 아니라 "왜"를 설명할 때만 작성한다.
    - `// i를 1 증가시킨다` ❌ (코드만 봐도 안다)
    - `// 서버가 0-based index를 요구해서 -1 처리` ⭕
- `TODO`, `FIXME` 태그 규칙:
    - `// TODO: 회원가입 API 연동 필요` — 나중에 할 작업
    - `// FIXME: Android에서 키보드가 안 닫히는 문제` — 알려진 버그
