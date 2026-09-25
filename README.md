# Billage 빌드·실행

## 요구 환경
- Node >= 22.11.0
- JDK 17 이상
- Android SDK: compileSdk 36, build-tools 36.0.0, minSdk 24, NDK 27.1.12297006
- Android 에뮬레이터 또는 실기기 (iOS는 macOS + Xcode + CocoaPods, 미착수)

## 설치
```sh
npm install
```

## 개발 실행
```sh
npm start            # Metro
npm run android      # 다른 터미널에서 (= npx react-native run-android)
```

## 릴리즈 APK 빌드
```sh
cd android
./gradlew assembleRelease      # Windows: gradlew.bat assembleRelease
```
결과: `android/app/build/outputs/apk/release/app-release.apk`

release 빌드는 debug 키스토어로 서명된다(`android/app/build.gradle`). 스토어 배포용이 아니다.

## `.env` 키
`.env.example`을 복사해 값을 채운다.
- `KAKAO_NATIVE_APP_KEY`
- `NAVER_CLIENT_ID`
- `NAVER_CLIENT_SECRET`
- `GOOGLE_WEB_CLIENT_ID`
- `API_BASE_URL`
