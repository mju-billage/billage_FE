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
  size?: number;
};

export type CameraResult =
  | { kind: 'ok'; image: PickedImage }
  | { kind: 'cancelled' }
  | { kind: 'denied'; permanent: boolean }
  | { kind: 'error'; code?: string; message?: string };

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
  return {
    granted: false,
    permanent: status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
  };
}

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
  return null;
}

export type GalleryResult =
  | { kind: 'ok'; images: PickedImage[] }
  | { kind: 'cancelled' }
  | { kind: 'denied'; permanent: boolean }
  | { kind: 'error'; code?: string; message?: string };

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
  return null;
}
