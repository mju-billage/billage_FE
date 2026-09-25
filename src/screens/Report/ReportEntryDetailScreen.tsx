/** @screen ETC-5-PAGE-02-0 상세 내역 조회 */
/**
 * 장부별/기간별 조회 플로우 4화면(ETC-3-PAGE-02-0/03-0, ETC-4-PAGE-05-0/07-0)의
 * 공통 착지점. **`TransactionDetailScreen`을 재사용하지 않는다** — 재사용
 * 가능한지 먼저 확인했는데, `GET /reports/{reportId}` 응답의 내역이 스냅샷이라
 * `entryId`가 없다(2026-09-05 실호출 확인, `types/report.ts` 주석). 그
 * 화면은 `transactionId`로 살아있는 Entry를 다시 조회하는 구조라 애초에 붙일
 * 수가 없고, 붙일 수 있었다 해도 스냅샷 정책(원본이 바뀌어도 보고서는 안
 * 바뀜)과 맞지 않는다. 그래서 route params로 받은 스냅샷 값(구분/금액/
 * 발생일/내역명 + 소속 장부명)만 그대로 보여주는 새 화면을 만들었다 —
 * 영수증·메모·담당자·승인상태는 스냅샷에 없어 표시하지 않는다.
 *
 * ⚠️ 2026-09-06 등급 하향(`design-verification.md` §2, [구현]→[부족함]):
 * 시안 UI 요소 6번은 이 화면의 존재 이유를 "영수증 원본과 상세 메모까지
 * 끝까지 추적 및 조회"라고 적었는데 그 핵심 기능이 스냅샷 한계로 아예
 * 빠져 있다 — 지금은 필드 5개만 보여주는 반쪽 화면이다. 서버가 스냅샷에
 * `memo`/`receipts`를 추가해주면(`docs/backend-requests.md` 1순위) 이 화면에
 * 필드를 더 채울 것.
 */
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import { formatWon } from '../../utils/currency';
import { formatDateDot } from '../../utils/dueDate';
import {
  FILTER_TYPE_EXPENSE,
  FILTER_TYPE_INCOME,
} from '../../constants/ledgerScreenText';
import {
  REPORT_ENTRY_DETAIL_AMOUNT_LABEL,
  REPORT_ENTRY_DETAIL_DATE_LABEL,
  REPORT_ENTRY_DETAIL_LEDGER_LABEL,
  REPORT_ENTRY_DETAIL_SNAPSHOT_NOTICE,
  REPORT_ENTRY_DETAIL_TITLE,
  REPORT_ENTRY_DETAIL_TITLE_LABEL,
  REPORT_ENTRY_DETAIL_TYPE_LABEL,
} from '../../constants/reportScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type ReportEntryDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ReportEntryDetailRouteProp = RouteProp<RootStackParamList, 'ReportEntryDetail'>;

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function ReportEntryDetailScreen() {
  const navigation = useNavigation<ReportEntryDetailNavigationProp>();
  const route = useRoute<ReportEntryDetailRouteProp>();
  const { ledgerName, entry } = route.params;

  return (
    <ScreenContainer background="secondary">
      <AppBar
        type="sub"
        title={REPORT_ENTRY_DETAIL_TITLE}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.body}>
        <Field label={REPORT_ENTRY_DETAIL_TITLE_LABEL} value={entry.title} />
        <Field
          label={REPORT_ENTRY_DETAIL_AMOUNT_LABEL}
          value={`${entry.type === 'INCOME' ? '+' : '-'}${formatWon(entry.amount)}원`}
        />
        <Field
          label={REPORT_ENTRY_DETAIL_TYPE_LABEL}
          value={entry.type === 'INCOME' ? FILTER_TYPE_INCOME : FILTER_TYPE_EXPENSE}
        />
        <Field label={REPORT_ENTRY_DETAIL_DATE_LABEL} value={formatDateDot(entry.occurredOn)} />
        <Field label={REPORT_ENTRY_DETAIL_LEDGER_LABEL} value={ledgerName} />

        <Text style={styles.notice}>{REPORT_ENTRY_DETAIL_SNAPSHOT_NOTICE}</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 20,
  },
  field: {
    gap: 4,
  },
  fieldLabel: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  fieldValue: {
    ...TYPOGRAPHY.subtitle2,
  },
  notice: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginTop: 12,
  },
});

export default ReportEntryDetailScreen;
