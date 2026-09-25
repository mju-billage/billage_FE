import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import Thumbnail from '../../components/Data Display/Image Placeholder/Thumbnail';
import { buildAuthenticatedImageSource } from '../../utils/authenticatedImage';
import { formatWon } from '../../utils/currency';
import { formatDateDot } from '../../utils/dueDate';
import {
  FILTER_TYPE_EXPENSE,
  FILTER_TYPE_INCOME,
} from '../../constants/ledgerScreenText';
import {
  ARCHIVE_ENTRY_DETAIL_AMOUNT_LABEL,
  ARCHIVE_ENTRY_DETAIL_CREATOR_LABEL,
  ARCHIVE_ENTRY_DETAIL_DATE_LABEL,
  ARCHIVE_ENTRY_DETAIL_LEDGER_LABEL,
  ARCHIVE_ENTRY_DETAIL_MEMO_LABEL,
  ARCHIVE_ENTRY_DETAIL_MEMO_PLACEHOLDER,
  ARCHIVE_ENTRY_DETAIL_RECEIPT_LABEL,
  ARCHIVE_ENTRY_DETAIL_TITLE,
  ARCHIVE_ENTRY_DETAIL_TITLE_LABEL,
  ARCHIVE_ENTRY_DETAIL_TYPE_LABEL,
} from '../../constants/archiveScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type ArchiveEntryDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ArchiveEntryDetailRouteProp = RouteProp<RootStackParamList, 'ArchiveEntryDetail'>;

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function ArchiveEntryDetailScreen() {
  const navigation = useNavigation<ArchiveEntryDetailNavigationProp>();
  const route = useRoute<ArchiveEntryDetailRouteProp>();
  const { ledgerName, entry } = route.params;

  return (
    <ScreenContainer background="secondary">
      <AppBar
        type="sub"
        title={ARCHIVE_ENTRY_DETAIL_TITLE}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.body}>
        <Field label={ARCHIVE_ENTRY_DETAIL_TITLE_LABEL} value={entry.title} />
        <Field
          label={ARCHIVE_ENTRY_DETAIL_AMOUNT_LABEL}
          value={`${entry.type === 'INCOME' ? '+' : '-'}${formatWon(entry.amount)}원`}
        />
        <Field
          label={ARCHIVE_ENTRY_DETAIL_TYPE_LABEL}
          value={entry.type === 'INCOME' ? FILTER_TYPE_INCOME : FILTER_TYPE_EXPENSE}
        />
        <Field label={ARCHIVE_ENTRY_DETAIL_DATE_LABEL} value={formatDateDot(entry.occurredOn)} />
        <Field label={ARCHIVE_ENTRY_DETAIL_LEDGER_LABEL} value={ledgerName} />
        <Field label={ARCHIVE_ENTRY_DETAIL_CREATOR_LABEL} value={entry.createdByName} />
        <Field
          label={ARCHIVE_ENTRY_DETAIL_MEMO_LABEL}
          value={entry.memo || ARCHIVE_ENTRY_DETAIL_MEMO_PLACEHOLDER}
        />

        {entry.receiptFiles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{ARCHIVE_ENTRY_DETAIL_RECEIPT_LABEL}</Text>
            <View style={styles.thumbnailRow}>
              {entry.receiptFiles.map(file => {
                const source = buildAuthenticatedImageSource(file.fileUrl);
                return (
                  <Pressable
                    key={file.fileId}
                    onPress={() =>
                      navigation.navigate('TransactionReceiptDetail', { fileUrl: file.fileUrl })
                    }
                  >
                    <Thumbnail imageUri={source.uri} imageHeaders={source.headers} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
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
  section: {
    gap: 8,
  },
  sectionLabel: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  thumbnailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});

export default ArchiveEntryDetailScreen;
