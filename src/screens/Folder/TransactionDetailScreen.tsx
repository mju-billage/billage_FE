import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import DetailFieldRow from '../../components/Data Display/Lists/DetailFieldRow';
import Thumbnail from '../../components/Data Display/Image Placeholder/Thumbnail';
import AttachmentAddButton, { ATTACHMENT_SIZE } from '../../components/Input/Button/AttachmentAddButton';
import Button from '../../components/Input/Button/Button';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import TransactionDateSheet from '../Transactions/TransactionDateSheet';
import TransactionTextInputSheet from '../Transactions/TransactionTextInputSheet';
import TransactionSingleSelectSheet from '../Transactions/TransactionSingleSelectSheet';
import {
  useReceiptAttachments,
  type ScanApplyValues,
} from '../../hooks/useReceiptAttachments';
import type { EntryDetail } from '../../types/entry';
import * as entryService from '../../services/entryService';
import * as groupMembershipService from '../../services/groupMembershipService';
import * as fileService from '../../services/fileService';
import { useSubmitLock } from '../../hooks/useSubmitLock';
import { getActiveGroup } from '../../types/group';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  SNACKBAR_ENTRY_APPROVED,
  TRANSACTION_APPROVE_LABEL,
  TRANSACTION_DATE_LABEL_EXPENSE,
  TRANSACTION_DATE_LABEL_INCOME,
  TRANSACTION_DELETE_CONFIRM_DESCRIPTION,
  TRANSACTION_DELETE_CONFIRM_LABEL,
  TRANSACTION_DELETE_CONFIRM_TITLE,
  TRANSACTION_DETAIL_LOADING,
  TRANSACTION_DETAIL_RETRY_LABEL,
  TRANSACTION_DETAIL_TITLE,
  TRANSACTION_DUES_DETAIL_CTA_LABEL,
  TRANSACTION_ITEM_NAME_LABEL,
  TRANSACTION_LEDGER_LABEL,
  TRANSACTION_MANAGER_LABEL,
  TRANSACTION_MEMO_EMPTY_PLACEHOLDER,
  TRANSACTION_MEMO_LABEL,
  TRANSACTION_PAYER_COUNT_SUFFIX,
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
  SNACKBAR_TRANSACTION_UPDATED,
  TEXT_INPUT_SHEET_EDIT_LABEL,
  TRANSACTION_REGISTER_LEDGER_LOCKED_HINT,
  TRANSACTION_REGISTER_RECEIPT_MAX,
} from '../../constants/transactionScreenText';
import { FOREGROUND_DISABLED } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import Divider from '../../components/Data Display/Divider/Divider';
import { formatFullDate } from '../../utils/dateHeader';
import { transactionDetailLayoutStyles as layoutStyles } from '../Transactions/transactionDetailLayout';

const EDIT_ICON = require('../../assets/icons/action/Edit.png');
const DELETE_ICON = require('../../assets/icons/action/Delete.png');

type TransactionDetailNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TransactionDetail'
>;
type TransactionDetailRouteProp = RouteProp<
  RootStackParamList,
  'TransactionDetail'
>;

type LoadState = 'loading' | 'error' | 'ready';
type ActiveSheet = 'none' | 'date' | 'itemName' | 'manager' | 'memo';
type ActiveDialog = 'none' | 'scanApply';

function toDotDate(isoDate: string): string {
  return isoDate.replace(/-/g, '.');
}

function toIsoDate(dotDate: string): string {
  return dotDate.replace(/\./g, '-');
}

function idsKey(ids: number[]): string {
  return [...ids].sort((a, b) => a - b).join(',');
}

