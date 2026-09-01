/** @screen ADD-1-PAGE-01-0 내역 추가 */
/** @screen DTB-3-PAGE-02-0 상세 내역_수정 (existing transactionId로 진입 시) */
/** @screen DTB-4-MODAL-01-0 상세 내역_수정 이탈 안내 (leave 다이얼로그) */
/** @screen ADD-2-MODAL-01-0 이탈 방지 모달 (DTB-4-MODAL-01-0과 동일 다이얼로그, IA ID 중복) */
/** @screen ADD-4-PAGE-01-0 영수증 스캔 성공 (handleScanComplete에서 필드 반영) */
/** @screen ADD-5-MODAL-01-0 스캔 내용 반영 확인 모달 (scanApply 다이얼로그) */
/** @screen ADD-2-SNACKBAR-01-0 등록 완료 (SNACKBAR_TRANSACTION_ADDED[_PENDING]) */
/**
 * 4-A(Entry API 연동): 등록(신규)은 항상 실 서버로 간다 — id가 없으면 무조건
 * `mode='createReal'`. 수정은 넘어온 id 모양으로 갈린다: 숫자 문자열이면 실
 * Entry(`editReal`), `dtb-tx-N`이면 아직 4-B 전인 DTB 전체 목록 목 데이터
 * (`editMock`, `types/transaction.ts`) — `TransactionsScreen`(손대지 말라고 지정된
 * 화면)에서 들어오는 경로가 여전히 이 값을 쓴다.
 *
 * 실 API로 가는 두 모드에서 뺀 것들:
 *  - "담당자" 필드: Entry API에 이 개념 자체가 없다(CLAUDE.md엔 있지만 명세엔
 *    없음, docs/api-gaps.md 참고) — 입력해도 서버에 보내지 않는다(저장할 곳이
 *    없어서). editMock에서만 그대로 동작한다.
 *  - "장부" 변경(editReal만): `PATCH /entries/{id}`에 ledgerId가 없어 등록 후엔
 *    장부를 옮길 수 없다 — 표시만 하고 못 누르게 막았다.
 *  - 증빙 실제 업로드: 카메라/스캔/갤러리가 전부 가짜 문자열 토큰만 만들어서
 *    (`utils/mockOcr.ts`, `MockCameraView` 등) 실제 파일이 없다. 기존 증빙(서버에서
 *    불러온 진짜 fileId)을 빼는 것만 실제로 반영되고, 새로 "첨부"한 것은 폼
 *    안에서만 보이다가 제출해도 서버로 안 간다 — docs/api-gaps.md 참고.
 */
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
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
import MockCameraView from './MockCameraView';
import ReceiptScanningView from './ReceiptScanningView';
import ReceiptScanFailedView from './ReceiptScanFailedView';
import ReceiptGalleryPickerScreen from './ReceiptGalleryPickerScreen';
import {
  getTransactionById,
  getTransactionLedgerOptions,
  todayKey,
  updateTransaction,
} from '../../types/transaction';
import { getActiveGroup } from '../../types/group';
import * as ledgerService from '../../services/ledgerService';
import * as entryService from '../../services/entryService';
import { ApiError } from '../../services/apiClient';
import { buildAuthenticatedImageSource } from '../../utils/authenticatedImage';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import type { MockScanResult } from '../../utils/mockOcr';
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

const MANAGER_OPTIONS = [
  { key: '김민주', label: '김민주' },
  { key: '김시현', label: '김시현' },
  { key: '봉서연', label: '봉서연' },
  { key: '이정현', label: '이정현' },
];

type TransactionKind = 'income' | 'expense';
type RegisterMode = 'createReal' | 'editReal' | 'editMock';

type RegisterStage =
  | { kind: 'form' }
  | { kind: 'camera'; mode: 'photo' | 'scan' }
  | { kind: 'scanning' }
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

type ActiveDialog = 'none' | 'leave' | 'scanRescan' | 'scanApply';
type ScreenLoadState = 'loading' | 'error' | 'ready';

type LedgerOption = { id: string; name: string };

const SNACKBAR_AUTO_HIDE_MS = 1600;

/** 'YYYY.MM.DD' → 'YYYY-MM-DD'(Entry API 형식). */
function toIsoDate(dotDate: string): string {
  return dotDate.replace(/\./g, '-');
}

/** 'YYYY-MM-DD'(서버) → 'YYYY.MM.DD'(이 화면/TransactionDateSheet 형식). */
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

