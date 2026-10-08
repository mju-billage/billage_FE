/** @screen ADD-1-PAGE-01-0 내역 추가 */
/** @screen DTB-3-PAGE-02-0 상세 내역_수정 (existing transactionId로 진입 시) */
/** @screen DTB-4-MODAL-01-0 상세 내역_수정 이탈 안내 (leave 다이얼로그) */
/** @screen ADD-2-MODAL-01-0 이탈 방지 모달 (DTB-4-MODAL-01-0과 동일 다이얼로그, IA ID 중복) */
/** @screen ADD-4-PAGE-01-0 영수증 스캔 성공 (handleScanComplete에서 필드 반영) */
/** @screen ADD-5-MODAL-01-0 스캔 내용 반영 확인 모달 (scanApply 다이얼로그) */
/** @screen ADD-2-SNACKBAR-01-0 등록 완료 (SNACKBAR_TRANSACTION_ADDED[_PENDING]) */
/**
 * 4-A(Entry API 연동): 등록(신규)은 항상 실 서버로 간다 — id가 없으면
 * `mode='createReal'`, 있으면 `mode='editReal'`이다. (4-B 정리: DTB 전체 목록이
 * 실 API로 전환되며 `dtb-tx-N` 목 id를 만들어내는 곳이 사라져 이 화면의 옛
 * `editMock` 분기가 도달 불가능해졌다 — 확인 후 분기와 `types/transaction.ts`를
 * 함께 걷어냈다.)
 *
 * "담당자" 필드(2026-09-05 연동): `managerUserId`는 이 모임의 관리자(`GroupMembership`,
 * User 기준)여야 한다 — 납부 명단(`Member`)은 담당자가 될 수 없다(Entry.txt §4). 그래서
 * 선택 목록도 `groupMembershipService.getMemberships()`에서 가져온다.
 *
 * 실 API로 가는 두 모드에서 여전히 뺀 것:
 *  - "장부" 변경(editReal만): `PATCH /entries/{id}`에 ledgerId가 없어 등록 후엔
 *    장부를 옮길 수 없다 — 표시만 하고 못 누르게 막았다.
 *
 * 2026-09-11부터 증빙 실제 업로드가 붙었다 — 카메라/갤러리로 고른 사진을
 * 촬영·선택 직후 `fileService.uploadFile(..., 'RECEIPT')`로 바로 업로드하고,
 * 받은 fileId를 등록/수정 요청의 `receiptFileIds`에 담는다(`receiptItems`,
 * 업로드 중인 항목은 fileId가 없어 자동으로 제외된다).
 *
 * 2026-09-21: 영수증 스캔(`scan`)도 실제 OCR로 바뀌었다(`utils/mockOcr.ts` 삭제).
 * 촬영본을 `ReceiptScanningView`가 업로드한 뒤 그 fileId로 `POST /files/{id}/ocr`을
 * 부른다. **서버는 `totalAmount`만 항상 채우므로** 상호·결제일은 읽힌 것만 덮어쓴다
 * (`applyScanValues`). 인식에 실패해도 사진은 이미 올라가 있어 증빙으로 붙인다.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import SegmentedControl from '../../components/Input/Control/SegmentedControl';
import SelectionListItem from '../../components/Data Display/Lists/SelectionListItem';
import AttachmentAddButton from '../../components/Input/Button/AttachmentAddButton';
import Thumbnail from '../../components/Data Display/Image Placeholder/Thumbnail';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import TransactionAmountSheet from './TransactionAmountSheet';
import TransactionDateSheet from './TransactionDateSheet';
import TransactionAttachMenuSheet from './TransactionAttachMenuSheet';
import type { AttachMenuKey } from './TransactionAttachMenuSheet';
import TransactionSingleSelectSheet from './TransactionSingleSelectSheet';
import TransactionTextInputSheet from './TransactionTextInputSheet';
import { captureWithFeedback, type PickedImage } from '../../utils/imagePicker';
import ReceiptScanningView, { type ScanOutcome } from './ReceiptScanningView';
import ReceiptScanFailedView from './ReceiptScanFailedView';
import ReceiptGalleryPickerScreen from './ReceiptGalleryPickerScreen';
import { todayKey } from '../../utils/calendarGrid';
import { getActiveGroup } from '../../types/group';
import * as ledgerService from '../../services/ledgerService';
import * as entryService from '../../services/entryService';
import * as groupMembershipService from '../../services/groupMembershipService';
import * as fileService from '../../services/fileService';
import { ApiError } from '../../services/apiClient';
import { buildAuthenticatedImageSource } from '../../utils/authenticatedImage';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
  toUserErrorMessage,
} from '../../constants/apiErrorMessages';
import {
  FILTER_TYPE_EXPENSE,
  FILTER_TYPE_INCOME,
  TRANSACTION_DATE_LABEL_EXPENSE,
  TRANSACTION_DATE_LABEL_INCOME,
  TRANSACTION_ITEM_NAME_LABEL,
  TRANSACTION_LEDGER_LABEL,
  TRANSACTION_MANAGER_LABEL,
  TRANSACTION_MEMO_LABEL,
  TRANSACTION_MEMO_PLACEHOLDER,
} from '../../constants/ledgerScreenText';
import {
  DATE_SHEET_TITLE_EXPENSE,
  DATE_SHEET_TITLE_INCOME,
  ITEM_NAME_MAX_LENGTH,
  ITEM_NAME_SHEET_PLACEHOLDER,
  ITEM_NAME_SHEET_TITLE,
  MANAGER_SELECT_SHEET_TITLE,
  MEMO_MAX_LENGTH,
  MEMO_SHEET_PLACEHOLDER,
  MEMO_SHEET_TITLE,
  SCAN_APPLY_CANCEL_LABEL,
  SCAN_APPLY_CONFIRM_DESCRIPTION,
  SCAN_APPLY_CONFIRM_LABEL,
  SCAN_APPLY_CONFIRM_TITLE,
  SCAN_RESCAN_CANCEL_LABEL,
  SCAN_RESCAN_CONFIRM_DESCRIPTION,
  SCAN_RESCAN_CONFIRM_LABEL,
  SCAN_RESCAN_CONFIRM_TITLE,
  SNACKBAR_RECEIPT_ADDED,
  SNACKBAR_RECEIPT_MAX_LIMIT,
  SNACKBAR_SCAN_NOT_RECOGNIZED,
  SNACKBAR_SCAN_RATE_LIMITED,
  SNACKBAR_TRANSACTION_ADDED,
  SNACKBAR_TRANSACTION_ADDED_PENDING,
  SNACKBAR_TRANSACTION_UPDATED,
  TRANSACTION_REGISTER_AMOUNT_PLACEHOLDER,
  TRANSACTION_REGISTER_ITEM_NAME_PLACEHOLDER,
  TRANSACTION_REGISTER_LEAVE_CANCEL_LABEL,
  TRANSACTION_REGISTER_LEAVE_CONFIRM_LABEL,
  TRANSACTION_REGISTER_LEAVE_DESCRIPTION,
  TRANSACTION_REGISTER_LEAVE_TITLE,
  TRANSACTION_REGISTER_LEDGER_LOCKED_HINT,
  TRANSACTION_REGISTER_LEDGER_PLACEHOLDER,
  TRANSACTION_REGISTER_LOADING,
  TRANSACTION_REGISTER_MANAGER_PLACEHOLDER,
  TRANSACTION_REGISTER_RETRY_LABEL,
  TRANSACTION_REGISTER_RECEIPT_LABEL,
  TRANSACTION_REGISTER_RECEIPT_MAX,
  TRANSACTION_REGISTER_SUBMIT_LABEL,
  TRANSACTION_REGISTER_TITLE,
} from '../../constants/transactionScreenText';
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import {
  CAMERA_PERMISSION_DIALOG_DESCRIPTION,
  CAMERA_PERMISSION_DIALOG_TITLE,
  GALLERY_PERMISSION_DIALOG_DESCRIPTION,
  GALLERY_PERMISSION_DIALOG_TITLE,
  PERMISSION_DIALOG_CANCEL_LABEL,
  PERMISSION_SETTINGS_BUTTON_LABEL,
  SNACKBAR_IMAGE_TOO_LARGE,
  SNACKBAR_IMAGE_UPLOAD_FAILED,
} from '../../constants/commonText';

type TransactionKind = 'income' | 'expense';
type RegisterMode = 'createReal' | 'editReal';

type RegisterStage =
  | { kind: 'form' }
  | { kind: 'scanning'; image: PickedImage }
  | { kind: 'scanFailed' }
  | { kind: 'gallery' };

type ActiveSheet =
  | 'none'
  | 'amount'
  | 'date'
  | 'itemName'
  | 'manager'
  | 'ledger'
  | 'memo'
  | 'attachMenu';

/**
 * 스캔 결과 중 폼에 반영할 값. 서버는 `totalAmount` 만 항상 채우고 상호·결제일은
 * 못 읽으면 `null` 로 내리므로, 읽힌 것만 덮어쓰려고 따로 담는다.
 */
