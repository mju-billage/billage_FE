/**
 * 증빙 사진 첨부 흐름(촬영/갤러리/스캔) 공통 훅.
 * TransactionRegisterScreen 에 있던 것을 그대로 옮긴 것 — 동작은 한 글자도 다르지 않다.
 * 화면마다 다른 부분(스캔 인식값을 어떻게 반영할지)만 `onScanRecognized` 콜백으로 받는다.
 *
 * 파일 확장자가 .tsx인 이유: stageView/sheetsAndDialogs 가 JSX를 반환해야 해서다
 * (.ts 파일은 JSX 파싱이 안 된다).
 */
import { useCallback, useRef, useState } from 'react';
import { Linking } from 'react-native';
import Dialog from '../components/Feedback/Dialogs/Dialog';
import TransactionAttachMenuSheet from '../screens/Transactions/TransactionAttachMenuSheet';
import type { AttachMenuKey } from '../screens/Transactions/TransactionAttachMenuSheet';
import ReceiptScanningView, { type ScanOutcome } from '../screens/Transactions/ReceiptScanningView';
import ReceiptScanFailedView from '../screens/Transactions/ReceiptScanFailedView';
import ReceiptGalleryPickerScreen from '../screens/Transactions/ReceiptGalleryPickerScreen';
import { captureWithFeedback, type PickedImage } from '../utils/imagePicker';
import * as fileService from '../services/fileService';
import { toUserErrorMessage } from '../constants/apiErrorMessages';
import {
  SCAN_RESCAN_CANCEL_LABEL,
  SCAN_RESCAN_CONFIRM_DESCRIPTION,
  SCAN_RESCAN_CONFIRM_LABEL,
  SCAN_RESCAN_CONFIRM_TITLE,
  SNACKBAR_RECEIPT_ADDED,
  SNACKBAR_RECEIPT_MAX_LIMIT,
  SNACKBAR_SCAN_NOT_RECOGNIZED,
  SNACKBAR_SCAN_RATE_LIMITED,
  TRANSACTION_REGISTER_RECEIPT_MAX,
} from '../constants/transactionScreenText';
import {
  CAMERA_PERMISSION_DIALOG_DESCRIPTION,
  CAMERA_PERMISSION_DIALOG_TITLE,
  GALLERY_PERMISSION_DIALOG_DESCRIPTION,
  GALLERY_PERMISSION_DIALOG_TITLE,
  PERMISSION_DIALOG_CANCEL_LABEL,
  PERMISSION_SETTINGS_BUTTON_LABEL,
  SNACKBAR_IMAGE_TOO_LARGE,
  SNACKBAR_IMAGE_UPLOAD_FAILED,
} from '../constants/commonText';

export type ReceiptItem = {
  key: string;
  /** 로컬 미리보기(촬영·갤러리·스캔 직후). 서버에서 불러온 증빙은 비워두고 sourceUrl 을 쓴다. */
  previewUri: string;
  fileId?: number;
  uploading: boolean;
  fromScan?: boolean;
  /**
   * 업로드된 파일의 원본 서버 url(인증 전). 서버에서 불러온 증빙, 촬영·갤러리·스캔으로
   * 이번 세션에 올린 모든 경우에 채워진다(QA-041).
   */
  sourceUrl?: string;
};

/**
 * 스캔 결과 중 폼에 반영할 값. 서버는 `totalAmount` 만 항상 채우고 상호·결제일은
 * 못 읽으면 `null` 로 내리므로, 읽힌 것만 덮어쓰려고 따로 담는다.
 */
export type ScanApplyValues = {
  amount: number;
  date: string | null;
  merchantName: string | null;
};

type AttachStage =
  | { kind: 'form' }
  | { kind: 'scanning'; image: PickedImage }
  | { kind: 'scanFailed' }
  | { kind: 'gallery' };

type AttachDialog = 'none' | 'scanRescan' | 'cameraPermission' | 'galleryPermission';

type UseReceiptAttachmentsOptions = {
  showSnackbar: (message: string) => void;
  /**
   * 스캔 인식에 성공했을 때 호출된다. `attached.attached` 가 false 면 증빙 자리가
   * 꽉 차 사진은 못 붙었지만 인식값은 여전히 쓸모 있다는 뜻이다(원본 동작 그대로:
   * 이 경우엔 충돌 검사 없이 바로 반영해야 한다).
   */
  onScanRecognized?: (values: ScanApplyValues, meta: { attached: boolean }) => void;
  maxCount?: number;
};

