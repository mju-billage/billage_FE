/** @screen ETC-3-SHEET-05-0 보고서 생성하기 */
import { Image, Pressable, StyleSheet, Text } from 'react-native';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import {
  REPORT_CREATE_SHEET_BY_LEDGER_LABEL,
  REPORT_CREATE_SHEET_BY_PERIOD_LABEL,
  REPORT_CREATE_SHEET_TITLE,
} from '../../constants/reportScreenText';
import { FOREGROUND_PRIMARY } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const BY_LEDGER_ICON = require('../../assets/icons/content/Report.png');
const BY_PERIOD_ICON = require('../../assets/icons/system/Calendar.png');

type ReportCreateSheetProps = {
  visible: boolean;
  onClose: () => void;
  onPressByLedger: () => void;
  onPressByPeriod: () => void;
};

/** "보고서 생성" +버튼을 누르면 뜨는 바텀시트: 장부별/기간별 생성 선택. */
function ReportCreateSheet({
  visible,
  onClose,
  onPressByLedger,
  onPressByPeriod,
}: ReportCreateSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>{REPORT_CREATE_SHEET_TITLE}</Text>
      <Pressable style={styles.row} onPress={onPressByLedger}>
        <Image source={BY_LEDGER_ICON} style={styles.icon} />
        <Text style={styles.label}>{REPORT_CREATE_SHEET_BY_LEDGER_LABEL}</Text>
      </Pressable>
      <Pressable style={styles.row} onPress={onPressByPeriod}>
        <Image source={BY_PERIOD_ICON} style={styles.icon} />
        <Text style={styles.label}>{REPORT_CREATE_SHEET_BY_PERIOD_LABEL}</Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    ...TYPOGRAPHY.subtitle1,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: FOREGROUND_PRIMARY,
  },
  label: {
    ...TYPOGRAPHY.body1,
    fontWeight: 'bold',
  },
});

export default ReportCreateSheet;
