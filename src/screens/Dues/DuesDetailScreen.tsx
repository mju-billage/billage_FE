import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import TextButton from '../../components/Input/Button/TextButton';
import Tabs from '../../components/Navigation/Tabs/Tabs';
import DuesStatusCard from '../../components/Data Display/Card/DuesStatusCard';
import MemberListItem from '../../components/Data Display/Lists/MemberListItem';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import FolderMoreMenu from '../Folder/FolderMoreMenu';
import type { MenuItem } from '../../components/Navigation/Menu/Menu';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import type { DuesDetail, DuesMember, PaymentStatus } from '../../types/dues';
import { getActiveGroup } from '../../types/group';
import * as duesService from '../../services/duesService';
import { ApiError } from '../../services/apiClient';
import {
  daysUntil,
  formatDDayLabel,
  formatDateDot,
  getDDaySeverity,
} from '../../utils/dueDate';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  DUES_BADGE_CLOSED,
  DUES_CLOSE_CONFIRM_DESCRIPTION,
  DUES_CLOSE_CONFIRM_LABEL,
  DUES_CLOSE_CONFIRM_TITLE,
  DUES_DELETE_CONFIRM_DESCRIPTION,
  DUES_DELETE_CONFIRM_LABEL,
  DUES_DELETE_CONFIRM_TITLE,
  DUES_DETAIL_CARD_TITLE,
  DUES_DETAIL_LOADING,
  DUES_DETAIL_RETRY_LABEL,
  DUES_MEMBER_COUNT_SUFFIX,
  DUES_MEMBER_LIST_EMPTY,
  DUES_MEMBER_TAB_PAID,
  DUES_MEMBER_TAB_UNPAID,
  DUES_MENU_ACCESSIBILITY_LABEL,
  DUES_MENU_CLOSE_LABEL,
  DUES_MENU_DELETE_LABEL,
  DUES_MENU_EDIT_LABEL,
  DUES_MENU_MEMBERS_LABEL,
  DUES_PAYMENT_MARK_PAID_LABEL,
  DUES_PAYMENT_MARK_UNPAID_LABEL,
  DUES_REQUEST_ENTRY_LABEL,
  SNACKBAR_DUES_CLOSED_PREFIX,
  SNACKBAR_DUES_CLOSED_SUFFIX,
  SNACKBAR_DUES_DELETED_PREFIX,
  SNACKBAR_DUES_DELETED_SUFFIX,
  SNACKBAR_DUES_PAYMENT_CANCELLED_SUFFIX,
  SNACKBAR_DUES_PAYMENT_CONFIRMED_SUFFIX,
} from '../../constants/duesScreenText';
import {
  BACKGROUND_SECONDARY,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TYPOGRAPHY } from '../../constants/typography';

const MENU_ICON = require('../../assets/icons/action/Menu Vertical.png');

const SNACKBAR_AUTO_HIDE_MS = 1600;

type DuesDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DuesDetailRouteProp = RouteProp<RootStackParamList, 'DuesDetail'>;

type MemberTab = 'unpaid' | 'paid';
type LoadState = 'loading' | 'error' | 'ready';

