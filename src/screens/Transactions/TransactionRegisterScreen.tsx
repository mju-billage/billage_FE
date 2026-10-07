import { useCallback, useEffect, useState } from 'react';
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
import ReceiptScanningView from './ReceiptScanningView';
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
  const [pendingScanResult, setPendingScanResult] = useState<MockScanResult | null>(null);
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
    } catch {
      setReceiptItems(current => current.filter(item => item.key !== key));
      showSnackbar(SNACKBAR_IMAGE_UPLOAD_FAILED);
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
      setStage({ kind: 'scanning' });
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

  const handleScanComplete = (result: MockScanResult | null) => {
    if (!result) {
      setStage({ kind: 'scanFailed' });
      return;
    }

    if (receiptItems.length < TRANSACTION_REGISTER_RECEIPT_MAX) {
      setReceiptItems(current => [
        ...current,
        { key: `scan-${Date.now()}`, previewUri: '', uploading: false, fromScan: true },
      ]);
    }

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

  if (stage.kind === 'scanning') {
    return <ReceiptScanningView onComplete={handleScanComplete} />;
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
