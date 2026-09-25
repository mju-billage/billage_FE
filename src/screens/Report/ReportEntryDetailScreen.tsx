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