function TransactionDetailScreen() {
  const navigation = useNavigation<TransactionDetailNavigationProp>();
  const route = useRoute<TransactionDetailRouteProp>();
  const transactionId = route.params.transactionId;
  const hideActions = route.params.hideActions ?? false;

  const [entry, setEntry] = useState<EntryDetail | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>('none');
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>('none');
  const [managerOptions, setManagerOptions] = useState<{ key: string; label: string }[]>([]);
  const [pendingScanValues, setPendingScanValues] = useState<ScanApplyValues | null>(null);
  const { isLocked: isApproving, run: runApprove } = useSubmitLock();
  const { isLocked: isDeleting, run: runDelete } = useSubmitLock();
  const { isLocked: isPatching, run: runPatch } = useSubmitLock();
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  /** 증빙 PATCH 때 "뭐가 새로 추가/삭제됐는지" 비교할 기준점 — 서버에서 불러올 때마다 갱신. */
  const lastSyncedReceiptIdsRef = useRef<number[]>([]);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(null), 1600);
  };

  useEffect(() => {
    if (route.params.snackbarMessage) {
      showSnackbar(route.params.snackbarMessage);
      navigation.setParams({ snackbarMessage: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params.snackbarMessage, navigation]);

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code, error.message);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  /**
   * 스캔 인식 성공 시 호출된다(QA-039). 금액은 무시하고, 날짜·상호 중 현재 값과
   * 다른 게 있을 때만 scanApply 다이얼로그를 띄운다. 증빙 자체는 훅이 이미 붙였고,
   * 그 PATCH 는 아래 items-settle 이펙트가 알아서 보낸다 — 여기서는 필드만 다룬다.
   */
  const handleScanRecognized = (values: ScanApplyValues) => {
    if (!entry) {
      return;
    }
    const dateChanged = values.date !== null && toIsoDate(values.date) !== entry.occurredOn;
    const nameChanged = values.merchantName !== null && values.merchantName !== entry.title;
    if (dateChanged || nameChanged) {
      setPendingScanValues(values);
      setActiveDialog('scanApply');
    }
  };

  /** 증빙 삭제 모달에서 확정된 뒤 호출된다(QA-044) — 남은 id 는 훅이 계산해 건네준다. */
  const handleReceiptRemoved = (remainingIds: number[]) => {
    if (!entry) {
      return;
    }
    runPatch(async () => {
      try {
        await entryService.updateEntry(entry.id, { receiptFileIds: remainingIds });
        lastSyncedReceiptIdsRef.current = remainingIds;
        showSnackbar(SNACKBAR_TRANSACTION_UPDATED);
        return true;
      } catch (error) {
        showSnackbar(toErrorMessage(error));
        await load();
        return false;
      }
    });
  };

  const attachments = useReceiptAttachments({
    showSnackbar,
    onScanRecognized: handleScanRecognized,
    onConfirmRemove: handleReceiptRemoved,
  });

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const detail = await entryService.getEntryDetail(transactionId);
      setEntry(detail);
      const ids = detail.receiptFiles.map(f => Number(f.id));
      lastSyncedReceiptIdsRef.current = ids;
      attachments.setItems(
        detail.receiptFiles.map(f => ({
          key: f.id,
          previewUri: '',
          sourceUrl: f.url,
          fileId: Number(f.id),
          uploading: false,
        })),
      );
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const viewerIsOwner = getActiveGroup()?.myRole === 'OWNER';

  const handleConfirmDelete = () => {
    if (!entry) {
      return;
    }
    runDelete(async () => {
      try {
        await entryService.deleteEntry(entry.id);
        setDeleteDialogVisible(false);
        navigation.goBack();
        return true;
      } catch (error) {
        setDeleteDialogVisible(false);
        showSnackbar(toErrorMessage(error));
        return false;
      }
    }, { keepLockedOnSuccess: true });
  };

  const handleApprove = () => {
    if (!entry) {
      return;
    }
    runApprove(async () => {
      try {
        await entryService.approveEntry(entry.id);
        navigation.navigate('Main', {
          screen: 'Transactions',
          params: { snackbarMessage: SNACKBAR_ENTRY_APPROVED },
        });
        return true;
      } catch (error) {
        showSnackbar(toErrorMessage(error));
        return false;
      }
    }, { keepLockedOnSuccess: true });
  };

  /** 행별 즉시 수정(QA-039). 값이 안 바뀌면 호출하지 않는다 — 호출부에서 그 비교를 한다. */
  const patchEntry = (updates: entryService.UpdateEntryInput) => {
    if (!entry) {
      return;
    }
    runPatch(async () => {
      try {
        await entryService.updateEntry(entry.id, updates);
        await load();
        showSnackbar(SNACKBAR_TRANSACTION_UPDATED);
        return true;
      } catch (error) {
        showSnackbar(toErrorMessage(error));
        await load();
        return false;
      }
    });
  };

  const handleSaveDate = (nextDotDate: string) => {
    if (!entry) {
      return;
    }
    const nextIso = toIsoDate(nextDotDate);
    if (nextIso === entry.occurredOn) {
      return;
    }
    patchEntry({ occurredOn: nextIso });
  };

  const handleSaveItemName = (next: string) => {
    if (!entry) {
      return;
    }
    const trimmed = next.trim();
    if (trimmed === entry.title) {
      return;
    }
    patchEntry({ title: trimmed });
  };

  const handleSaveMemo = (next: string) => {
    if (!entry) {
      return;
    }
    const trimmed = next.trim();
    if (trimmed === (entry.memo ?? '')) {
      return;
    }
    patchEntry({ memo: trimmed });
  };

  const handleSelectManager = (key: string) => {
    if (!entry || key === entry.manager.userId) {
      return;
    }
    patchEntry({ managerUserId: key });
  };

  const loadManagerOptions = async () => {
    const group = getActiveGroup();
    if (!group) {
      return;
    }
    try {
      const memberships = await groupMembershipService.getMemberships(group.id);
      setManagerOptions(memberships.map(m => ({ key: m.userId, label: m.name })));
    } catch (error) {
      showSnackbar(toErrorMessage(error));
    }
  };

  const handlePressManager = () => {
    if (managerOptions.length === 0) {
      loadManagerOptions();
    }
    setActiveSheet('manager');
  };

  const handleConfirmScanApply = () => {
    if (pendingScanValues && entry) {
      const updates: entryService.UpdateEntryInput = {};
      if (pendingScanValues.date !== null) {
        const iso = toIsoDate(pendingScanValues.date);
        if (iso !== entry.occurredOn) {
          updates.occurredOn = iso;
        }
      }
      if (
        pendingScanValues.merchantName !== null &&
        pendingScanValues.merchantName !== entry.title
      ) {
        updates.title = pendingScanValues.merchantName;
      }
      patchEntry(updates);
    }
    setPendingScanValues(null);
    setActiveDialog('none');
  };

  const handleCancelScanApply = () => {
    setPendingScanValues(null);
    setActiveDialog('none');
  };

  const isPending = entry?.approvalStatus === 'PENDING';
  const editable = isPending && viewerIsOwner;

  /**
   * 증빙 추가가 끝나(업로드 완료, fileId 확정) 목록이 정착하면 조용히 PATCH 한다
   * (QA-039 — 성공 스낵바는 훅이 추가 시점에 이미 보여준 SNACKBAR_RECEIPT_ADDED 뿐,
   * 여기서 또 띄우지 않는다). X 삭제는 삭제 확인 모달 뒤 handleReceiptRemoved 가
   * 즉시, 별도로 처리한다(QA-044).
   */
  useEffect(() => {
    if (!editable || !entry || attachments.isUploading) {
      return;
    }
    const currentIds = attachments.items
      .filter((item): item is typeof item & { fileId: number } => item.fileId !== undefined)
      .map(item => item.fileId);
    if (idsKey(currentIds) === idsKey(lastSyncedReceiptIdsRef.current)) {
      return;
    }
    const newlyAddedIds = currentIds.filter(
      id => !lastSyncedReceiptIdsRef.current.includes(id),
    );
    runPatch(async () => {
      try {
        await entryService.updateEntry(entry.id, { receiptFileIds: currentIds });
        lastSyncedReceiptIdsRef.current = currentIds;
        return true;
      } catch (error) {
        showSnackbar(toErrorMessage(error));
        for (const id of newlyAddedIds) {
          fileService.deleteFile(String(id)).catch(() => {});
        }
        await load();
        return false;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachments.items, attachments.isUploading, editable]);

  if (loadState === 'loading' || loadState === 'error') {
    return (
      <ScreenContainer background="secondary">
        <AppBar title={TRANSACTION_DETAIL_TITLE} onBackPress={() => navigation.goBack()} />
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>
            {loadState === 'loading' ? TRANSACTION_DETAIL_LOADING : loadErrorMessage}
          </Text>
          {loadState === 'error' && (
            <Button label={TRANSACTION_DETAIL_RETRY_LABEL} onPress={load} hierarchy="secondary" style={{ alignSelf: 'center' }} />
          )}
        </View>
      </ScreenContainer>
    );
  }

  if (!entry) {
    return null;
  }

  const isIncome = entry.type === 'INCOME';
  const amount = entry.amount;
  const dateValue = entry.occurredOn;
  const itemNameValue = entry.title;
  const ledgerNameValue = entry.ledgerName;
  const memoValue = entry.memo ?? '';
  const managerValue = entry.manager.name;
  const canEditDelete = viewerIsOwner;
  const isDuesLinked = entry.duesExists;
  const canEdit = canEditDelete && !isDuesLinked && !isPending;
  const duesId = entry.duesId;

  return (
    <ScreenContainer
      background="secondary"
      snackbar={
        snackbarMessage ? <Snackbar visible title={snackbarMessage} /> : undefined
      }
    >
      <AppBar
        title={TRANSACTION_DETAIL_TITLE}
        onBackPress={() => navigation.goBack()}
        rightIcons={
          canEditDelete && !hideActions
            ? [
                ...(canEdit
                  ? [
                      {
                        icon: EDIT_ICON,
                        onPress: () =>
                          navigation.navigate('TransactionRegister', { transactionId }),
                        accessibilityLabel: 'edit',
                      },
                    ]
                  : []),
                {
                  icon: DELETE_ICON,
                  onPress: () => setDeleteDialogVisible(true),
                  accessibilityLabel: 'delete',
                },
              ]
            : []
        }
      />

      <ScrollView contentContainerStyle={layoutStyles.content}>
        <Text style={[layoutStyles.amountText, layoutStyles.amountSpacing]}>
          {isIncome ? '' : '-'}
          {amount.toLocaleString()}원
        </Text>

        <DetailFieldRow
          label={isIncome ? TRANSACTION_DATE_LABEL_INCOME : TRANSACTION_DATE_LABEL_EXPENSE}
          value={formatFullDate(dateValue)}
          onPress={editable ? () => setActiveSheet('date') : undefined}
        />
        <DetailFieldRow
          label={TRANSACTION_ITEM_NAME_LABEL}
          value={itemNameValue}
          onPress={editable ? () => setActiveSheet('itemName') : undefined}
        />
        <DetailFieldRow
          label={TRANSACTION_MANAGER_LABEL}
          value={managerValue}
          onPress={editable ? handlePressManager : undefined}
        />
        <DetailFieldRow
          label={TRANSACTION_LEDGER_LABEL}
          value={ledgerNameValue}
          disabled={editable}
        />
        {editable && (
          <Text style={layoutStyles.ledgerLockedHint}>
            {TRANSACTION_REGISTER_LEDGER_LOCKED_HINT}
          </Text>
        )}
        <DetailFieldRow
          label={TRANSACTION_MEMO_LABEL}
          value={memoValue}
          valuePlaceholder={TRANSACTION_MEMO_EMPTY_PLACEHOLDER}
          onPress={editable ? () => setActiveSheet('memo') : undefined}
        />
        <View style={layoutStyles.dividerWrapper}>
          <Divider />
        </View>

        <View style={layoutStyles.section}>
          <View style={layoutStyles.sectionLabelRow}>
            <Text style={layoutStyles.receiptSectionLabel}>{TRANSACTION_RECEIPT_LABEL}</Text>
            <Text style={layoutStyles.receiptCount}>
              <Text style={layoutStyles.receiptCountCurrent}>
                {editable ? attachments.items.length : entry.receiptFiles.length}
              </Text>
              /{editable ? attachments.maxCount : TRANSACTION_REGISTER_RECEIPT_MAX}
            </Text>
          </View>
          {editable ? (
            <View style={layoutStyles.thumbnailRow}>
              <AttachmentAddButton
                onPress={attachments.openAttachMenu}
                disabled={attachments.items.length >= attachments.maxCount}
              />
              {attachments.items.map(item => (
                <Pressable
                  key={item.key}
                  disabled={!item.sourceUrl}
                  onPress={() =>
                    item.sourceUrl &&
                    navigation.navigate('TransactionReceiptDetail', { fileUrl: item.sourceUrl })
                  }
                >
                  <Thumbnail
                    size={ATTACHMENT_SIZE}
                    imageUri={item.previewUri || undefined}
                    imageUrl={item.previewUri ? undefined : item.sourceUrl}
                    uploading={item.uploading}
                    onRemove={() => attachments.requestRemove(item.key)}
                  />
                </Pressable>
              ))}
            </View>
          ) : (
            entry.receiptFiles.length > 0 && (
              <View style={layoutStyles.thumbnailRow}>
                {entry.receiptFiles.map(file => (
                  <Pressable
                    key={file.id}
                    onPress={() =>
                      navigation.navigate('TransactionReceiptDetail', { fileUrl: file.url })
                    }
                  >
                    <Thumbnail size={ATTACHMENT_SIZE} imageUrl={file.url} />
                  </Pressable>
                ))}
              </View>
            )
          )}
        </View>

        {isDuesLinked && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {entry.payerCount}
              {TRANSACTION_PAYER_COUNT_SUFFIX}
            </Text>
            {entry.payers.map(payer => (
              <View key={payer.memberId} style={styles.payerRow}>
                <Text style={styles.payerName}>{payer.name}</Text>
                <Text style={styles.payerAmount}>{payer.amount.toLocaleString()}원</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      {isPending && viewerIsOwner && (
        <View style={styles.footer}>
          <Button
            label={TRANSACTION_APPROVE_LABEL}
            onPress={handleApprove}
            disabled={isApproving || attachments.isUploading || isPatching}
            fullWidth
          />
        </View>
      )}

      {isDuesLinked && duesId && (
        <View style={styles.footer}>
          <Button
            label={TRANSACTION_DUES_DETAIL_CTA_LABEL}
            onPress={() => navigation.navigate('DuesDetail', { duesId })}
            fullWidth
          />
        </View>
      )}

      {editable && (
        <>
          <TransactionDateSheet
            visible={activeSheet === 'date'}
            title={
              isIncome ? DATE_SHEET_TITLE_INCOME : DATE_SHEET_TITLE_EXPENSE
            }
            value={toDotDate(entry.occurredOn)}
            onClose={() => setActiveSheet('none')}
            onSave={handleSaveDate}
          />
          <TransactionTextInputSheet
            visible={activeSheet === 'itemName'}
            title={ITEM_NAME_SHEET_TITLE}
            placeholder={ITEM_NAME_SHEET_PLACEHOLDER}
            maxLength={ITEM_NAME_MAX_LENGTH}
            value={itemNameValue}
            onClose={() => setActiveSheet('none')}
            onSave={handleSaveItemName}
            confirmLabel={TEXT_INPUT_SHEET_EDIT_LABEL}
          />
          <TransactionTextInputSheet
            visible={activeSheet === 'memo'}
            title={MEMO_SHEET_TITLE}
            placeholder={MEMO_SHEET_PLACEHOLDER}
            maxLength={MEMO_MAX_LENGTH}
            value={memoValue}
            onClose={() => setActiveSheet('none')}
            onSave={handleSaveMemo}
            confirmLabel={TEXT_INPUT_SHEET_EDIT_LABEL}
          />
          <TransactionSingleSelectSheet
            visible={activeSheet === 'manager'}
            title={MANAGER_SELECT_SHEET_TITLE}
            options={managerOptions}
            selectedKey={entry.manager.userId}
            onClose={() => setActiveSheet('none')}
            onSelect={handleSelectManager}
          />
          {attachments.sheetsAndDialogs}
          <Dialog
            visible={activeDialog === 'scanApply'}
            title={SCAN_APPLY_CONFIRM_TITLE}
            description={SCAN_APPLY_CONFIRM_DESCRIPTION}
            cancelLabel={SCAN_APPLY_CANCEL_LABEL}
            confirmLabel={SCAN_APPLY_CONFIRM_LABEL}
            onCancel={handleCancelScanApply}
            onConfirm={handleConfirmScanApply}
          />
        </>
      )}

      <Dialog
        visible={deleteDialogVisible}
        title={TRANSACTION_DELETE_CONFIRM_TITLE}
        description={TRANSACTION_DELETE_CONFIRM_DESCRIPTION}
        confirmLabel={TRANSACTION_DELETE_CONFIRM_LABEL}
        destructive
        confirmDisabled={isDeleting}
        onCancel={() => setDeleteDialogVisible(false)}
        onConfirm={handleConfirmDelete}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
  section: {
    marginTop: 24,
  },
  sectionLabel: {
    ...TYPOGRAPHY.subtitle3,
    marginBottom: 12,
  },
  payerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  payerName: {
    ...TYPOGRAPHY.body1,
  },
  payerAmount: {
    ...TYPOGRAPHY.body1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});

export default TransactionDetailScreen;