type ScanApplyValues = {
  amount: number;
  date: string | null;
  merchantName: string | null;
};

type ActiveDialog =
  | 'none'
  | 'leave'
  | 'scanRescan'
  | 'scanApply'
  | 'cameraPermission'
  | 'galleryPermission';
type ScreenLoadState = 'loading' | 'error' | 'ready';

type LedgerOption = { id: string; name: string };

type ReceiptItem = {
  key: string;
  previewUri: string;
  previewHeaders?: Record<string, string>;
  fileId?: number;
  uploading: boolean;
  fromScan?: boolean;
};

const SNACKBAR_AUTO_HIDE_MS = 1600;

function toIsoDate(dotDate: string): string {
  return dotDate.replace(/\./g, '-');
}

function fromIsoDate(isoDate: string): string {
  return isoDate.replace(/-/g, '.');
}

function sameNumberSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((value, index) => value === sortedB[index]);
}

type TransactionRegisterNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TransactionRegister'
>;
type TransactionRegisterRouteProp = RouteProp<
  RootStackParamList,
  'TransactionRegister'
>;

function TransactionRegisterScreen() {
  const navigation = useNavigation<TransactionRegisterNavigationProp>();
  const route = useRoute<TransactionRegisterRouteProp>();
  const transactionId = route.params?.transactionId;

  const mode: RegisterMode = !transactionId ? 'createReal' : 'editReal';

  const [transactionKind, setTransactionKind] = useState<TransactionKind>('expense');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(todayKey());
  const [itemName, setItemName] = useState('');
  const [managerUserId, setManagerUserId] = useState<string | undefined>(undefined);
  const [managerName, setManagerName] = useState('');
  const [managerOptions, setManagerOptions] = useState<
    { key: string; label: string }[]
  >([]);
  const [ledgerId, setLedgerId] = useState('');
  const [ledgerName, setLedgerName] = useState('');
  const [memo, setMemo] = useState('');
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  /**
   * 증빙 목록의 최신 값. 스캔은 업로드와 인식으로 수 초가 걸리는데, 그 결과를 받는 콜백은
   * `ReceiptScanningView` 가 `useEffect(..., [])` 로 처음 받은 것을 계속 들고 있다 —
   * 그 콜백이 보는 `receiptItems` 는 스캔을 시작하던 순간의 값이라, 그걸로 상한을 재면
   * 그 사이 늘어난 장수를 못 보고 11번째를 붙일 수 있다. 상한 판정은 이 ref 로 한다.
   */
  const receiptItemsRef = useRef(receiptItems);
  receiptItemsRef.current = receiptItems;

  const [ledgerOptions, setLedgerOptions] = useState<LedgerOption[]>([]);
  const [screenLoadState, setScreenLoadState] = useState<ScreenLoadState>('loading');
  const [screenErrorMessage, setScreenErrorMessage] = useState('');

  const [initialSnapshot, setInitialSnapshot] = useState<{
    title: string;
    amount: number;
    occurredOn: string;
    memo: string;
    managerUserId: string;
    receiptFileIds: number[];
  } | null>(null);

  const [stage, setStage] = useState<RegisterStage>({ kind: 'form' });
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>('none');
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>('none');
  const [pendingScanResult, setPendingScanResult] = useState<ScanApplyValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code, error.message);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const loadReal = useCallback(async () => {
    setScreenLoadState('loading');
    try {
      const group = getActiveGroup();
      if (group) {
        const memberships = await groupMembershipService.getMemberships(group.id);
        setManagerOptions(memberships.map(m => ({ key: m.userId, label: m.name })));
      }
      if (mode === 'createReal') {
        const ledgers = group ? await ledgerService.getAllLedgersInGroup(group.id) : [];
        setLedgerOptions(ledgers.map(l => ({ id: l.id, name: l.name })));
      } else if (mode === 'editReal') {
        const detail = await entryService.getEntryDetail(transactionId!);
        setTransactionKind(detail.type === 'INCOME' ? 'income' : 'expense');
        setAmount(detail.amount);
        setDate(fromIsoDate(detail.occurredOn));
        setItemName(detail.title);
        setMemo(detail.memo ?? '');
        setManagerUserId(detail.manager.userId);
        setManagerName(detail.manager.name);
        setLedgerId(detail.ledgerId);
        setLedgerName(detail.ledgerName);
        const realIds = detail.receiptFiles.map(f => f.id);
        setReceiptItems(
          detail.receiptFiles.map(f => {
            const source = buildAuthenticatedImageSource(f.url);
            return {
              key: f.id,
              previewUri: source.uri,
              previewHeaders: source.headers,
              fileId: Number(f.id),
              uploading: false,
            };
          }),
        );
        setInitialSnapshot({
          title: detail.title,
          amount: detail.amount,
          occurredOn: detail.occurredOn,
          memo: detail.memo ?? '',
          managerUserId: detail.manager.userId,
          receiptFileIds: realIds.map(Number),
        });
      }
      setScreenLoadState('ready');
    } catch (error) {
      setScreenErrorMessage(toErrorMessage(error));
      setScreenLoadState('error');
    }
  }, [mode, transactionId]);

  useEffect(() => {
    loadReal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canChangeLedger = mode !== 'editReal';
  const isUploadingReceipt = receiptItems.some(item => item.uploading);
  const hasScanReceipt = receiptItems.some(item => item.fromScan);
  const canSubmit =
    itemName.trim().length > 0 &&
    ledgerId.length > 0 &&
    amount > 0 &&
    !isUploadingReceipt;

  const handleSelectManager = (key: string) => {
    setManagerUserId(key);
    setManagerName(managerOptions.find(option => option.key === key)?.label ?? '');
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(null), SNACKBAR_AUTO_HIDE_MS);
  };

  const handleBack = () => {
    setActiveDialog('leave');
  };

  const handleConfirmLeave = () => {
    setActiveDialog('none');
    navigation.goBack();
  };

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (stage.kind === 'form') {
          handleBack();
        } else {
          setStage({ kind: 'form' });
        }
        return true;
      });
      return () => subscription.remove();
    }, [stage]),
  );

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedReceiptFileIds = receiptItems
        .filter((item): item is ReceiptItem & { fileId: number } => item.fileId !== undefined)
        .map(item => item.fileId);
      if (mode === 'createReal') {
        const created = await entryService.createEntry(ledgerId, {
          type: transactionKind === 'income' ? 'INCOME' : 'EXPENSE',
          title: itemName.trim(),
          amount,
          occurredOn: toIsoDate(date),
          memo: memo.trim() || undefined,
          managerUserId,
          receiptFileIds: uploadedReceiptFileIds,
        });
        showSnackbar(
          created.approvalStatus === 'PENDING'
            ? SNACKBAR_TRANSACTION_ADDED_PENDING
            : SNACKBAR_TRANSACTION_ADDED,
        );
      } else {
        const updates: entryService.UpdateEntryInput = {};
        const trimmedTitle = itemName.trim();
        const trimmedMemo = memo.trim();
        const isoDate = toIsoDate(date);
        if (initialSnapshot) {
          if (trimmedTitle !== initialSnapshot.title) {
            updates.title = trimmedTitle;
          }
          if (amount !== initialSnapshot.amount) {
            updates.amount = amount;
          }
          if (isoDate !== initialSnapshot.occurredOn) {
            updates.occurredOn = isoDate;
          }
          if (trimmedMemo !== initialSnapshot.memo) {
            updates.memo = trimmedMemo;
          }
          if (managerUserId && managerUserId !== initialSnapshot.managerUserId) {
            updates.managerUserId = managerUserId;
          }
          if (!sameNumberSet(uploadedReceiptFileIds, initialSnapshot.receiptFileIds)) {
            updates.receiptFileIds = uploadedReceiptFileIds;
          }
        }
        await entryService.updateEntry(transactionId!, updates);
        showSnackbar(SNACKBAR_TRANSACTION_UPDATED);
      }
      setTimeout(() => navigation.goBack(), SNACKBAR_AUTO_HIDE_MS);
    } catch (error) {
      showSnackbar(toErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectLedger = (key: string) => {
    const option = ledgerOptions.find(item => item.id === key);
    setLedgerId(key);
    setLedgerName(option?.name ?? '');
  };

  const removeReceiptItem = (key: string) => {
    setReceiptItems(current => current.filter(item => item.key !== key));
  };

  const uploadReceiptImage = async (key: string, image: PickedImage) => {
    try {
      const uploaded = await fileService.uploadFile(
        image.uri,
        image.fileName,
        image.type,
        'RECEIPT',
      );
      setReceiptItems(current =>
        current.map(item =>
          item.key === key ? { ...item, uploading: false, fileId: Number(uploaded.id) } : item,
        ),
      );
    } catch (error) {
      setReceiptItems(current => current.filter(item => item.key !== key));
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
      setReceiptItems(current => [
        ...current,
        { key, previewUri: image.uri, uploading: true },
      ]);
      await uploadReceiptImage(key, image);
    }
  };

  const handleTakePhoto = async (mode: 'photo' | 'scan') => {
    // 자리가 없으면 카메라를 열지 않는다. 찍고 나서 버리면 스캔은 업로드와 인식(건당 과금)을
    // 이미 마친 뒤라 서버에 주인 없는 파일만 남는다.
    if (receiptItemsRef.current.length >= TRANSACTION_REGISTER_RECEIPT_MAX) {
      showSnackbar(SNACKBAR_RECEIPT_MAX_LIMIT);
      return;
    }
    const image = await captureWithFeedback(showSnackbar, () =>
      setActiveDialog('cameraPermission'),
    );
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

  const handleSelectAttachMenu = (key: AttachMenuKey) => {
    setActiveSheet('none');
    if (key === 'scan') {
      if (hasScanReceipt) {
        setActiveDialog('scanRescan');
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
    setActiveDialog('none');
    handleTakePhoto('scan');
  };

  /**
   * 스캔한 영수증을 증빙 목록에 넣는다. 인식에 실패해도 파일은 올라가 있으므로
   * 똑같이 붙인다 — 사용자가 "인식은 안 됐지만 증빙으로는 남기기"를 할 수 있어야 한다.
   */
  const attachScannedReceipt = (fileId: number, previewUri: string): boolean => {
    if (receiptItemsRef.current.length >= TRANSACTION_REGISTER_RECEIPT_MAX) {
      // 인식하는 동안 다른 경로로 증빙이 다 찼다. 그냥 버리면 올린 파일이 어디에도 연결되지
      // 않은 채 서버에 남는데, 그건 업로더 본인만 지울 수 있어 사실상 아무도 손대지 못한다.
      fileService.deleteFile(String(fileId)).catch(() => {
        // 지우기까지 실패하면 남겨 두는 수밖에 없다. 사용자에게 또 알릴 일은 아니다.
      });
      return false;
    }
    setReceiptItems(current => [
      ...current,
      { key: `scan-${Date.now()}`, previewUri, uploading: false, fileId, fromScan: true },
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

    const attached = attachScannedReceipt(outcome.fileId, outcome.previewUri);
    if (!attached) {
      // 인식값은 여전히 쓸모가 있으므로 폼에는 반영하되, 증빙이 안 붙은 것은 분명히 알린다.
      setStage({ kind: 'form' });
      setActiveDialog('none');
      if (outcome.kind === 'ok') {
        applyScanValues({
          amount: outcome.result.totalAmount,
          date: outcome.result.purchasedOn,
          merchantName: outcome.result.merchantName,
        });
      }
      showSnackbar(SNACKBAR_RECEIPT_MAX_LIMIT);
      return;
    }

    if (outcome.kind === 'notRecognized') {
      // 읽지는 못했지만 증빙으로는 붙었다. 그 사실이 실패 화면에 가려지지 않게 폼으로 돌린다.
      setStage({ kind: 'form' });
      setActiveDialog('none');
      showSnackbar(outcome.message ?? SNACKBAR_SCAN_NOT_RECOGNIZED);
      return;
    }

    const values: ScanApplyValues = {
      amount: outcome.result.totalAmount,
      date: outcome.result.purchasedOn,
      merchantName: outcome.result.merchantName,
    };

    // 사용자가 이미 채워 둔 값을 말없이 덮지 않는다. 서버가 못 읽어 비운 칸은 충돌이 아니다.
    const amountConflict = amount !== 0 && amount !== values.amount;
    const dateConflict =
      values.date !== null && date !== todayKey() && date !== values.date;
    const nameConflict =
      values.merchantName !== null && itemName !== '' && itemName !== values.merchantName;

    if (amountConflict || dateConflict || nameConflict) {
      setPendingScanResult(values);
      setStage({ kind: 'form' });
      setActiveDialog('scanApply');
      return;
    }

    applyScanValues(values);
    setStage({ kind: 'form' });
    showSnackbar(SNACKBAR_RECEIPT_ADDED);
  };

  /** 읽힌 값만 덮어쓴다. 못 읽은 칸(null)은 사용자가 채우거나 기본값으로 남는다. */
  const applyScanValues = (values: ScanApplyValues) => {
    setAmount(values.amount);
    if (values.date !== null) {
      setDate(values.date);
    }
    if (values.merchantName !== null && itemName === '') {
      setItemName(values.merchantName);
    }
  };

  const handleApplyScanResult = () => {
    if (pendingScanResult) {
      applyScanValues(pendingScanResult);
    }
    setPendingScanResult(null);
    setActiveDialog('none');
    showSnackbar(SNACKBAR_RECEIPT_ADDED);
  };

  const handleDiscardScanResult = () => {
    setPendingScanResult(null);
    setActiveDialog('none');
    showSnackbar(SNACKBAR_RECEIPT_ADDED);
  };

  if (stage.kind === 'scanning') {
    return <ReceiptScanningView image={stage.image} onComplete={handleScanComplete} />;
  }

  if (stage.kind === 'scanFailed') {
    return (
      <ReceiptScanFailedView
        onRetry={() => handleTakePhoto('scan')}
        onClose={() => setStage({ kind: 'form' })}
      />
    );
  }

  if (stage.kind === 'gallery') {
    return (
      <ReceiptGalleryPickerScreen
        remainingSlots={TRANSACTION_REGISTER_RECEIPT_MAX - receiptItems.length}
        onPicked={images => {
          setStage({ kind: 'form' });
          showSnackbar(SNACKBAR_RECEIPT_ADDED);
          addPickedImages(images);
        }}
        onBack={() => setStage({ kind: 'form' })}
        onMessage={showSnackbar}
        onPermanentlyDenied={() => setActiveDialog('galleryPermission')}
      />
    );
  }

  if (screenLoadState === 'loading' || screenLoadState === 'error') {
    return (
      <ScreenContainer background="secondary">
        <AppBar type="sub" title={TRANSACTION_REGISTER_TITLE} onBackPress={() => navigation.goBack()} />
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>
            {screenLoadState === 'loading' ? TRANSACTION_REGISTER_LOADING : screenErrorMessage}
          </Text>
          {screenLoadState === 'error' && (
            <Button label={TRANSACTION_REGISTER_RETRY_LABEL} onPress={loadReal} hierarchy="secondary" style={{ alignSelf: 'center' }} />
          )}
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      background="secondary"
      snackbar={snackbarMessage ? <Snackbar visible title={snackbarMessage} /> : undefined}
      snackbarOffset={68}
    >
      <AppBar
        type="sub"
        title={TRANSACTION_REGISTER_TITLE}
        onBackPress={handleBack}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.segmentWrapper}>
          <SegmentedControl
            options={[
              { label: FILTER_TYPE_INCOME, value: 'income' },
              { label: FILTER_TYPE_EXPENSE, value: 'expense' },
            ]}
            value={transactionKind}
            onChange={setTransactionKind}
          />
        </View>

        <Pressable onPress={() => setActiveSheet('amount')}>
          {amount === 0 ? (
            <Text style={styles.amountPlaceholder}>
              {TRANSACTION_REGISTER_AMOUNT_PLACEHOLDER}
            </Text>
          ) : (
            <Text style={styles.amountValue}>
              {amount.toLocaleString()}원
            </Text>
          )}
        </Pressable>

        <SelectionListItem
          type="picker"
          title={
            transactionKind === 'income'
              ? TRANSACTION_DATE_LABEL_INCOME
              : TRANSACTION_DATE_LABEL_EXPENSE
          }
          value={date}
          onPress={() => setActiveSheet('date')}
        />
        <SelectionListItem
          type="picker"
          title={TRANSACTION_ITEM_NAME_LABEL}
          required
          value={itemName || TRANSACTION_REGISTER_ITEM_NAME_PLACEHOLDER}
          onPress={() => setActiveSheet('itemName')}
        />
        <SelectionListItem
          type="picker"
          title={TRANSACTION_MANAGER_LABEL}
          value={managerName || TRANSACTION_REGISTER_MANAGER_PLACEHOLDER}
          onPress={() => setActiveSheet('manager')}
        />
        <SelectionListItem
          type="picker"
          title={TRANSACTION_LEDGER_LABEL}
          required
          value={ledgerName || TRANSACTION_REGISTER_LEDGER_PLACEHOLDER}
          disabled={!canChangeLedger}
          onPress={() => setActiveSheet('ledger')}
        />
        {!canChangeLedger && (
          <Text style={styles.ledgerLockedHint}>
            {TRANSACTION_REGISTER_LEDGER_LOCKED_HINT}
          </Text>
        )}
        <SelectionListItem
          type="picker"
          title={TRANSACTION_MEMO_LABEL}
          value={memo || TRANSACTION_MEMO_PLACEHOLDER}
          onPress={() => setActiveSheet('memo')}
        />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {TRANSACTION_REGISTER_RECEIPT_LABEL}
            {` ${receiptItems.length}/${TRANSACTION_REGISTER_RECEIPT_MAX}`}
          </Text>
          <View style={styles.thumbnailRow}>
            <AttachmentAddButton
              onPress={() => setActiveSheet('attachMenu')}
              disabled={receiptItems.length >= TRANSACTION_REGISTER_RECEIPT_MAX}
            />
            {receiptItems.map(item => (
              <Thumbnail
                key={item.key}
                imageUri={item.previewUri || undefined}
                imageHeaders={item.previewHeaders}
                uploading={item.uploading}
                onRemove={() => removeReceiptItem(item.key)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={TRANSACTION_REGISTER_SUBMIT_LABEL}
          onPress={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          fullWidth
        />
      </View>

      <TransactionAmountSheet
        visible={activeSheet === 'amount'}
        value={amount}
        onClose={() => setActiveSheet('none')}
        onSave={setAmount}
      />
      <TransactionDateSheet
        visible={activeSheet === 'date'}
        title={
          transactionKind === 'income'
            ? DATE_SHEET_TITLE_INCOME
            : DATE_SHEET_TITLE_EXPENSE
        }
        value={date}
        onClose={() => setActiveSheet('none')}
        onSave={setDate}
      />
      <TransactionTextInputSheet
        visible={activeSheet === 'itemName'}
        title={ITEM_NAME_SHEET_TITLE}
        placeholder={ITEM_NAME_SHEET_PLACEHOLDER}
        maxLength={ITEM_NAME_MAX_LENGTH}
        value={itemName}
        onClose={() => setActiveSheet('none')}
        onSave={setItemName}
      />
      <TransactionTextInputSheet
        visible={activeSheet === 'memo'}
        title={MEMO_SHEET_TITLE}
        placeholder={MEMO_SHEET_PLACEHOLDER}
        maxLength={MEMO_MAX_LENGTH}
        value={memo}
        onClose={() => setActiveSheet('none')}
        onSave={setMemo}
      />
      <TransactionSingleSelectSheet
        visible={activeSheet === 'manager'}
        title={MANAGER_SELECT_SHEET_TITLE}
        options={managerOptions}
        selectedKey={managerUserId || undefined}
        onClose={() => setActiveSheet('none')}
        onSelect={handleSelectManager}
      />
      <TransactionSingleSelectSheet
        visible={activeSheet === 'ledger' && canChangeLedger}
        title={TRANSACTION_LEDGER_LABEL}
        options={ledgerOptions.map(option => ({
          key: option.id,
          label: option.name,
        }))}
        selectedKey={ledgerId || undefined}
        onClose={() => setActiveSheet('none')}
        onSelect={handleSelectLedger}
      />
      <TransactionAttachMenuSheet
        visible={activeSheet === 'attachMenu'}
        onClose={() => setActiveSheet('none')}
        onSelect={handleSelectAttachMenu}
      />

      <Dialog
        visible={activeDialog === 'leave'}
        title={TRANSACTION_REGISTER_LEAVE_TITLE}
        description={TRANSACTION_REGISTER_LEAVE_DESCRIPTION}
        cancelLabel={TRANSACTION_REGISTER_LEAVE_CANCEL_LABEL}
        confirmLabel={TRANSACTION_REGISTER_LEAVE_CONFIRM_LABEL}
        onCancel={() => setActiveDialog('none')}
        onConfirm={handleConfirmLeave}
      />
      <Dialog
        visible={activeDialog === 'scanRescan'}
        title={SCAN_RESCAN_CONFIRM_TITLE}
        description={SCAN_RESCAN_CONFIRM_DESCRIPTION}
        cancelLabel={SCAN_RESCAN_CANCEL_LABEL}
        confirmLabel={SCAN_RESCAN_CONFIRM_LABEL}
        onCancel={() => setActiveDialog('none')}
        onConfirm={handleConfirmRescan}
      />
      <Dialog
        visible={activeDialog === 'scanApply'}
        title={SCAN_APPLY_CONFIRM_TITLE}
        description={SCAN_APPLY_CONFIRM_DESCRIPTION}
        cancelLabel={SCAN_APPLY_CANCEL_LABEL}
        confirmLabel={SCAN_APPLY_CONFIRM_LABEL}
        onCancel={handleDiscardScanResult}
        onConfirm={handleApplyScanResult}
      />
      <Dialog
        visible={activeDialog === 'cameraPermission'}
        title={CAMERA_PERMISSION_DIALOG_TITLE}
        description={CAMERA_PERMISSION_DIALOG_DESCRIPTION}
        cancelLabel={PERMISSION_DIALOG_CANCEL_LABEL}
        confirmLabel={PERMISSION_SETTINGS_BUTTON_LABEL}
        onCancel={() => setActiveDialog('none')}
        onConfirm={() => {
          setActiveDialog('none');
          Linking.openSettings();
        }}
      />
      <Dialog
        visible={activeDialog === 'galleryPermission'}
        title={GALLERY_PERMISSION_DIALOG_TITLE}
        description={GALLERY_PERMISSION_DIALOG_DESCRIPTION}
        cancelLabel={PERMISSION_DIALOG_CANCEL_LABEL}
        confirmLabel={PERMISSION_SETTINGS_BUTTON_LABEL}
        onCancel={() => setActiveDialog('none')}
        onConfirm={() => {
          setActiveDialog('none');
          Linking.openSettings();
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  stateText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_DISABLED,
  },
  segmentWrapper: {
    marginBottom: 20,
  },
  amountPlaceholder: {
    ...TYPOGRAPHY.h1,
    color: FOREGROUND_DISABLED,
    marginBottom: 8,
  },
  amountValue: {
    ...TYPOGRAPHY.h1,
    marginBottom: 8,
  },
  ledgerLockedHint: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginTop: -8,
    marginBottom: 8,
  },
  section: {
    marginTop: 24,
  },
  sectionLabel: {
    ...TYPOGRAPHY.subtitle3,
    marginBottom: 12,
  },
  thumbnailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
});

export default TransactionRegisterScreen;
