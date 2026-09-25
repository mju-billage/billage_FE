/** @screen ETC-3-PAGE-03-0 더보기 > 보관함 > 기록 보기 */
/**
 * IA는 이 ID를 보고서 상세(`ReportByPeriodDetailScreen`)와 같다고 적었지만, 실제
 * 스펙시트(`더보기_기록보관_상세보기.png`, ver 0.25)는
 * **표 헤더에 독립적으로 `ETC-3-PAGE-03-0`을 할당**하고 있고 UI 구성도
 * 전혀 다르다(앱바 타이틀+닫기 버튼, 읽기전용 "백업 일시" 텍스트, 장부 요약
 * 카드 리스트) — IA와 스펙시트가 서로 다른 화면에 같은 ID를 준 충돌이다.
 *
 * **드릴다운**: 보관 상세(`GET /archives/{id}`)는
 * `ledgers[].entries[]`에 `memo`/`approvalStatus`/
 * `createdByName`/`receiptFiles[]`까지 전부 내려준다(`archiveService.ts`의
 * `ArchivedEntry` 참고). 스펙시트 UI 요소 3번 [액션]("개별 카드 영역 터치 시 ... '장부 상세
 * 뷰어' 화면으로 이동")에 따라 카드를 누르면
 * `ArchiveLedgerEntriesScreen`(`@screen ETC-4-PAGE-05-0` — 보고서 쪽과 공유 ID,
 * 장부 하나의 내역 목록, `ReportEntryList` 재사용)으로, 개별 내역을 또 누르면
 * `ArchiveEntryDetailScreen`(`@screen ETC-5-PAGE-02-0` — 역시 공유 ID, 영수증·메모까지
 * 표시)으로 이동한다. 같은 UI 요소의 [상태]가 "내역 유무에 따라 '확장형 카드'
 * 또는 장부명만 노출되는 '심플 리스트'로 렌더링"이라고 명시해, 빈 장부(entries
 * 0건)는 금액 없이 이름+화살표만 보여준다(둘 다 보여주되 형태만 다르다).
 */
import { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import CardBase from '../../components/Data Display/Card/CardBase';
import type { ArchiveDetail } from '../../types/archive';
import * as archiveService from '../../services/archiveService';
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
  ARCHIVE_DETAIL_CREATED_AT_LABEL,
  ARCHIVE_DETAIL_EMPTY,
  ARCHIVE_DETAIL_EXPENSE_LABEL,
  ARCHIVE_DETAIL_INCOME_LABEL,
  ARCHIVE_DETAIL_LOADING,
  ARCHIVE_RETRY_LABEL,
} from '../../constants/archiveScreenText';
import {
  FEEDBACK_POSITIVE_BOLD,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const CHEVRON_RIGHT_ICON = require('../../assets/icons/nav/Chevron Right.png');
const CLOSE_ICON = require('../../assets/icons/action/Close.png');

type LoadState = 'loading' | 'error' | 'ready';
type ArchiveDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ArchiveDetailRouteProp = RouteProp<RootStackParamList, 'ArchiveDetail'>;

function ArchiveDetailScreen() {
  const navigation = useNavigation<ArchiveDetailNavigationProp>();
  const route = useRoute<ArchiveDetailRouteProp>();
  const { archiveId } = route.params;

  const [archive, setArchive] = useState<ArchiveDetail | null>(null);
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
      const detail = await archiveService.getArchiveDetail(archiveId);
      setArchive(detail);
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, [archiveId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loadState === 'loading' || loadState === 'error' || !archive) {
    return (
      <ScreenContainer background="primary">
        <AppBar
          type="sub"
          title=""
          onBackPress={() => navigation.goBack()}
          rightIcons={[
            { icon: CLOSE_ICON, onPress: () => navigation.goBack(), accessibilityLabel: 'close' },
          ]}
        />
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>
            {loadState === 'error' ? loadErrorMessage : ARCHIVE_DETAIL_LOADING}
          </Text>
          {loadState === 'error' && (
            <Button
              label={ARCHIVE_RETRY_LABEL}
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
    <ScreenContainer background="primary">
      <AppBar
        type="sub"
        title={archive.title}
        onBackPress={() => navigation.goBack()}
        rightIcons={[
          {
            /* 명세: 닫기는 "뷰어 모드를 완전히 종료하고 보관함 메인으로 이동" —
               이 화면은 보관함 메인에서 1뎁스로만 진입해(다른 화면에서 push 없음)
               백버튼과 목적지가 같다. goBack()이 별도 push 없이 정확히 그 화면으로
               돌아가 스택이 안 쌓인다, navigate('Archive')는 새 인스턴스를 push해
               중복 히스토리를 남기므로 안 쓴다. */
            icon: CLOSE_ICON,
            onPress: () => navigation.goBack(),
            accessibilityLabel: 'close',
          },
        ]}
      />

      <View style={styles.body}>
        <Text style={styles.metaText}>
          {ARCHIVE_DETAIL_CREATED_AT_LABEL} {formatDateDot(archive.createdAt)}
        </Text>

        {archive.ledgers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{ARCHIVE_DETAIL_EMPTY}</Text>
          </View>
        ) : (
          <FlatList
            data={archive.ledgers}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const hasEntries = item.entries.length > 0;
              return (
                <Pressable
                  onPress={() =>
                    navigation.navigate('ArchiveLedgerEntries', {
                      ledgerName: item.name,
                      startDate: archive.startDate,
                      endDate: archive.endDate,
                      totalIncome: item.totalIncome,
                      totalExpense: item.totalExpense,
                      entries: item.entries,
                    })
                  }
                >
                  <CardBase style={styles.ledgerCard}>
                    <View style={styles.ledgerNameRow}>
                      <Text style={styles.ledgerName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Image source={CHEVRON_RIGHT_ICON} style={styles.chevronIcon} />
                    </View>
                    {/* 시안 UI 요소 3번 [상태]: 내역 유무에 따라 금액이 모두 포함된
                        "확장형 카드" 또는 장부명만 노출되는 "심플 리스트"로 렌더링한다. */}
                    {hasEntries && (
                      <>
                        {/* 장부별 기간 필드는 서버에 없다 — 보관
                            기록 전체의 기간(archive.startDate/endDate)을 대신 쓴다,
                            한 스냅샷 안 장부는 전부 같은 기간이라 값은 맞다. */}
                        <Text style={styles.periodText}>
                          {formatDateDot(archive.startDate)} - {formatDateDot(archive.endDate)}
                        </Text>
                        <View style={styles.amountRow}>
                          <Text style={styles.amountLabel}>{ARCHIVE_DETAIL_INCOME_LABEL}</Text>
                          <Text style={styles.ledgerIncome}>{formatWon(item.totalIncome)}원</Text>
                        </View>
                        <View style={styles.amountRow}>
                          <Text style={styles.amountLabel}>{ARCHIVE_DETAIL_EXPENSE_LABEL}</Text>
                          <Text style={styles.ledgerExpense}>{formatExpense(item.totalExpense)}</Text>
                        </View>
                      </>
                    )}
                  </CardBase>
                </Pressable>
              );
            }}
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
    gap: 4,
  },
  ledgerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ledgerName: {
    ...TYPOGRAPHY.subtitle3,
    flex: 1,
  },
  chevronIcon: {
    width: 20,
    height: 20,
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
  ledgerIncome: {
    ...TYPOGRAPHY.body2,
    color: FEEDBACK_POSITIVE_BOLD,
  },
  ledgerExpense: {
    ...TYPOGRAPHY.body2,
  },
});

export default ArchiveDetailScreen;
