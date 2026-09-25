/** @screen ETC-3-PAGE-02-0 장부별 보고서 조회 */
/** @screen ETC-3-PAGE-02-1 장부별 보고서 상세(수입/지출) — 02-0의 탭 상태, 별도 라우트 아님 */
/**
 * 보고서 생성 메인(`ReportMainScreen`)의 장부별 탭 카드를 눌러 들어오는 상세
 * 화면. 목록에 없던 `ledgers[].entries`가 필요해 `GET /reports/{reportId}`로
 * 다시 조회한다(생성 직후 응답을 재사용하지 않음 — 목록↔상세 화면이 분리된
 * 스택이라 생성 시점 데이터를 들고 다닐 방법이 마땅치 않고, 상세 조회 API가
 * MEMBER 권한으로 별도 공개돼 있어 그냥 새로 부르는 쪽이 단순하다).
 *
 * 공유 버튼은 서버에 보고서 웹뷰/PDF 응답이 없어(Report.txt 정책 메모) OS
 * 공유 시트에 텍스트 요약만 실어 보낸다 — 새 API도 새 의존성도 필요 없다.
 */
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
import Divider from '../../components/Data Display/Divider/Divider';
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

  // ETC-5-SNACKBAR-08-0: 생성 직후 이 화면으로 이동하며 받은 완료 메시지를
  // 한 번만 띄운다(design-verification.md §5-11).
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
      return getApiErrorMessage(error.code);
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

        <CardBase style={styles.headerCard}>
          <FolderTabShape fill={FILL_NEUTRAL_SUBTLE} />
          <Text style={styles.headerTitle} numberOfLines={1}>
            {report.title}
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
    textAlign: 'right',
  },
  // 폴더 탭(`FolderTabShape`)이 카드 위로 20 튀어나와서 위 여백을 그만큼 더 둔다.
  headerCard: {
    marginTop: 24,
    gap: 4,
  },
  // 기간별 상세(`ReportByPeriodDetailScreen`)의 기간 줄과 같은 스타일.
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
  // 카드 = 제목 줄(장부명 + > 아이콘, 같은 줄) / 구분선 / 수입·지출 줄.
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
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  ledgerName: {
    ...TYPOGRAPHY.subtitle1,
    flex: 1,
  },
  // 장부명 줄과 수입/지출 줄 사이 구분선.
  ledgerDivider: {
    marginVertical: 8,
  },
  ledgerIncome: {
    ...TYPOGRAPHY.body2,
    color: FEEDBACK_POSITIVE_BOLD,
  },
  ledgerExpense: {
    ...TYPOGRAPHY.body2,
  },
  chevron: {
    width: 20,
    height: 20,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
});

export default ReportByLedgerDetailScreen;