function DuesDetailScreen() {
  const navigation = useNavigation<DuesDetailNavigationProp>();
  const route = useRoute<DuesDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const duesId = route.params.duesId;

  const [detail, setDetail] = useState<DuesDetail | null>(null);
  const [tab, setTab] = useState<MemberTab>('unpaid');
  const [members, setMembers] = useState<DuesMember[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const [membersLoadError, setMembersLoadError] = useState('');
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [closeDialogVisible, setCloseDialogVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code, error.message);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const loadMembers = useCallback(
    async (nextTab: MemberTab) => {
      setIsMembersLoading(true);
      setMembersLoadError('');
      setSelectedMemberIds([]);
      try {
        const result = await duesService.getDuesMembers(duesId, {
          status: nextTab === 'paid' ? 'PAID' : 'UNPAID',
        });
        setMembers([...result].sort((a, b) => a.name.localeCompare(b.name, 'ko')));
      } catch (error) {
        setMembers([]);
        setMembersLoadError(toErrorMessage(error));
      } finally {
        setIsMembersLoading(false);
      }
    },
    [duesId],
  );

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const result = await duesService.getDuesDetail(duesId);
      setDetail(result);
      const initialTab: MemberTab = result.status === 'CLOSED' ? 'paid' : 'unpaid';
      setTab(initialTab);
      await loadMembers(initialTab);
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, [duesId, loadMembers]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleChangeTab = (nextTab: MemberTab) => {
    setTab(nextTab);
    loadMembers(nextTab);
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(null), SNACKBAR_AUTO_HIDE_MS);
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMemberIds(current =>
      current.includes(memberId)
        ? current.filter(id => id !== memberId)
        : [...current, memberId],
    );
  };

  const handleChangePaymentStatus = async () => {
    if (selectedMemberIds.length === 0 || isChangingStatus) {
      return;
    }
    const nextStatus: PaymentStatus = tab === 'unpaid' ? 'PAID' : 'UNPAID';
    setIsChangingStatus(true);
    try {
      const result = await duesService.updateDuesMembersPaymentStatus(
        duesId,
        selectedMemberIds,
        nextStatus,
      );
      showSnackbar(
        nextStatus === 'PAID'
          ? `${result.changedCount}${SNACKBAR_DUES_PAYMENT_CONFIRMED_SUFFIX}`
          : `${result.changedCount}${SNACKBAR_DUES_PAYMENT_CANCELLED_SUFFIX}`,
      );
      const updatedDetail = await duesService.getDuesDetail(duesId);
      setDetail(updatedDetail);
      await loadMembers(tab);
    } catch (error) {
      showSnackbar(toErrorMessage(error));
    } finally {
      setIsChangingStatus(false);
    }
  };

  const viewerIsOwner = getActiveGroup()?.myRole === 'OWNER';

  const menuItems: MenuItem[] = detail
    ? [
        { key: 'edit', label: DUES_MENU_EDIT_LABEL },
        ...(detail.status !== 'CLOSED'
          ? [{ key: 'members', label: DUES_MENU_MEMBERS_LABEL }]
          : []),
        ...(detail.status === 'OPEN'
          ? [{ key: 'close', label: DUES_MENU_CLOSE_LABEL }]
          : []),
        { key: 'delete', label: DUES_MENU_DELETE_LABEL, destructive: true },
      ]
    : [];

  const handleSelectMenu = (key: string) => {
    setMoreMenuVisible(false);
    if (key === 'edit') {
      navigation.navigate('DuesEdit', { duesId });
    } else if (key === 'members') {
      navigation.navigate('DuesMemberEdit', { duesId });
    } else if (key === 'close') {
      setCloseDialogVisible(true);
    } else if (key === 'delete') {
      setDeleteDialogVisible(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!detail || isDeleting) {
      return;
    }
    setIsDeleting(true);
    try {
      await duesService.deleteDues(detail.id);
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Main',
            params: {
              screen: 'Dues',
              params: {
                snackbarMessage: `${SNACKBAR_DUES_DELETED_PREFIX}${detail.title}${SNACKBAR_DUES_DELETED_SUFFIX}`,
              },
            },
          },
        ],
      });
    } catch (error) {
      setDeleteDialogVisible(false);
      showSnackbar(toErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmClose = async () => {
    if (!detail || isClosing) {
      return;
    }
    setIsClosing(true);
    try {
      await duesService.closeDues(detail.id);
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Main',
            params: {
              screen: 'Dues',
              params: {
                snackbarMessage: `${SNACKBAR_DUES_CLOSED_PREFIX}${detail.title}${SNACKBAR_DUES_CLOSED_SUFFIX}`,
              },
            },
          },
        ],
      });
    } catch (error) {
      setCloseDialogVisible(false);
      showSnackbar(toErrorMessage(error));
    } finally {
      setIsClosing(false);
    }
  };

  if (loadState === 'loading' || loadState === 'error') {
    return (
      <ScreenContainer background="primary">
        <AppBar title="" onBackPress={() => navigation.goBack()} />
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>
            {loadState === 'loading' ? DUES_DETAIL_LOADING : loadErrorMessage}
          </Text>
          {loadState === 'error' && (
            <Button
              label={DUES_DETAIL_RETRY_LABEL}
              onPress={load}
              hierarchy="secondary"
              style={{ alignSelf: 'center' }}
            />
          )}
        </View>
      </ScreenContainer>
    );
  }

  if (!detail) {
    return null;
  }

  const isClosed = detail.status === 'CLOSED';
  const isScheduled = detail.status === 'SCHEDULED';
  const canChangeStatus = viewerIsOwner && detail.status === 'OPEN';
  const daysLeft = daysUntil(detail.dueDate);
  const dDayLabel = isClosed
    ? DUES_BADGE_CLOSED
    : isScheduled
    ? formatDateDot(detail.startDate)
    : formatDDayLabel(daysLeft);
  const badgeStatus: 'positive' | 'warning' | 'destructive' | 'neutral' =
    !isClosed && !isScheduled ? getDDaySeverity(daysLeft) : 'neutral';
  const memberCount = tab === 'paid' ? detail.paidCount : detail.unpaidCount;

  return (
    <ScreenContainer
      background="primary"
      edges={['top']}
      snackbar={
        snackbarMessage ? (
          <Snackbar visible title={snackbarMessage} />
        ) : undefined
      }
      snackbarOffset={canChangeStatus ? 68 : 0}
    >
      <AppBar
        title={detail.title}
        onBackPress={() => navigation.goBack()}
        rightIcons={
          viewerIsOwner
            ? [
                {
                  icon: MENU_ICON,
                  onPress: () => setMoreMenuVisible(true),
                  accessibilityLabel: DUES_MENU_ACCESSIBILITY_LABEL,
                },
              ]
            : []
        }
      />

      <View style={styles.header}>
        <DuesStatusCard
          title={DUES_DETAIL_CARD_TITLE}
          dDayLabel={dDayLabel}
          badgeStatus={badgeStatus}
          paidMemberCount={detail.paidCount}
          totalMemberCount={detail.targetCount}
          paidAmount={detail.paidCount * detail.amount}
          totalAmount={detail.expectedTotalAmount}
          periodStart={formatDateDot(detail.startDate)}
          periodEnd={formatDateDot(detail.dueDate)}
          ledgerName={detail.ledger.name}
          duesAmount={detail.amount}
        />
      </View>

      <View style={[styles.listSection, { paddingBottom: insets.bottom }]}>
        <View style={styles.tabsWrapper}>
          <Tabs
            items={[
              { label: DUES_MEMBER_TAB_UNPAID, value: 'unpaid' },
              { label: DUES_MEMBER_TAB_PAID, value: 'paid' },
            ]}
            value={tab}
            onChange={handleChangeTab}
            showIcon={false}
            fullWidth
          />
        </View>

        <View style={styles.memberCountRow}>
          <Text style={styles.memberCountText}>
            {memberCount}{DUES_MEMBER_COUNT_SUFFIX}
          </Text>
          {viewerIsOwner && tab === 'unpaid' && (
            <TextButton
              label={DUES_REQUEST_ENTRY_LABEL}
              hierarchy="tertiary"
              onPress={() => navigation.navigate('DuesRequest')}
            />
          )}
        </View>

        <ScrollView contentContainerStyle={styles.memberScrollContent}>
          {isMembersLoading ? (
            <Text style={styles.stateText}>{DUES_DETAIL_LOADING}</Text>
          ) : membersLoadError ? (
            <View style={styles.membersErrorContainer}>
              <Text style={styles.stateText}>{membersLoadError}</Text>
              <Button
                label={DUES_DETAIL_RETRY_LABEL}
                onPress={() => loadMembers(tab)}
                hierarchy="secondary"
                style={{ alignSelf: 'center' }}
              />
            </View>
          ) : members.length === 0 ? (
            <Text style={styles.emptyText}>{DUES_MEMBER_LIST_EMPTY}</Text>
          ) : (
            <View style={styles.memberList}>
              {members.map(member => (
                <MemberListItem
                  key={member.memberId}
                  name={member.name}
                  amount={detail.amount}
                  showAmount={tab === 'paid'}
                  showCheckbox={canChangeStatus}
                  selected={selectedMemberIds.includes(member.memberId)}
                  onPress={
                    canChangeStatus
                      ? () => toggleMemberSelection(member.memberId)
                      : undefined
                  }
                />
              ))}
            </View>
          )}
        </ScrollView>

        {canChangeStatus && (
          <View style={styles.ctaWrapper}>
            <Button
              label={
                tab === 'unpaid'
                  ? DUES_PAYMENT_MARK_PAID_LABEL
                  : DUES_PAYMENT_MARK_UNPAID_LABEL
              }
              onPress={handleChangePaymentStatus}
              disabled={selectedMemberIds.length === 0 || isChangingStatus}
              fullWidth
            />
          </View>
        )}
      </View>

      <FolderMoreMenu
        visible={moreMenuVisible}
        onClose={() => setMoreMenuVisible(false)}
        items={menuItems}
        onSelect={handleSelectMenu}
      />

      <Dialog
        visible={deleteDialogVisible}
        title={DUES_DELETE_CONFIRM_TITLE}
        description={DUES_DELETE_CONFIRM_DESCRIPTION}
        confirmLabel={DUES_DELETE_CONFIRM_LABEL}
        destructive
        confirmDisabled={isDeleting}
        onCancel={() => setDeleteDialogVisible(false)}
        onConfirm={handleConfirmDelete}
      />

      <Dialog
        visible={closeDialogVisible}
        title={DUES_CLOSE_CONFIRM_TITLE}
        description={DUES_CLOSE_CONFIRM_DESCRIPTION}
        confirmLabel={DUES_CLOSE_CONFIRM_LABEL}
        confirmDisabled={isClosing}
        onCancel={() => setCloseDialogVisible(false)}
        onConfirm={handleConfirmClose}
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
  membersErrorContainer: {
    alignItems: 'center',
    gap: 16,
    paddingTop: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  listSection: {
    flex: 1,
    marginTop: 16,
    paddingHorizontal: 20,
    backgroundColor: BACKGROUND_SECONDARY,
  },
  tabsWrapper: {
    marginHorizontal: -20,
  },
  memberScrollContent: {
    paddingBottom: 40,
  },
  memberCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
  },
  memberCountText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  emptyText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginTop: 24,
    textAlign: 'center',
  },
  memberList: {
    marginTop: 4,
  },
  ctaWrapper: {
    paddingBottom: 16,
    paddingTop: 8,
  },
});

export default DuesDetailScreen;
