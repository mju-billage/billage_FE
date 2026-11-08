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
 * "장부" 변경(2026-11-05 연동, editReal만): 총무(`OWNER`)만 `PATCH /entries/{id}`의
 * `ledgerId`로 장부를 옮길 수 있다 — 같은 모임의 장부만 허용되고, 아니면 서버가
 * `LEDGER_NOT_FOUND`를 돌려준다. 총무가 아니면 지금처럼 표시만 하고 못 누르게 막는다.
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
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useSubmitLock } from '../../hooks/useSubmitLock';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { takePendingSnackbar } from '../../utils/pendingSnackbar';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import SegmentedControl from '../../components/Input/Control/SegmentedControl';
import TextField from '../../components/Input/Text Field/TextField';
import SelectionListItem from '../../components/Data Display/Lists/SelectionListItem';
import DetailFieldRow from '../../components/Data Display/Lists/DetailFieldRow';
import Divider from '../../components/Data Display/Divider/Divider';
import AttachmentAddButton, { ATTACHMENT_SIZE } from '../../components/Input/Button/AttachmentAddButton';
import Thumbnail from '../../components/Data Display/Image Placeholder/Thumbnail';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import TransactionDateSheet from './TransactionDateSheet';
import TransactionSingleSelectSheet from './TransactionSingleSelectSheet';
import TransactionTextInputSheet from './TransactionTextInputSheet';
import { transactionDetailLayoutStyles as layoutStyles } from './transactionDetailLayout';
import {
  useReceiptAttachments,
  type ScanApplyValues,
} from '../../hooks/useReceiptAttachments';
import { todayKey } from '../../utils/calendarGrid';
import { truncateWithEllipsis } from '../../utils/truncateWithEllipsis';
import { capDigits } from '../../utils/currency';
import { formatFullDate } from '../../utils/dateHeader';
import { getActiveGroup } from '../../types/group';
import { getCurrentUser } from '../../types/session';
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
  TRANSACTION_DETAIL_TITLE,
  TRANSACTION_ITEM_NAME_LABEL,
  TRANSACTION_LEDGER_LABEL,
  TRANSACTION_MANAGER_LABEL,
  TRANSACTION_MEMO_LABEL,
  TRANSACTION_MEMO_PLACEHOLDER,
  TRANSACTION_RECEIPT_LABEL,
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
  TEXT_INPUT_SHEET_EDIT_LABEL,
  TRANSACTION_EDIT_LEAVE_DESCRIPTION,
  TRANSACTION_EDIT_LEAVE_TITLE,
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
  TRANSACTION_REGISTER_SAVE_LABEL,
  TRANSACTION_REGISTER_SUBMIT_LABEL,
  TRANSACTION_REGISTER_TITLE,
} from '../../constants/transactionScreenText';
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { TEXT_FIELD_MAX_LENGTH_ERROR } from '../../constants/commonText';

const EDIT_ICON = require('../../assets/icons/action/Edit.png');

type TransactionKind = 'income' | 'expense';
type RegisterMode = 'createReal' | 'editReal';

const AMOUNT_MAX_DIGITS = 9;

type ActiveSheet =
  | 'none'
  | 'date'
  | 'itemName'
  | 'manager'
  | 'ledger'
  | 'memo';

type ActiveDialog = 'none' | 'leave' | 'scanApply';
type ScreenLoadState = 'loading' | 'error' | 'ready';

