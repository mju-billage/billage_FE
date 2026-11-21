import { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import CardBase from '../../components/Data Display/Card/CardBase';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import Divider from '../../components/Data Display/Divider/Divider';
import FolderTabShape from '../../components/Data Display/Card/FolderTabShape';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import type { ReportDetail } from '../../types/report';
import * as reportService from '../../services/reportService';
import { ApiError } from '../../services/apiClient';
import { useSubmitLock } from '../../hooks/useSubmitLock';
import { getActiveGroup } from '../../types/group';
import { formatExpense, formatWon } from '../../utils/currency';
import { formatDateDot } from '../../utils/dueDate';
import { truncateWithEllipsis } from '../../utils/truncateWithEllipsis';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  REPORT_DELETE_CONFIRM_DESCRIPTION,
  REPORT_DELETE_CONFIRM_LABEL,
  REPORT_DELETE_CONFIRM_TITLE,
  REPORT_DETAIL_CREATED_AT_LABEL,
  REPORT_DETAIL_EMPTY,
  REPORT_DETAIL_EXPENSE_LABEL,
  REPORT_DETAIL_INCOME_LABEL,
  REPORT_DETAIL_LOADING,
  REPORT_MAIN_RETRY_LABEL,
  REPORT_SHARE_EXPENSE_LABEL,
  REPORT_SHARE_INCOME_LABEL,
  SNACKBAR_REPORT_DELETED,
} from '../../constants/reportScreenText';
import {
  FEEDBACK_POSITIVE_BOLD,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const SHARE_ICON = require('../../assets/icons/action/Share.png');
const DELETE_ICON = require('../../assets/icons/action/Delete.png');
const CHEVRON_RIGHT_ICON = require('../../assets/icons/nav/Chevron Right.png');

type LoadState = 'loading' | 'error' | 'ready';
type ReportByLedgerDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ReportByLedgerDetailRouteProp = RouteProp<RootStackParamList, 'ReportByLedgerDetail'>;

function ReportByLedgerDetailScreen() {
  const navigation = useNavigation<ReportByLedgerDetailNavigationProp>();
  const route = useRoute<ReportByLedgerDetailRouteProp>();
  const { reportId } = route.params;

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const { isLocked: isDeleting, run: runDelete } = useSubmitLock();
  const viewerIsOwner = getActiveGroup()?.myRole === 'OWNER';

  useEffect(() => {
    if (route.params.snackbarMessage) {
      setSnackbarMessage(route.params.snackbarMessage);
      navigation.setParams({ snackbarMessage: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params.snackbarMessage]);

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code, error.message);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const detail = await reportService.getReportDetail(reportId);
      setReport(detail);
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, [reportId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleShare = () => {
    if (!report) {
      return;
    }
    Share.share({
      message: `${report.title}\n${REPORT_SHARE_INCOME_LABEL} ${formatWon(
        report.summary.totalIncome,
      )}원 · ${REPORT_SHARE_EXPENSE_LABEL} ${formatWon(report.summary.totalExpense)}원`,
    });
  };

  const handleConfirmDelete = () => {
    if (!report) {
      return;
    }
    runDelete(async () => {
      try {
        await reportService.deleteReport(report.reportId);
        setDeleteDialogVisible(false);
        navigation.navigate('ReportMain', { snackbarMessage: SNACKBAR_REPORT_DELETED });
        return true;
      } catch (error) {
        setDeleteDialogVisible(false);
        setSnackbarMessage(toErrorMessage(error));
        return false;
      }
    }, { keepLockedOnSuccess: true });
  };

  if (loadState === 'loading' || loadState === 'error' || !report) {
    return (
      <ScreenContainer background="primary">
        <AppBar type="sub" title="" onBackPress={() => navigation.goBack()} />
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>
            {loadState === 'error' ? loadErrorMessage : REPORT_DETAIL_LOADING}
          </Text>
          {loadState === 'error' && (
            <Button
              label={REPORT_MAIN_RETRY_LABEL}
              onPress={load}
              hierarchy="secondary"
              style={{ alignSelf: 'center' }}
            />
          )}
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      background="primary"
      snackbar={
        <Snackbar
          visible={snackbarMessage != null}
          title={snackbarMessage ?? ''}
          onClose={() => setSnackbarMessage(null)}
        />
      }
    >
      <AppBar
        type="sub"
        title={truncateWithEllipsis(report.title)}
        onBackPress={() => navigation.goBack()}
        rightIcons={[
          { icon: SHARE_ICON, onPress: handleShare },
          ...(viewerIsOwner
            ? [{ icon: DELETE_ICON, onPress: () => setDeleteDialogVisible(true) }]
            : []),
        ]}
      />

      <View style={styles.body}>
        <Text style={styles.metaText}>
          {REPORT_DETAIL_CREATED_AT_LABEL} {formatDateDot(report.createdAt)}
        </Text>

        <CardBase style={styles.headerCard}>
          <FolderTabShape fill={FILL_NEUTRAL_SUBTLE} />
          <Text style={styles.headerTitle} numberOfLines={1} accessibilityLabel={report.title}>
            {truncateWithEllipsis(report.title)}
          </Text>
          <Text style={styles.periodText}>
            {formatDateDot(report.startDate)} - {formatDateDot(report.endDate)}
          </Text>
        </CardBase>

        {report.ledgers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{REPORT_DETAIL_EMPTY}</Text>
          </View>
        ) : (
          <FlatList
            data={report.ledgers}
            keyExtractor={(item, index) => `${item.ledgerName}-${index}`}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  navigation.navigate('ReportLedgerEntries', {
                    reportTitle: report.title,
                    ledgerName: item.ledgerName,
                    startDate: report.startDate,
                    endDate: report.endDate,
                    totalIncome: item.totalIncome,
                    totalExpense: item.totalExpense,
                    entries: item.entries,
                  })
                }
              >
                <CardBase>
                  <View style={styles.ledgerTitleRow}>
                    <Text style={styles.ledgerName} numberOfLines={1}>
                      {item.ledgerName}
                    </Text>
                    <Image source={CHEVRON_RIGHT_ICON} style={styles.chevron} />
                  </View>
                  <View style={styles.ledgerDivider}>
                    <Divider />
                  </View>
                  <View style={styles.ledgerAmounts}>
                    <View style={styles.amountRow}>
                      <Text style={styles.amountLabel}>{REPORT_DETAIL_INCOME_LABEL}</Text>
                      <Text style={styles.ledgerIncome}>{formatWon(item.totalIncome)}원</Text>
                    </View>
                    <View style={styles.amountRow}>
                      <Text style={styles.amountLabel}>{REPORT_DETAIL_EXPENSE_LABEL}</Text>
                      <Text style={styles.ledgerExpense}>{formatExpense(item.totalExpense)}</Text>
                    </View>
                  </View>
                </CardBase>
              </Pressable>
            )}
          />
        )}
      </View>

      <Dialog
        visible={deleteDialogVisible}
        title={REPORT_DELETE_CONFIRM_TITLE}
        description={REPORT_DELETE_CONFIRM_DESCRIPTION}
        confirmLabel={REPORT_DELETE_CONFIRM_LABEL}
        destructive
        confirmDisabled={isDeleting}
        onCancel={() => setDeleteDialogVisible(false)}
        onConfirm={handleConfirmDelete}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 8,
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
  metaText: {
    ...TYPOGRAPHY.caption,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    textAlign: 'right',
  },
  headerCard: {
    marginTop: 24,
    gap: 4,
  },
  periodText: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  headerTitle: {
    ...TYPOGRAPHY.subtitle1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  ledgerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  ledgerAmounts: {
    gap: 4,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountLabel: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  ledgerName: {
    ...TYPOGRAPHY.subtitle1,
    flex: 1,
  },
  ledgerDivider: {
    marginVertical: 8,
  },
  ledgerIncome: {
    ...TYPOGRAPHY.subtitle1,
    color: FEEDBACK_POSITIVE_BOLD,
  },
  ledgerExpense: {
    ...TYPOGRAPHY.subtitle1,
  },
  chevron: {
    width: 20,
    height: 20,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
});

export default ReportByLedgerDetailScreen;
