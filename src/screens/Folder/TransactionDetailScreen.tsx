/** @screen DTB-2-PAGE-02-0 상세 내역_조회 */
/** @screen DTB-3-MODAL-01-0 상세 내역_삭제 */
/**
 * 4-A(Entry API 연동): 실 Entry 상세를 조회해 보여준다. (4-B 정리: DTB 전체
 * 목록이 실 API로 전환되며 `dtb-tx-N` 목 id를 만들어내는 곳이 사라져 이 화면의
 * 옛 목 데이터(`types/transaction.ts`) 분기가 도달 불가능해졌다 — 확인 후 분기와
 * 그 파일을 함께 걷어냈다. 이제 `transactionId`는 항상 실 Entry id다.)
 *
 * 수정/삭제/승인은 전부 총무(OWNER) 전용(Entry.txt) — 일반 관리자는 본인이 등록한
 * 승인 대기 내역도 못 고친다. `viewerIsOwner`로 아이콘을 감춘다. 승인 진입점은
 * 새 화면(DTB-2-PAGE-03-0, 미구현)을 만들지 않고 이 화면에 버튼 하나로 얹었다 —
 * 장부 상세 목록에서 승인 대기 내역도 이미 탭해서 들어올 수 있어 여기가 유일하게
 * 실제로 도달 가능한 지점이다.
 *
 * **상세 내역_납부관리_수입내역 변형(2026-09-11 추가, 시안:
 * `내역_상세내역조회_납부관리수입내역.png`, Screen ID 칸이 빈 데이터 기반 변형)**:
 * 마감된 회비에서 생성된 수입 내역(`entry.duesExists`)이면 납부자 명수·명단과
 * "회비 상세보기" CTA가 추가로 뜬다(`GET /entries/{id}`의 `payerCount`/`payers[]`/
 * `duesId`, Entry.txt §8). 시안 앱바엔 휴지통 아이콘만 있고 연필(수정) 아이콘이
 * 없어 이 변형에선 수정 진입점을 숨긴다 — 삭제 자체는 일반 삭제와 동일 동작이고
 * "해당 회비 상세는 삭제되지 않는다"는 시안 문구는 삭제를 막으라는 게 아니라
 * 이 내역을 지워도 회비 기록 자체는 안 지워진다는 데이터 무결성 설명이다.
 * `duesExists === false`(회비가 나중에 삭제된 경우)의 화면 표현은 시안에 없어
 * §5-4에 기획 확인 항목으로 남겼다 — 지금은 일반 내역과 동일하게 보여준다.
 */
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Thumbnail from '../../components/Data Display/Image Placeholder/Thumbnail';
import Badge from '../../components/Data Display/Badge/Badge';
import Button from '../../components/Input/Button/Button';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import type { EntryDetail } from '../../types/entry';
import * as entryService from '../../services/entryService';
import { getActiveGroup } from '../../types/group';
import { ApiError } from '../../services/apiClient';
import { buildAuthenticatedImageSource } from '../../utils/authenticatedImage';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  SNACKBAR_ENTRY_APPROVED,
  TRANSACTION_APPROVAL_PENDING_BADGE,
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
  TRANSACTION_MEMO_PLACEHOLDER,
  TRANSACTION_PAYER_COUNT_SUFFIX,
  TRANSACTION_RECEIPT_LABEL,
} from '../../constants/ledgerScreenText';
import {
  BORDER_NEUTRAL_NORMAL,
  FEEDBACK_POSITIVE_BOLD,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import Divider from '../../components/Data Display/Divider/Divider';

const EDIT_ICON = require('../../assets/icons/action/Edit.png');
const DELETE_ICON = require('../../assets/icons/action/Close.png');

type TransactionDetailNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TransactionDetail'
>;
type TransactionDetailRouteProp = RouteProp<
  RootStackParamList,
  'TransactionDetail'
>;

type LoadState = 'loading' | 'error' | 'ready';

function TransactionDetailScreen() {
  const navigation = useNavigation<TransactionDetailNavigationProp>();
  const route = useRoute<TransactionDetailRouteProp>();
  const transactionId = route.params.transactionId;

  const [entry, setEntry] = useState<EntryDetail | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const detail = await entryService.getEntryDetail(transactionId);
      setEntry(detail);
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, [transactionId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(null), 1600);
  };

  const viewerIsOwner = getActiveGroup()?.myRole === 'OWNER';

  const handleConfirmDelete = async () => {
    if (!entry || isDeleting) {
      return;
    }
    setIsDeleting(true);
    try {
      await entryService.deleteEntry(entry.id);
      setDeleteDialogVisible(false);
      navigation.goBack();
    } catch (error) {
      setDeleteDialogVisible(false);
      showSnackbar(toErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApprove = async () => {
    if (!entry || isApproving) {
      return;
    }
    setIsApproving(true);
    try {
      await entryService.approveEntry(entry.id);
      showSnackbar(SNACKBAR_ENTRY_APPROVED);
      load();
    } catch (error) {
      showSnackbar(toErrorMessage(error));
    } finally {
      setIsApproving(false);
    }
  };

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
  const isPending = entry.approvalStatus === 'PENDING';
  const isDuesLinked = entry.duesExists;
  const canEdit = canEditDelete && !isDuesLinked;
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
          canEditDelete
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

      <ScrollView contentContainerStyle={styles.content}>
        {isPending && (
          <Badge label={TRANSACTION_APPROVAL_PENDING_BADGE} status="warning" />
        )}
        <Text style={[styles.amount, isIncome && styles.amountPositive]}>
          {isIncome ? '+' : ''}
          {amount.toLocaleString()}원
        </Text>

        <Field
          label={isIncome ? TRANSACTION_DATE_LABEL_INCOME : TRANSACTION_DATE_LABEL_EXPENSE}
          value={dateValue}
        />
        <Field label={TRANSACTION_ITEM_NAME_LABEL} value={itemNameValue} />
        <Field label={TRANSACTION_MANAGER_LABEL} value={managerValue} />
        <Field label={TRANSACTION_LEDGER_LABEL} value={ledgerNameValue} />
        <Field
          label={TRANSACTION_MEMO_LABEL}
          value={memoValue || TRANSACTION_MEMO_EMPTY_PLACEHOLDER}
        />
        <View style={{marginTop: 12}}>
          <Divider />
        </View>

        {entry.receiptFiles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{TRANSACTION_RECEIPT_LABEL}</Text>
            <View style={styles.thumbnailRow}>
              {entry.receiptFiles.map(file => {
                const source = buildAuthenticatedImageSource(file.url);
                return (
                  <Pressable
                    key={file.id}
                    onPress={() =>
                      navigation.navigate('TransactionReceiptDetail', { fileUrl: file.url })
                    }
                  >
                    <Thumbnail imageUri={source.uri} imageHeaders={source.headers} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

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

        {isPending && viewerIsOwner && (
          <View style={styles.approveButtonWrapper}>
            <Button
              label={TRANSACTION_APPROVE_LABEL}
              onPress={handleApprove}
              disabled={isApproving}
              fullWidth
            />
          </View>
        )}
      </ScrollView>

      {isDuesLinked && duesId && (
        <View style={styles.footer}>
          <Button
            label={TRANSACTION_DUES_DETAIL_CTA_LABEL}
            onPress={() => navigation.navigate('DuesDetail', { duesId })}
            fullWidth
          />
        </View>
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 0,
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
  amount: {
    ...TYPOGRAPHY.h1,
    marginTop: 8,
    marginBottom: 24,
  },
  amountPositive: {
    color: FEEDBACK_POSITIVE_BOLD,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  fieldLabel: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  fieldValue: {
    ...TYPOGRAPHY.subtitle3,
    flexShrink: 1,
    textAlign: 'right',
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
  approveButtonWrapper: {
    marginTop: 24,
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
