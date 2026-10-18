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
import { useCallback, useEffect, useState } from 'react';
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useSubmitLock } from '../../hooks/useSubmitLock';
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
import TransactionSingleSelectSheet from './TransactionSingleSelectSheet';
import TransactionTextInputSheet from './TransactionTextInputSheet';
import {
  useReceiptAttachments,
  type ScanApplyValues,
} from '../../hooks/useReceiptAttachments';
import { todayKey } from '../../utils/calendarGrid';
import { getActiveGroup } from '../../types/group';
import * as ledgerService from '../../services/ledgerService';
import * as entryService from '../../services/entryService';
import * as groupMembershipService from '../../services/groupMembershipService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
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
  TRANSACTION_REGISTER_SUBMIT_LABEL,
  TRANSACTION_REGISTER_TITLE,
} from '../../constants/transactionScreenText';
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type TransactionKind = 'income' | 'expense';
type RegisterMode = 'createReal' | 'editReal';

type ActiveSheet =
  | 'none'
  | 'amount'
  | 'date'
  | 'itemName'
  | 'manager'
  | 'ledger'
  | 'memo';

type ActiveDialog = 'none' | 'leave' | 'scanApply';
type ScreenLoadState = 'loading' | 'error' | 'ready';

type LedgerOption = { id: string; name: string };

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

  const [activeSheet, setActiveSheet] = useState<ActiveSheet>('none');
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>('none');
  const [pendingScanResult, setPendingScanResult] = useState<ScanApplyValues | null>(null);
  const { isLocked, run } = useSubmitLock();
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(null), SNACKBAR_AUTO_HIDE_MS);
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

  const handleScanRecognized = (
    values: ScanApplyValues,
    meta: { attached: boolean },
  ) => {
    if (!meta.attached) {
      // 증빙 자리가 꽉 차 사진은 못 붙었다 — 인식값은 그대로 반영한다(충돌 검사 없이).
      applyScanValues(values);
      return;
    }
    // 사용자가 이미 채워 둔 값을 말없이 덮지 않는다. 서버가 못 읽어 비운 칸은 충돌이 아니다.
    const amountConflict = amount !== 0 && amount !== values.amount;
    const dateConflict =
      values.date !== null && date !== todayKey() && date !== values.date;
    const nameConflict =
      values.merchantName !== null && itemName !== '' && itemName !== values.merchantName;

    if (amountConflict || dateConflict || nameConflict) {
      setPendingScanResult(values);
      setActiveDialog('scanApply');
      return;
    }

    applyScanValues(values);
    showSnackbar(SNACKBAR_RECEIPT_ADDED);
  };

  const attachments = useReceiptAttachments({
    showSnackbar,
    onScanRecognized: handleScanRecognized,
  });

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
        attachments.setItems(
          detail.receiptFiles.map(f => ({
            key: f.id,
            previewUri: '',
            sourceUrl: f.url,
            fileId: Number(f.id),
            uploading: false,
          })),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, transactionId]);

  useEffect(() => {
    loadReal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadLedgerOptions = useCallback(async () => {
    const group = getActiveGroup();
    if (!group) {
      return;
    }
    const ledgers = await ledgerService.getAllLedgersInGroup(group.id);
    setLedgerOptions(ledgers.map(l => ({ id: l.id, name: l.name })));
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (mode === 'createReal') {
        loadLedgerOptions();
      }
    }, [mode, loadLedgerOptions]),
  );

  const canChangeLedger = mode !== 'editReal';
  const canSubmit =
    itemName.trim().length > 0 &&
    ledgerId.length > 0 &&
    amount > 0 &&
    !attachments.isUploading;

  const handleSelectManager = (key: string) => {
    setManagerUserId(key);
    setManagerName(managerOptions.find(option => option.key === key)?.label ?? '');
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
        if (!attachments.isFullScreen) {
          handleBack();
        } else {
          attachments.returnToForm();
        }
        return true;
      });
      return () => subscription.remove();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attachments.isFullScreen, attachments.returnToForm]),
  );

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }
    run(async () => {
      try {
        const uploadedReceiptFileIds = attachments.items
          .filter((item): item is typeof item & { fileId: number } => item.fileId !== undefined)
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
        return true;
      } catch (error) {
        showSnackbar(toErrorMessage(error));
        return false;
      }
    }, { keepLockedOnSuccess: true });
  };

  const handleSelectLedger = (key: string) => {
    const option = ledgerOptions.find(item => item.id === key);
    setLedgerId(key);
    setLedgerName(option?.name ?? '');
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

  if (attachments.stageView) {
    return attachments.stageView;
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
            {` ${attachments.items.length}/${attachments.maxCount}`}
          </Text>
          <View style={styles.thumbnailRow}>
            <AttachmentAddButton
              onPress={attachments.openAttachMenu}
              disabled={attachments.items.length >= attachments.maxCount}
            />
            {attachments.items.map(item => (
              <Thumbnail
                key={item.key}
                imageUri={item.previewUri || undefined}
                imageUrl={item.previewUri ? undefined : item.sourceUrl}
                uploading={item.uploading}
                onRemove={() => attachments.removeItem(item.key)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={TRANSACTION_REGISTER_SUBMIT_LABEL}
          onPress={handleSubmit}
          disabled={!canSubmit || isLocked}
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
        onPressEmptyStateCreate={() => {
          setActiveSheet('none');
          navigation.navigate('LedgerCreate', { parentId: null });
        }}
      />
      {attachments.sheetsAndDialogs}

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
        visible={activeDialog === 'scanApply'}
        title={SCAN_APPLY_CONFIRM_TITLE}
        description={SCAN_APPLY_CONFIRM_DESCRIPTION}
        cancelLabel={SCAN_APPLY_CANCEL_LABEL}
        confirmLabel={SCAN_APPLY_CONFIRM_LABEL}
        onCancel={handleDiscardScanResult}
        onConfirm={handleApplyScanResult}
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
