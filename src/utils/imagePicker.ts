/**
 * `react-native-image-picker` 얇은 래퍼. 카메라(`pickFromCamera`)와
 * 갤러리(`pickFromGallery`)를 제공한다 —
 * `ReceiptGalleryPickerScreen`/`GroupImagePickerScreen` 둘 다 이걸 쓴다.
 *
 * `AndroidManifest.xml`에 `CAMERA`를 선언하면 그 순간부터 런타임 권한이
 * 된다 — `react-native-image-picker`는 이 권한을 대신 요청해주지 않는다
 * (라이브러리 문서에 명시). 그래서 `launchCamera` 호출 전에 항상 여기서
 * 직접 `PermissionsAndroid.request`를 부른다. 갤러리도 같은 이유로 매번
 * `launchImageLibrary` 앞에 권한을 확인한다 — 안드로이드 13(API 33)+의
 * 시스템 포토 피커가 실제로 권한 없이도 동작하는지는 라이브러리 문서만으로는
 * 단정할 수 없어(기기별/버전별 편차 보고 있음), 항상 요청하는 쪽이 안전하다.
 * 이미 허용돼 있으면 시스템이 다이얼로그 없이 바로 통과시키므로 매번 불러도
 * 부작용이 없다.
 */
import { Platform, PermissionsAndroid } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  SNACKBAR_CAMERA_ERROR,
  SNACKBAR_CAMERA_PERMISSION_DENIED,
  SNACKBAR_GALLERY_ERROR,
  SNACKBAR_GALLERY_PERMISSION_DENIED,
} from '../constants/commonText';

export type PickedImage = {
  uri: string;
  fileName: string;
  type: string;
  /** 바이트 단위. 라이브러리가 못 구하면 `undefined` — 이때는 크기 검사를 건너뛴다. */
  size?: number;
};

export type CameraResult =
  | { kind: 'ok'; image: PickedImage }
  | { kind: 'cancelled' }
  | { kind: 'denied'; permanent: boolean }
  | { kind: 'error'; code?: string; message?: string };

/**
 * 카메라 권한을 확인/요청한다. 이미 허용돼 있으면 시스템이 다이얼로그 없이
 * 바로 granted를 돌려주므로 매번 불러도 된다.
 */
async function ensureCameraPermission(): Promise<
  { granted: true } | { granted: false; permanent: boolean }
> {
  if (Platform.OS !== 'android') {
    return { granted: true };
  }
  const status = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
  );
  if (status === PermissionsAndroid.RESULTS.GRANTED) {
    return { granted: true };
  }
  // NEVER_ASK_AGAIN: 사용자가 "다시 묻지 않음"으로 거부 — 시스템 권한 다이얼로그를
  // 다시 띄울 방법이 없다, 설정 앱으로 보내야 한다. DENIED(일반 거부)는 다음에
  // 다시 요청하면 다이얼로그가 또 뜬다.
  return {
    granted: false,
    permanent: status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
  };
}

/** 카메라를 실행해 사진 한 장을 촬영한다. 취소/거부/실패를 구분해 반환한다. */
export async function pickFromCamera(): Promise<CameraResult> {
  const permission = await ensureCameraPermission();
  if (!permission.granted) {
    return { kind: 'denied', permanent: permission.permanent };
  }

  const result = await launchCamera({
    mediaType: 'photo',
    saveToPhotos: false,
  });

  if (result.didCancel) {
    return { kind: 'cancelled' };
  }
  if (result.errorCode) {
    console.warn(
      `[imagePicker] launchCamera 실패: ${result.errorCode} ${result.errorMessage ?? ''}`,
    );
    return { kind: 'error', code: result.errorCode, message: result.errorMessage };
  }
  const asset = result.assets?.[0];
  if (!asset?.uri) {
    console.warn('[imagePicker] launchCamera가 assets 없이 돌아옴');
    return { kind: 'error' };
  }

  return {
    kind: 'ok',
    image: {
      uri: asset.uri,
      fileName: asset.fileName ?? `photo-${Date.now()}.jpg`,
      type: asset.type ?? 'image/jpeg',
      size: asset.fileSize,
    },
  };
}