export function useReceiptAttachments({
  showSnackbar,
  onScanRecognized,
  maxCount = TRANSACTION_REGISTER_RECEIPT_MAX,
}: UseReceiptAttachmentsOptions) {
  const [items, setItems] = useState<ReceiptItem[]>([]);
  /**
   * 증빙 목록의 최신 값. 스캔은 업로드와 인식으로 수 초가 걸리는데, 그 결과를 받는 콜백은
   * `ReceiptScanningView` 가 `useEffect(..., [])` 로 처음 받은 것을 계속 들고 있다 —
   * 그 콜백이 보는 `items` 는 스캔을 시작하던 순간의 값이라, 그걸로 상한을 재면
   * 그 사이 늘어난 장수를 못 보고 11번째를 붙일 수 있다. 상한 판정은 이 ref 로 한다.
   */
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const [stage, setStage] = useState<AttachStage>({ kind: 'form' });
  const [attachMenuVisible, setAttachMenuVisible] = useState(false);
  const [dialog, setDialog] = useState<AttachDialog>('none');

  const hasScanReceipt = items.some(item => item.fromScan);
  const isUploading = items.some(item => item.uploading);
  const isFullScreen = stage.kind !== 'form';
  const returnToForm = useCallback(() => setStage({ kind: 'form' }), []);

  const removeItem = (key: string) => {
    setItems(current => current.filter(item => item.key !== key));
  };

  const uploadReceiptImage = async (key: string, image: PickedImage) => {
    try {
      const uploaded = await fileService.uploadFile(
        image.uri,
        image.fileName,
        image.type,
        'RECEIPT',
      );
      setItems(current =>
        current.map(item =>
          item.key === key
            ? { ...item, uploading: false, fileId: Number(uploaded.id), sourceUrl: uploaded.url }
            : item,
        ),
      );
    } catch (error) {
      setItems(current => current.filter(item => item.key !== key));
      showSnackbar(toUserErrorMessage(error, SNACKBAR_IMAGE_UPLOAD_FAILED));
    }
  };

  const addPickedImages = async (images: PickedImage[]) => {
    for (const image of images) {
      if (image.size !== undefined && image.size > fileService.MAX_UPLOAD_FILE_SIZE_BYTES) {
        showSnackbar(SNACKBAR_IMAGE_TOO_LARGE);
        continue;
      }
      const key = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setItems(current => [...current, { key, previewUri: image.uri, uploading: true }]);
      await uploadReceiptImage(key, image);
    }
  };

  const handleTakePhoto = async (mode: 'photo' | 'scan') => {
    // 자리가 없으면 카메라를 열지 않는다. 찍고 나서 버리면 스캔은 업로드와 인식(건당 과금)을
    // 이미 마친 뒤라 서버에 주인 없는 파일만 남는다.
    if (itemsRef.current.length >= maxCount) {
      showSnackbar(SNACKBAR_RECEIPT_MAX_LIMIT);
      return;
    }
    const image = await captureWithFeedback(showSnackbar, () => setDialog('cameraPermission'));
    if (!image) {
      return;
    }
    if (mode === 'photo') {
      showSnackbar(SNACKBAR_RECEIPT_ADDED);
      addPickedImages([image]);
    } else {
      // 촬영본을 그대로 넘긴다 — 스캔 화면이 이걸 올리고 그 fileId 로 인식을 부른다.
      setStage({ kind: 'scanning', image });
    }
  };

  const openAttachMenu = () => setAttachMenuVisible(true);
  const closeAttachMenu = () => setAttachMenuVisible(false);

  const handleSelectAttachMenu = (key: AttachMenuKey) => {
    setAttachMenuVisible(false);
    if (key === 'scan') {
      if (hasScanReceipt) {
        setDialog('scanRescan');
      } else {
        handleTakePhoto('scan');
      }
    } else if (key === 'photo') {
      handleTakePhoto('photo');
    } else {
      setStage({ kind: 'gallery' });
    }
  };

  const handleConfirmRescan = () => {
    setDialog('none');
    handleTakePhoto('scan');
  };

  /**
   * 스캔한 영수증을 증빙 목록에 넣는다. 인식에 실패해도 파일은 올라가 있으므로
   * 똑같이 붙인다 — 사용자가 "인식은 안 됐지만 증빙으로는 남기기"를 할 수 있어야 한다.
   */
  const attachScannedReceipt = (
    fileId: number,
    previewUri: string,
    sourceUrl: string,
  ): boolean => {
    if (itemsRef.current.length >= maxCount) {
      // 인식하는 동안 다른 경로로 증빙이 다 찼다. 그냥 버리면 올린 파일이 어디에도 연결되지
      // 않은 채 서버에 남는데, 그건 업로더 본인만 지울 수 있어 사실상 아무도 손대지 못한다.
      fileService.deleteFile(String(fileId)).catch(() => {
        // 지우기까지 실패하면 남겨 두는 수밖에 없다. 사용자에게 또 알릴 일은 아니다.
      });
      return false;
    }
    setItems(current => [
      ...current,
      {
        key: `scan-${Date.now()}`,
        previewUri,
        uploading: false,
        fileId,
        sourceUrl,
        fromScan: true,
      },
    ]);
    return true;
  };

  const handleScanComplete = (outcome: ScanOutcome) => {
    if (outcome.kind === 'rateLimited') {
      // 서버가 외부 OCR 을 건당 과금으로 부른다. 재촬영을 권하는 실패 화면으로 보내면
      // 사용자가 곧장 다시 시도하게 되므로, 폼으로 돌려보내고 알리기만 한다.
      setStage({ kind: 'form' });
      showSnackbar(SNACKBAR_SCAN_RATE_LIMITED);
      return;
    }
    if (outcome.kind === 'failed') {
      setStage({ kind: 'form' });
      showSnackbar(outcome.message);
      return;
    }

    const attached = attachScannedReceipt(outcome.fileId, outcome.previewUri, outcome.sourceUrl);
    if (!attached) {
      // 인식값은 여전히 쓸모가 있으므로 화면에는 반영하되, 증빙이 안 붙은 것은 분명히 알린다.
      setStage({ kind: 'form' });
      setDialog('none');
      if (outcome.kind === 'ok') {
        onScanRecognized?.(
          {
            amount: outcome.result.totalAmount,
            date: outcome.result.purchasedOn,
            merchantName: outcome.result.merchantName,
          },
          { attached: false },
        );
      }
      showSnackbar(SNACKBAR_RECEIPT_MAX_LIMIT);
      return;
    }

    if (outcome.kind === 'notRecognized') {
      // 읽지는 못했지만 증빙으로는 붙었다. 그 사실이 실패 화면에 가려지지 않게 폼으로 돌린다.
      setStage({ kind: 'form' });
      setDialog('none');
      showSnackbar(outcome.message ?? SNACKBAR_SCAN_NOT_RECOGNIZED);
      return;
    }

    setStage({ kind: 'form' });
    onScanRecognized?.(
      {
        amount: outcome.result.totalAmount,
        date: outcome.result.purchasedOn,
        merchantName: outcome.result.merchantName,
      },
      { attached: true },
    );
  };

  let stageView = null;
  if (stage.kind === 'scanning') {
    stageView = <ReceiptScanningView image={stage.image} onComplete={handleScanComplete} />;
  } else if (stage.kind === 'scanFailed') {
    stageView = (
      <ReceiptScanFailedView
        onRetry={() => handleTakePhoto('scan')}
        onClose={() => setStage({ kind: 'form' })}
      />
    );
  } else if (stage.kind === 'gallery') {
    stageView = (
      <ReceiptGalleryPickerScreen
        remainingSlots={maxCount - items.length}
        onPicked={images => {
          setStage({ kind: 'form' });
          showSnackbar(SNACKBAR_RECEIPT_ADDED);
          addPickedImages(images);
        }}
        onBack={() => setStage({ kind: 'form' })}
        onMessage={showSnackbar}
        onPermanentlyDenied={() => setDialog('galleryPermission')}
      />
    );
  }

  const sheetsAndDialogs = (
    <>
      <TransactionAttachMenuSheet
        visible={attachMenuVisible}
        onClose={closeAttachMenu}
        onSelect={handleSelectAttachMenu}
      />
      <Dialog
        visible={dialog === 'scanRescan'}
        title={SCAN_RESCAN_CONFIRM_TITLE}
        description={SCAN_RESCAN_CONFIRM_DESCRIPTION}
        cancelLabel={SCAN_RESCAN_CANCEL_LABEL}
        confirmLabel={SCAN_RESCAN_CONFIRM_LABEL}
        onCancel={() => setDialog('none')}
        onConfirm={handleConfirmRescan}
      />
      <Dialog
        visible={dialog === 'cameraPermission'}
        title={CAMERA_PERMISSION_DIALOG_TITLE}
        description={CAMERA_PERMISSION_DIALOG_DESCRIPTION}
        cancelLabel={PERMISSION_DIALOG_CANCEL_LABEL}
        confirmLabel={PERMISSION_SETTINGS_BUTTON_LABEL}
        onCancel={() => setDialog('none')}
        onConfirm={() => {
          setDialog('none');
          Linking.openSettings();
        }}
      />
      <Dialog
        visible={dialog === 'galleryPermission'}
        title={GALLERY_PERMISSION_DIALOG_TITLE}
        description={GALLERY_PERMISSION_DIALOG_DESCRIPTION}
        cancelLabel={PERMISSION_DIALOG_CANCEL_LABEL}
        confirmLabel={PERMISSION_SETTINGS_BUTTON_LABEL}
        onCancel={() => setDialog('none')}
        onConfirm={() => {
          setDialog('none');
          Linking.openSettings();
        }}
      />
    </>
  );

  return {
    items,
    setItems,
    removeItem,
    openAttachMenu,
    isUploading,
    hasScanReceipt,
    isFullScreen,
    returnToForm,
    stageView,
    sheetsAndDialogs,
    maxCount,
  };
}
