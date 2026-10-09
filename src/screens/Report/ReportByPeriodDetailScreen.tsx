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
import FolderTabShape from '../../components/Data Display/Card/FolderTabShape';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import type { ReportDetail } from '../../types/report';
import * as reportService from '../../services/reportService';
import { ApiError } from '../../services/apiClient';
import { formatExpense, formatWon } from '../../utils/currency';
import { formatDateDot } from '../../utils/dueDate';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  REPORT_DETAIL_CREATED_AT_LABEL,
  REPORT_DETAIL_EMPTY,
  REPORT_DETAIL_EXPENSE_LABEL,
  REPORT_DETAIL_INCOME_LABEL,
  REPORT_DETAIL_LOADING,
  REPORT_MAIN_RETRY_LABEL,
  REPORT_SHARE_EXPENSE_LABEL,
  REPORT_SHARE_INCOME_LABEL,
} from '../../constants/reportScreenText';
import {
  FEEDBACK_POSITIVE_BOLD,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const SHARE_ICON = require('../../assets/icons/action/Share.png');
const CHEVRON_RIGHT_ICON = require('../../assets/icons/nav/Chevron Right.png');
const SNACKBAR_AUTO_HIDE_MS = 1600;

type LoadState = 'loading' | 'error' | 'ready';
type ReportByPeriodDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ReportByPeriodDetailRouteProp = RouteProp<RootStackParamList, 'ReportByPeriodDetail'>;

function ReportByPeriodDetailScreen() {
  const navigation = useNavigation<ReportByPeriodDetailNavigationProp>();
  const route = useRoute<ReportByPeriodDetailRouteProp>();
  const { reportId } = route.params;

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  useEffect(() => {
    if (route.params.snackbarMessage) {
      setSnackbarMessage(route.params.snackbarMessage);
      setTimeout(() => setSnackbarMessage(null), SNACKBAR_AUTO_HIDE_MS);
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
        snackbarMessage ? (
          <Snackbar visible title={snackbarMessage} onClose={() => setSnackbarMessage(null)} />
        ) : undefined
      }
    >
      <AppBar
        type="sub"
        title={report.title}
        onBackPress={() => navigation.goBack()}
        rightIcons={[{ icon: SHARE_ICON, onPress: handleShare }]}
      />

      <View style={styles.body}>
        <Text style={styles.metaText}>
          {REPORT_DETAIL_CREATED_AT_LABEL} {formatDateDot(report.createdAt)}
        </Text>

        <Pressable
          onPress={() =>
            navigation.navigate('ReportPeriodEntries', {
              reportTitle: report.title,
              startDate: report.startDate,
              endDate: report.endDate,
              summary: report.summary,
              ledgers: report.ledgers,
            })
          }
        >
          <CardBase style={styles.headerCard}>
            <FolderTabShape fill={FILL_NEUTRAL_SUBTLE} />
            <View style={styles.headerTopRow}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {report.title}
              </Text>
              <Image source={CHEVRON_RIGHT_ICON} style={styles.chevron} />
            </View>
            <Text style={styles.periodText}>
              {formatDateDot(report.startDate)} - {formatDateDot(report.endDate)}
            </Text>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>{REPORT_DETAIL_INCOME_LABEL}</Text>
              <Text style={styles.headerIncome}>{formatWon(report.summary.totalIncome)}원</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>{REPORT_DETAIL_EXPENSE_LABEL}</Text>
              <Text style={styles.headerExpense}>{formatExpense(report.summary.totalExpense)}</Text>
            </View>
          </CardBase>
        </Pressable>

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
                <CardBase style={styles.ledgerCard}>
                  <Text style={styles.ledgerName} numberOfLines={1}>
                    {item.ledgerName}
                  </Text>
                  <Image source={CHEVRON_RIGHT_ICON} style={styles.chevron} />
                </CardBase>
              </Pressable>
            )}
          />
        )}
      </View>
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
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  headerCard: {
    marginTop: 24,
    gap: 4,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...TYPOGRAPHY.subtitle1,
    flex: 1,
  },
  periodText: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountLabel: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  headerIncome: {
    ...TYPOGRAPHY.body2,
    color: FEEDBACK_POSITIVE_BOLD,
  },
  headerExpense: {
    ...TYPOGRAPHY.body2,
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
  ledgerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ledgerName: {
    ...TYPOGRAPHY.subtitle3,
  },
  chevron: {
    width: 20,
    height: 20,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
});

export default ReportByPeriodDetailScreen;