type LedgerOption = { id: string; name: string };

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
  const viewerIsOwner = getActiveGroup()?.myRole === 'OWNER';

  const [transactionKind, setTransactionKind] = useState<TransactionKind>('expense');
  const [amount, setAmount] = useState(0);
  const [amountError, setAmountError] = useState<string | undefined>();
  const amountInputRef = useRef<TextInput>(null);
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
    ledgerId: string;
  } | null>(null);

  const [activeSheet, setActiveSheet] = useState<ActiveSheet>('none');
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>('none');
  const [pendingScanResult, setPendingScanResult] = useState<ScanApplyValues | null>(null);
  const { isLocked, run } = useSubmitLock();
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
  };

  /** 읽힌 값만 덮어쓴다. 못 읽은 칸(null)은 사용자가 채우거나 기본값으로 남는다. 내역명은 OCR 이 안 채운다 — 사용자가 직접 입력한다(FT-33). */
  const applyScanValues = (values: ScanApplyValues) => {
    setAmount(values.amount);
    if (values.date !== null) {
      setDate(values.date);
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

    if (amountConflict || dateConflict) {
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
        const options = memberships.map(m => ({ key: m.userId, label: m.name }));
        setManagerOptions(options);
        if (mode === 'createReal') {
          // 담당자 기본값 = 나(FT-27). 내가 이 모임 관리자 목록에 없으면(일반 모임원 등) 비워 둔다.
          const myUserId = getCurrentUser()?.userId;
          const myOption = options.find(option => option.key === myUserId);
          if (myOption) {
            setManagerUserId(myOption.key);
            setManagerName(myOption.label);
          }
        }
      }
      if (mode === 'createReal' || viewerIsOwner) {
        const ledgers = group ? await ledgerService.getAllLedgersInGroup(group.id) : [];
        setLedgerOptions(ledgers.map(l => ({ id: l.id, name: l.name })));
      }
      if (mode === 'editReal') {
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
          ledgerId: detail.ledgerId,
        });
      }
      setScreenLoadState('ready');
    } catch (error) {
      setScreenErrorMessage(toErrorMessage(error));
      setScreenLoadState('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, transactionId, viewerIsOwner]);

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
      if (mode === 'createReal' || viewerIsOwner) {
        loadLedgerOptions();
      }
      const pending = takePendingSnackbar();
      if (pending) {
        showSnackbar(pending.title);
      }
    }, [mode, viewerIsOwner, loadLedgerOptions]),
  );

  const canChangeLedger = mode !== 'editReal' || viewerIsOwner;
  const canSubmit =
    itemName.trim().length > 0 &&
    ledgerId.length > 0 &&
    amount > 0 &&
    !attachments.isUploading;

  const handleSelectManager = (key: string) => {
    setManagerUserId(key);
    setManagerName(managerOptions.find(option => option.key === key)?.label ?? '');
  };

  /** 9자리 초과 시 값은 유지하고 입력만 막은 뒤 에러를 보인다(FT-22, FD-09와 같은 방식). */
  const handleAmountChange = (text: string) => {
    const { value: capped, overflow } = capDigits(
      text.replace(/[^0-9]/g, ''),
      AMOUNT_MAX_DIGITS,
    );
    setAmountError(overflow ? TEXT_FIELD_MAX_LENGTH_ERROR(AMOUNT_MAX_DIGITS) : undefined);
    const next = capped ? Number(capped) : 0;
    if (next === amount) {
      amountInputRef.current?.setNativeProps({
        text: amount > 0 ? amount.toLocaleString() : '',
      });
      return;
    }
    setAmount(next);
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
          navigation.popTo(
            'Main',
            {
              screen: 'Transactions',
              params: {
                snackbarMessage:
                  created.approvalStatus === 'PENDING'
                    ? SNACKBAR_TRANSACTION_ADDED_PENDING
                    : SNACKBAR_TRANSACTION_ADDED,
              },
            },
            { merge: true },
          );
          return true;
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
            if (ledgerId !== initialSnapshot.ledgerId) {
              updates.ledgerId = ledgerId;
            }
          }
          await entryService.updateEntry(transactionId!, updates);
          navigation.popTo(
            'TransactionDetail',
            { transactionId: transactionId!, snackbarMessage: SNACKBAR_TRANSACTION_UPDATED },
            { merge: true },
          );
          return true;
        }
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
      snackbar={
        <Snackbar
          visible={snackbarMessage != null}
          title={snackbarMessage ?? ''}
          onClose={() => setSnackbarMessage(null)}
        />
      }
      // 푸터 아래 16 + 버튼 48 → 스낵바는 버튼 윗변보다 20 위
      snackbarOffset={64}
    >
      <AppBar
        type="sub"
        title={mode === 'editReal' ? TRANSACTION_DETAIL_TITLE : TRANSACTION_REGISTER_TITLE}
        onBackPress={handleBack}
      />

      {mode === 'editReal' ? (
        <ScrollView contentContainerStyle={layoutStyles.content}>
          <View style={editStyles.amountRow}>
            {amount > 0 && transactionKind !== 'income' && (
              <Text style={[layoutStyles.amountText, editStyles.amountSign]}>-</Text>
            )}
            <View style={editStyles.amountFieldWrapper}>
              <TextField
                ref={amountInputRef}
                value={amount > 0 ? amount.toLocaleString() : ''}
                onChangeText={handleAmountChange}
                onBlur={() => setAmountError(undefined)}
                placeholder={TRANSACTION_REGISTER_AMOUNT_PLACEHOLDER}
                keyboardType="number-pad"
                suffix="원"
                inputStyle={layoutStyles.amountText}
                error={amountError}
              />
            </View>
            <Pressable onPress={() => amountInputRef.current?.focus()} hitSlop={8}>
              <Image source={EDIT_ICON} style={editStyles.amountEditIcon} />
            </Pressable>
          </View>

          <DetailFieldRow
            label={
              transactionKind === 'income'
                ? TRANSACTION_DATE_LABEL_INCOME
                : TRANSACTION_DATE_LABEL_EXPENSE
            }
            value={formatFullDate(toIsoDate(date))}
            onPress={() => setActiveSheet('date')}
          />
          <DetailFieldRow
            label={TRANSACTION_ITEM_NAME_LABEL}
            value={truncateWithEllipsis(itemName)}
            onPress={() => setActiveSheet('itemName')}
          />
          <DetailFieldRow
            label={TRANSACTION_MANAGER_LABEL}
            value={managerName}
            onPress={() => setActiveSheet('manager')}
          />
          <DetailFieldRow
            label={TRANSACTION_LEDGER_LABEL}
            value={ledgerName}
            disabled={!canChangeLedger}
            onPress={canChangeLedger ? () => setActiveSheet('ledger') : undefined}
          />
          {!canChangeLedger && (
            <Text style={layoutStyles.ledgerLockedHint}>
              {TRANSACTION_REGISTER_LEDGER_LOCKED_HINT}
            </Text>
          )}
          <DetailFieldRow
            label={TRANSACTION_MEMO_LABEL}
            value={truncateWithEllipsis(memo)}
            valuePlaceholder={TRANSACTION_MEMO_PLACEHOLDER}
            onPress={() => setActiveSheet('memo')}
          />
          <View style={layoutStyles.dividerWrapper}>
            <Divider />
          </View>

          <View style={layoutStyles.section}>
            <View style={layoutStyles.sectionLabelRow}>
              <Text style={layoutStyles.receiptSectionLabel}>{TRANSACTION_RECEIPT_LABEL}</Text>
              <Text style={layoutStyles.receiptCount}>
                <Text style={layoutStyles.receiptCountCurrent}>
                  {attachments.items.length}
                </Text>
                /{attachments.maxCount}
              </Text>
            </View>
            <View style={layoutStyles.thumbnailRow}>
              <AttachmentAddButton
                onPress={attachments.openAttachMenu}
                disabled={attachments.items.length >= attachments.maxCount}
              />
              {attachments.items.map(item => (
                <Thumbnail
                  key={item.key}
                  size={ATTACHMENT_SIZE}
                  imageUri={item.previewUri || undefined}
                  imageUrl={item.previewUri ? undefined : item.sourceUrl}
                  uploading={item.uploading}
                  onRemove={() => attachments.requestRemove(item.key)}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.segmentWrapper}>
            <SegmentedControl
              options={[
                { label: FILTER_TYPE_EXPENSE, value: 'expense' },
                { label: FILTER_TYPE_INCOME, value: 'income' },
              ]}
              value={transactionKind}
              onChange={setTransactionKind}
            />
          </View>

          <TextField
            ref={amountInputRef}
            value={amount > 0 ? amount.toLocaleString() : ''}
            onChangeText={handleAmountChange}
            onBlur={() => setAmountError(undefined)}
            placeholder={TRANSACTION_REGISTER_AMOUNT_PLACEHOLDER}
            keyboardType="number-pad"
            suffix="원"
            inputStyle={styles.amountValue}
            error={amountError}
          />

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
            value={truncateWithEllipsis(itemName) || TRANSACTION_REGISTER_ITEM_NAME_PLACEHOLDER}
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
            value={truncateWithEllipsis(memo) || TRANSACTION_MEMO_PLACEHOLDER}
            onPress={() => setActiveSheet('memo')}
          />

          <View style={styles.section}>
            <View style={layoutStyles.sectionLabelRow}>
              <Text style={layoutStyles.receiptSectionLabel}>
                {TRANSACTION_REGISTER_RECEIPT_LABEL}
              </Text>
              <Text style={layoutStyles.receiptCount}>
                <Text style={layoutStyles.receiptCountCurrent}>
                  {attachments.items.length}
                </Text>
                /{attachments.maxCount}
              </Text>
            </View>
            <View style={styles.thumbnailRow}>
              <AttachmentAddButton
                onPress={attachments.openAttachMenu}
                disabled={attachments.items.length >= attachments.maxCount}
              />
              {attachments.items.map(item => (
                <Thumbnail
                  key={item.key}
                  size={ATTACHMENT_SIZE}
                  imageUri={item.previewUri || undefined}
                  imageUrl={item.previewUri ? undefined : item.sourceUrl}
                  uploading={item.uploading}
                  onRemove={() => attachments.requestRemove(item.key)}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      <View style={styles.footer}>
        <Button
          label={mode === 'editReal' ? TRANSACTION_REGISTER_SAVE_LABEL : TRANSACTION_REGISTER_SUBMIT_LABEL}
          onPress={handleSubmit}
          disabled={!canSubmit || isLocked}
          fullWidth
        />
      </View>

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
        confirmLabel={mode === 'editReal' ? TEXT_INPUT_SHEET_EDIT_LABEL : undefined}
      />
      <TransactionTextInputSheet
        visible={activeSheet === 'memo'}
        title={MEMO_SHEET_TITLE}
        placeholder={MEMO_SHEET_PLACEHOLDER}
        maxLength={MEMO_MAX_LENGTH}
        value={memo}
        onClose={() => setActiveSheet('none')}
        onSave={setMemo}
        confirmLabel={mode === 'editReal' ? TEXT_INPUT_SHEET_EDIT_LABEL : undefined}
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
        title={mode === 'editReal' ? TRANSACTION_EDIT_LEAVE_TITLE : TRANSACTION_REGISTER_LEAVE_TITLE}
        description={
          mode === 'editReal' ? TRANSACTION_EDIT_LEAVE_DESCRIPTION : TRANSACTION_REGISTER_LEAVE_DESCRIPTION
        }
        cancelLabel={TRANSACTION_REGISTER_LEAVE_CANCEL_LABEL}
        confirmLabel={TRANSACTION_REGISTER_LEAVE_CONFIRM_LABEL}
        destructive
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
  amountValue: {
    ...TYPOGRAPHY.h1,
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

const editStyles = StyleSheet.create({
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  amountFieldWrapper: {
    flex: 1,
  },
  amountSign: {
    marginBottom: 20, // TextField 자체 컨테이너의 marginBottom(20)과 기준선을 맞춤
  },
  amountEditIcon: {
    width: 24,
    height: 24,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
    marginBottom: 20,
  },
});

export default TransactionRegisterScreen;
