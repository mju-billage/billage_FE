/** @screen ETC-3-PAGE-02-0 장부별 보고서 조회 */
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
import { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import CardBase from '../../components/Data Display/Card/CardBase';
import type { ReportDetail } from '../../types/report';
import * as reportService from '../../services/reportService';
import { ApiError } from '../../services/apiClient';
import { formatWon } from '../../utils/currency';
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
  REPORT_DETAIL_LOADING,
  REPORT_MAIN_RETRY_LABEL,
  REPORT_SHARE_EXPENSE_LABEL,
  REPORT_SHARE_INCOME_LABEL,
} from '../../constants/reportScreenText';
import {
  FEEDBACK_NEGATIVE_BOLD,
  FEEDBACK_POSITIVE_BOLD,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const SHARE_ICON = require('../../assets/icons/action/Share.png');
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
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
          <Text style={styles.headerTitle} numberOfLines={1}>
            {report.title}
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
                <CardBase style={styles.ledgerCard}>
                  <View style={styles.ledgerCardTextColumn}>
                    <Text style={styles.ledgerName} numberOfLines={1}>
                      {item.ledgerName}
                    </Text>
                    <Text style={styles.ledgerIncome}>
                      +{formatWon(item.totalIncome)}원
                    </Text>
                    <Text style={styles.ledgerExpense}>
                      -{formatWon(item.totalExpense)}원
                    </Text>
                  </View>
                  <Image source={CHEVRON_RIGHT_ICON} style={styles.chevron} />
                </CardBase>
              </Pressable>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
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
    marginTop: 8,
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
  ledgerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ledgerCardTextColumn: {
    gap: 4,
  },
  ledgerName: {
    ...TYPOGRAPHY.subtitle3,
  },
  ledgerIncome: {
    ...TYPOGRAPHY.body2,
    color: FEEDBACK_POSITIVE_BOLD,
  },
  ledgerExpense: {
    ...TYPOGRAPHY.body2,
    color: FEEDBACK_NEGATIVE_BOLD,
  },
  chevron: {
    width: 20,
    height: 20,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
});

export default ReportByLedgerDetailScreen;