/**
 * `pickFromCamera()`를 부르고 취소가 아닌 실패를 호출부에 알린다 — 여러 화면
 * (증빙자료 첨부, 모임/내 프로필 이미지)이 중간 화면 없이 이 카메라 흐름을
 * 직접 쓰므로 실패 처리를 매번 다시 쓰지 않도록 공용화했다.
 *
 * 일반 거부/에러는 `onMessage`(스낵바 등 가벼운 알림)로 충분하지만, **영구
 * 거부("다시 묻지 않음")는 스낵바로 안 끝낸다** — 시스템 권한 다이얼로그를
 * 다시 띄울 방법이 없어 사용자가 설정 앱에 직접 들어가야 하고, 그걸 스낵바
 * 문구만으로 두면 그 사용자는 재설치 전까지 영영 촬영을 못 한다. 그래서
 * `onPermanentlyDenied`를 따로 받아 호출부가 `Dialog`(설정으로 이동 버튼)를
 * 띄우게 한다.
 */
export async function captureWithFeedback(
  onMessage: (message: string) => void,
  onPermanentlyDenied: () => void,
): Promise<PickedImage | null> {
  const result = await pickFromCamera();
  if (result.kind === 'ok') {
    return result.image;
  }
  if (result.kind === 'denied') {
    if (result.permanent) {
      onPermanentlyDenied();
    } else {
      onMessage(SNACKBAR_CAMERA_PERMISSION_DENIED);
    }
    return null;
  }
  if (result.kind === 'error') {
    onMessage(SNACKBAR_CAMERA_ERROR);
    return null;
  }
  // cancelled — 조용히 무시.
  return null;
}

export type GalleryResult =
  | { kind: 'ok'; images: PickedImage[] }
  | { kind: 'cancelled' }
  | { kind: 'denied'; permanent: boolean }
  | { kind: 'error'; code?: string; message?: string };

/**
 * 갤러리 권한을 확인/요청한다. 안드로이드 13(API 33)부터 권한 이름이
 * `READ_MEDIA_IMAGES`로 바뀌었다(`READ_EXTERNAL_STORAGE`는 그 아래 버전만
 * `AndroidManifest.xml`에 `maxSdkVersion="32"`로 선언해뒀다) — 실행 중인
 * 기기 버전에 맞는 쪽을 골라 요청한다.
 */
async function ensureGalleryPermission(): Promise<
  { granted: true } | { granted: false; permanent: boolean }
> {
  if (Platform.OS !== 'android') {
    return { granted: true };
  }
  const permission =
    Platform.Version >= 33
      ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
  const status = await PermissionsAndroid.request(permission);
  if (status === PermissionsAndroid.RESULTS.GRANTED) {
    return { granted: true };
  }
  return {
    granted: false,
    permanent: status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
  };
}

/** 갤러리에서 사진을 고른다(다중 선택 가능). `limit`은 이번에 고를 수 있는 남은 자리 수다. */
export async function pickFromGallery(limit: number): Promise<GalleryResult> {
  const permission = await ensureGalleryPermission();
  if (!permission.granted) {
    return { kind: 'denied', permanent: permission.permanent };
  }

  const result = await launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: limit,
  });

  if (result.didCancel) {
    return { kind: 'cancelled' };
  }
  if (result.errorCode) {
    console.warn(
      `[imagePicker] launchImageLibrary 실패: ${result.errorCode} ${result.errorMessage ?? ''}`,
    );
    return { kind: 'error', code: result.errorCode, message: result.errorMessage };
  }
  const assets = result.assets ?? [];
  if (assets.length === 0) {
    return { kind: 'cancelled' };
  }

  return {
    kind: 'ok',
    images: assets.map((asset, index) => ({
      uri: asset.uri ?? '',
      fileName: asset.fileName ?? `gallery-${Date.now()}-${index}.jpg`,
      type: asset.type ?? 'image/jpeg',
      size: asset.fileSize,
    })),
  };
}

/**
 * `pickFromGallery()`를 부르고 취소가 아닌 실패를 호출부에 알린다 —
 * `captureWithFeedback`과 같은 패턴(일반 거부/에러는 스낵바, 영구 거부는
 * `onPermanentlyDenied`로 Dialog).
 */
export async function pickGalleryWithFeedback(
  limit: number,
  onMessage: (message: string) => void,
  onPermanentlyDenied: () => void,
): Promise<PickedImage[] | null> {
  const result = await pickFromGallery(limit);
  if (result.kind === 'ok') {
    return result.images;
  }
  if (result.kind === 'denied') {
    if (result.permanent) {
      onPermanentlyDenied();
    } else {
      onMessage(SNACKBAR_GALLERY_PERMISSION_DENIED);
    }
    return null;
  }
  if (result.kind === 'error') {
    onMessage(SNACKBAR_GALLERY_ERROR);
    return null;
  }
  // cancelled — 조용히 무시.
  return null;
}
