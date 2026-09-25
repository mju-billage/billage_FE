/** @screen ETC-4-PAGE-05-0 보관함_장부 상세 (보고서 쪽 "장부 상세 조회"와 같은 ID, 아래 주석 참고) */
/**
 * **Screen ID는 보고서 쪽(`ReportLedgerEntriesScreen`)과 의도적으로 같다** —
 * `화면명세서\더보기\기록보관\더보기_기록보관_상세보기.png`(`ETC-3-PAGE-03-0`) UI
 * 요소 3번 [상태]에 "기록 보고서 공통 로직 상속: 장부 내역 화면이나 보고서 화면에서
 * 쓰이는 컴포넌트 로직을 동일하게 사용함"이라고 명시돼 있고, 실제로 `ETC\보관함\
 * ETC-4-PAGE-05-0.png` 크롭도 `ReportLedgerEntriesScreen`과 완전히 같은 레이아웃
 * (장부명 타이틀+기간+수입/지출 요약 카드+탭+일자별 리스트)이다 —
 * 서로 다른 화면이 우연히 같은 번호를 받은 충돌(`ETC-3-PAGE-03-0` 사례)이 아니라,
 * 진짜로 "같은 화면 개념을 두 도메인이 공유"하는 케이스다.
 *
 * 다만 코드까지 하나로 합치진 않았다 — 보고서 스냅샷(`ReportEntrySnapshot`)은 4필드뿐
 * 이라 그 화면을 그대로 재사용할 순 없었다(보관 스냅샷 `ArchivedEntry`엔 `memo`/
 * `approvalStatus`/`createdByName`/`receiptFiles[]`까지 있음).
 * 그래서 "컴포넌트 로직"만 진짜로 공유한다 — 탭+건수+일자별 그룹 리스트 조각인
 * `ReportEntryList`를 그대로 가져다 쓰고, 개별 항목 탭 시엔 richer한 데이터를 보여줄
 * 수 있는 전용 화면(`ArchiveEntryDetailScreen`, `ETC-5-PAGE-02-0`)으로 보낸다 — 스펙
 * 표 문구 그대로("컴포넌트 로직을 동일하게 사용") 딱 그 정도까지만 공유한다.
 *
 * `ArchiveDetailScreen`이 이미 들고 있던 장부 데이터를 route params로 그대로
 * 받는다 — 보고서 쪽과 같은 이유로 별도 재조회 API가 없다(`GET /archives/{id}`가
 * 한 번에 전체를 내려줌).
 */
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import AmountCard from '../../components/Data Display/Card/AmountCard';
import ReportEntryList from '../Report/ReportEntryList';
import type { ArchivedEntry } from '../../types/archive';
import { formatDateDot } from '../../utils/dueDate';
import { REPORT_DETAIL_PERIOD_LABEL } from '../../constants/reportScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type ArchiveLedgerEntriesNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ArchiveLedgerEntriesRouteProp = RouteProp<RootStackParamList, 'ArchiveLedgerEntries'>;

function ArchiveLedgerEntriesScreen() {
  const navigation = useNavigation<ArchiveLedgerEntriesNavigationProp>();
  const route = useRoute<ArchiveLedgerEntriesRouteProp>();
  const { ledgerName, startDate, endDate, totalIncome, totalExpense, entries } = route.params;

  return (
    <ScreenContainer
      background="primary"
      // 하단 안전영역은 흰 목록 영역이 직접 채운다(안 그러면 그 자리에 파란 띠가 남는다).
      edges={['top']}
    >
      <AppBar type="sub" title={ledgerName} onBackPress={() => navigation.goBack()} />

      <View style={styles.header}>
        <Text style={styles.periodText}>
          {REPORT_DETAIL_PERIOD_LABEL} {formatDateDot(startDate)} - {formatDateDot(endDate)}
        </Text>

        <AmountCard type="incomeExpense" income={totalIncome} expense={totalExpense} />
      </View>

      <ReportEntryList
        sheet
        entries={entries.map(entry => ({ ...entry, ledgerName }))}
        onPressEntry={entry =>
          navigation.navigate('ArchiveEntryDetail', {
            ledgerName,
            // `ReportEntryList`는 `TaggedReportEntry`(4필드+ledgerName+approvalStatus/
            // receiptFiles 선택)로만 타입돼 있지만 실제로 넘어오는 객체는 위에서
            // 스프레드한 `ArchivedEntry`(memo/createdByName 등 포함) 그대로다 — 참조가 같아 안전하게 캐스팅해서 전체 필드를 꺼낸다.
            entry: entry as unknown as ArchivedEntry & { ledgerName: string },
          })
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // 기간 줄 + 요약 카드(파란 영역). 아래 16은 흰 목록 영역과의 파란 간격.
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  periodText: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
});

export default ArchiveLedgerEntriesScreen;
