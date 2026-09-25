/** @screen ETC-5-PAGE-02-0 보관함_내역 상세 (보고서 쪽 "상세 내역 조회"와 같은 ID, 아래 주석 참고) */
/**
 * **Screen ID는 보고서 쪽(`ReportEntryDetailScreen`)과 의도적으로 같다** — 위
 * `ArchiveLedgerEntriesScreen.tsx` 주석과 같은 이유("기록 보고서 공통 로직 상속").
 * `ETC\보관함\ETC-5-PAGE-02-0.png` 크롭도 실제로 확인했다(2026-09-12) — 금액/지출일/
 * 내역명/담당자/장부/메모/증빙 자료(썸네일 2장)까지 있는 화면이다. **보고서 쪽 크롭
 * (`ETC\보고서 생성\ETC-5-PAGE-02-0.png`)도 이것과 같은 전체 항목이다**(2026-09-19
 * 육안·픽셀 확인 — 위 서술은 틀렸었다). 보고서 쪽 화면이 5필드뿐인 건 시안 차이가
 * 아니라 서버 스냅샷에 `memo`·`receipts`가 없어서다(`backend-requests.md` 2순위).
 *
 * 그래서 코드까지는 재사용하지 않았다 — 보고서 쪽 `ReportEntryDetailScreen`은 스냅샷에
 * `memo`/`receipts`가 없어 5개 필드만 보여주는 반쪽 화면인데(그 파일 상단 주석 참고),
 * 보관 스냅샷(`ArchivedEntry`)엔 실제로 `memo`/`approvalStatus`/`createdByName`/
 * `receiptFiles[]`까지 있어(2026-09-12 실호출 확인) 그 화면을 재사용하지 않고 이 화면을
 * 새로 만들었다 — 읽기 전용(수정·삭제 불가, 시안 [액션] 명시)이라 승인/삭제 액션은 없다.
 * "담당자" 라벨은 크롭 그대로다 — 실제 API엔 별도 담당자 필드가 없어 `createdByName`
 * (등록한 사람)을 이 자리에 매핑했다, Entry 도메인의 담당자(`managerUserId`) 개념과는
 * 다르다(보관 스냅샷 시점엔 등록자만 남는다).
 */
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
