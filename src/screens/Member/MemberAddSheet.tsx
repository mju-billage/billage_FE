/** @screen DUE-3-SHEET-02-0 모임원 추가 선택 */
import { Image, Pressable, StyleSheet, Text } from 'react-native';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import {
  MEMBER_ADD_SHEET_BULK_LABEL,
  MEMBER_ADD_SHEET_INDIVIDUAL_LABEL,
  MEMBER_ADD_SHEET_TITLE,
} from '../../constants/memberScreenText';
import { FOREGROUND_PRIMARY } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const INDIVIDUAL_ICON = require('../../assets/icons/user/Member Add.png');
const BULK_ICON = require('../../assets/icons/user/Group.png');

type MemberAddSheetProps = {
  visible: boolean;
  onClose: () => void;
  onPressIndividual: () => void;
  onPressBulk: () => void;
};

/** "모임원 추가"를 누르면 뜨는 바텀시트: 개별 추가하기 / 일괄 추가하기 선택. */
function MemberAddSheet({
  visible,
  onClose,
  onPressIndividual,
  onPressBulk,
}: MemberAddSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>{MEMBER_ADD_SHEET_TITLE}</Text>
      <Pressable style={styles.row} onPress={onPressIndividual}>
        <Image source={INDIVIDUAL_ICON} style={styles.icon} />
        <Text style={styles.label}>{MEMBER_ADD_SHEET_INDIVIDUAL_LABEL}</Text>
      </Pressable>
      <Pressable style={styles.row} onPress={onPressBulk}>
        <Image source={BULK_ICON} style={styles.icon} />
        <Text style={styles.label}>{MEMBER_ADD_SHEET_BULK_LABEL}</Text>
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
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default MemberAddSheet;