/** 내역 추가/수정 화면. 금액/일자/내역명/(담당자)/장부/메모 입력 + 증빙자료 촬영/스캔/갤러리 첨부. */
function TransactionRegisterScreen() {
  const navigation = useNavigation<TransactionRegisterNavigationProp>();
  const route = useRoute<TransactionRegisterRouteProp>();
  const transactionId = route.params?.transactionId;

  const mode: RegisterMode = !transactionId
    ? 'createReal'
    : /^\d+$/.test(transactionId)
    ? 'editReal'
    : 'editMock';

  const existingDtb = mode === 'editMock' ? getTransactionById(transactionId!) : undefined;

  const [transactionKind, setTransactionKind] = useState<TransactionKind>(
    existingDtb ? (existingDtb.amount > 0 ? 'income' : 'expense') : 'expense',
  );
  const [amount, setAmount] = useState(existingDtb ? Math.abs(existingDtb.amount) : 0);
  const [date, setDate] = useState(existingDtb?.date ?? todayKey());
  const [itemName, setItemName] = useState(existingDtb?.itemName ?? '');
  const [manager, setManager] = useState(existingDtb?.manager ?? '');
  const [ledgerId, setLedgerId] = useState(existingDtb?.ledgerId ?? '');
  const [ledgerName, setLedgerName] = useState(existingDtb?.ledgerName ?? '');
  const [memo, setMemo] = useState(existingDtb?.memo ?? '');
  const [receiptImages, setReceiptImages] = useState<string[]>(
    existingDtb?.receiptImages ?? [],
  );
  const [realReceiptUrls, setRealReceiptUrls] = useState<Record<string, string>>({});

  const [ledgerOptions, setLedgerOptions] = useState<LedgerOption[]>(
    mode === 'editMock' ? getTransactionLedgerOptions() : [],
  );
  const [screenLoadState, setScreenLoadState] = useState<ScreenLoadState>(
    mode === 'editMock' ? 'ready' : 'loading',
  );
  const [screenErrorMessage, setScreenErrorMessage] = useState('');

  // editReal 저장 시 "실제로 바뀐 것만" 서버로 보내기 위한 원본 스냅샷(0-1).
  const [initialSnapshot, setInitialSnapshot] = useState<{
    title: string;
    amount: number;
    occurredOn: string;
    memo: string;
    receiptFileIds: number[];
  } | null>(null);

  const [stage, setStage] = useState<RegisterStage>({ kind: 'form' });
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>('none');
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>('none');
  const [pendingScanResult, setPendingScanResult] = useState<MockScanResult | null>(null);
  const [hasScannedOnce, setHasScannedOnce] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const loadReal = useCallback(async () => {
    setScreenLoadState('loading');
    try {
      if (mode === 'createReal') {
        const group = getActiveGroup();
        const ledgers = group ? await ledgerService.getAllLedgersInGroup(group.id) : [];
        setLedgerOptions(ledgers.map(l => ({ id: l.id, name: l.name })));
      } else if (mode === 'editReal') {
        const detail = await entryService.getEntryDetail(transactionId!);
        setTransactionKind(detail.type === 'INCOME' ? 'income' : 'expense');
        setAmount(detail.amount);
        setDate(fromIsoDate(detail.occurredOn));
        setItemName(detail.title);
        setMemo(detail.memo ?? '');
        setLedgerId(detail.ledgerId);
        setLedgerName(detail.ledgerName);
        const realIds = detail.receiptFiles.map(f => f.id);
        setReceiptImages(realIds);
        setRealReceiptUrls(
          Object.fromEntries(detail.receiptFiles.map(f => [f.id, f.url])),
        );
        setInitialSnapshot({
          title: detail.title,
          amount: detail.amount,
          occurredOn: detail.occurredOn,
          memo: detail.memo ?? '',
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
    if (mode !== 'editMock') {
      loadReal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canChangeLedger = mode !== 'editReal';
  const showManagerField = mode === 'editMock';
  const canSubmit = itemName.trim().length > 0 && ledgerId.length > 0 && amount > 0;

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

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    if (mode === 'editMock') {
      if (existingDtb) {
        updateTransaction(existingDtb.id, {
          date,
          ledgerId,
          ledgerName,
          itemName: itemName.trim(),
          amount: transactionKind === 'income' ? Math.abs(amount) : -Math.abs(amount),
          manager,
          memo,
          hasReceipt: receiptImages.length > 0,
          receiptImages,
          isPendingApproval: false,
        });
      }
      navigation.navigate('Main', {
        screen: 'Transactions',
        params: { addedTransactionId: existingDtb?.id },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'createReal') {
        const created = await entryService.createEntry(ledgerId, {
          type: transactionKind === 'income' ? 'INCOME' : 'EXPENSE',
          title: itemName.trim(),
          amount,
          occurredOn: toIsoDate(date),
          memo: memo.trim() || undefined,
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
          // 실제 서버 파일(숫자 id)만 골라 비교한다 — 카메라/스캔/갤러리로 새로
          // 붙인 항목은 가짜 토큰이라 여기 안 들어간다(진짜 업로드가 아직 없음).
          const keptRealIds = receiptImages
            .filter(id => /^\d+$/.test(id))
            .map(Number);
          if (!sameNumberSet(keptRealIds, initialSnapshot.receiptFileIds)) {
            updates.receiptFileIds = keptRealIds;
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

  const removeReceiptImage = (id: string) => {
    setReceiptImages(current => current.filter(image => image !== id));
  };

  const handleSelectAttachMenu = (key: AttachMenuKey) => {
    setActiveSheet('none');
    if (key === 'scan') {
      if (hasScannedOnce) {
        setActiveDialog('scanRescan');
      } else {
        setStage({ kind: 'camera', mode: 'scan' });
      }
    } else if (key === 'photo') {
      setStage({ kind: 'camera', mode: 'photo' });
    } else {
      setStage({ kind: 'gallery' });
    }
  };

  const handleConfirmRescan = () => {
    setActiveDialog('none');
    setStage({ kind: 'camera', mode: 'scan' });
  };

  const handleCapture = () => {
    if (stage.kind !== 'camera') {
      return;
    }
    if (stage.mode === 'photo') {
      if (receiptImages.length < TRANSACTION_REGISTER_RECEIPT_MAX) {
        setReceiptImages(current => [...current, `photo-${Date.now()}`]);
      }
      setStage({ kind: 'form' });
      showSnackbar(SNACKBAR_RECEIPT_ADDED);
    } else {
      setStage({ kind: 'scanning' });
    }
  };

  const handleScanComplete = (result: MockScanResult | null) => {
    if (!result) {
      setStage({ kind: 'scanFailed' });
      return;
    }

    if (receiptImages.length < TRANSACTION_REGISTER_RECEIPT_MAX) {
      setReceiptImages(current => [...current, `scan-${Date.now()}`]);
    }
    setHasScannedOnce(true);

    const amountConflict = amount !== 0 && amount !== result.amount;
    const dateConflict = date !== todayKey() && date !== result.date;

    if (amountConflict || dateConflict) {
      setPendingScanResult(result);
      setStage({ kind: 'form' });
      setActiveDialog('scanApply');
      return;
    }

    setAmount(result.amount);
    setDate(result.date);
    setStage({ kind: 'form' });
    showSnackbar(SNACKBAR_RECEIPT_ADDED);
  };

  const handleApplyScanResult = () => {
    if (pendingScanResult) {
      setAmount(pendingScanResult.amount);
      setDate(pendingScanResult.date);
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

  if (stage.kind === 'camera') {
    return (
      <MockCameraView
        onBack={() => setStage({ kind: 'form' })}
        onClose={() => setStage({ kind: 'form' })}
        onCapture={handleCapture}
      />
    );
  }

  if (stage.kind === 'scanning') {
    return <ReceiptScanningView onComplete={handleScanComplete} />;
  }

  if (stage.kind === 'scanFailed') {
    return (
      <ReceiptScanFailedView
        onRetry={() => setStage({ kind: 'camera', mode: 'scan' })}
        onClose={() => setStage({ kind: 'form' })}
      />
    );
  }

  if (stage.kind === 'gallery') {
    return (
      <ReceiptGalleryPickerScreen
        remainingSlots={TRANSACTION_REGISTER_RECEIPT_MAX - receiptImages.length}
        onConfirm={photoIds => {
          setReceiptImages(current => [...current, ...photoIds]);
          setStage({ kind: 'form' });
          showSnackbar(SNACKBAR_RECEIPT_ADDED);
        }}
        onBack={() => setStage({ kind: 'form' })}
        onOpenCamera={() => setStage({ kind: 'camera', mode: 'photo' })}
      />
    );
  }

  if (mode !== 'editMock' && (screenLoadState === 'loading' || screenLoadState === 'error')) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <AppBar type="sub" title={TRANSACTION_REGISTER_TITLE} onBackPress={() => navigation.goBack()} />
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>
            {screenLoadState === 'loading' ? TRANSACTION_REGISTER_LOADING : screenErrorMessage}
          </Text>
          {screenLoadState === 'error' && (
            <Button label={TRANSACTION_REGISTER_RETRY_LABEL} onPress={loadReal} hierarchy="secondary" />
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
        {showManagerField && (
          <SelectionListItem
            type="picker"
            title={TRANSACTION_MANAGER_LABEL}
            value={manager || TRANSACTION_REGISTER_MANAGER_PLACEHOLDER}
            onPress={() => setActiveSheet('manager')}
          />
        )}
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
            {` ${receiptImages.length}/${TRANSACTION_REGISTER_RECEIPT_MAX}`}
          </Text>
          <View style={styles.thumbnailRow}>
            <AttachmentAddButton
              onPress={() => setActiveSheet('attachMenu')}
              disabled={receiptImages.length >= TRANSACTION_REGISTER_RECEIPT_MAX}
            />
            {receiptImages.map(image => {
              const realUrl = realReceiptUrls[image];
              const source = realUrl ? buildAuthenticatedImageSource(realUrl) : undefined;
              return (
                <Thumbnail
                  key={image}
                  imageUri={source?.uri}
                  imageHeaders={source?.headers}
                  onRemove={() => removeReceiptImage(image)}
                />
              );
            })}
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
      {showManagerField && (
        <TransactionSingleSelectSheet
          visible={activeSheet === 'manager'}
          title={MANAGER_SELECT_SHEET_TITLE}
          options={MANAGER_OPTIONS}
          selectedKey={manager || undefined}
          onClose={() => setActiveSheet('none')}
          onSelect={setManager}
        />
      )}
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

      {snackbarMessage && (
        <View style={styles.snackbarWrapper}>
          <Snackbar visible title={snackbarMessage} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 8,
    paddingHorizontal: 24,
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
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  snackbarWrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 88,
  },
});

export default TransactionRegisterScreen;
