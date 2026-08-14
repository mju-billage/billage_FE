import { Image, Pressable, StyleSheet, Text } from 'react-native';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import {
  NEW_ITEM_SHEET_LEDGER_LABEL,
  NEW_ITEM_SHEET_FOLDER_LABEL,
} from '../../constants/folderScreenText';
import { FOREGROUND_PRIMARY } from '../../constants/colors';

const LEDGER_ICON = require('../../assets/icons/content/DocumentAdd.png');
const FOLDER_ICON = require('../../assets/icons/action/Folder.png');

type NewItemSheetProps = {
  visible: boolean;
  onClose: () => void;
  onPressNewLedger: () => void;
  onPressNewFolder: () => void;
};

/** "+" 버튼을 누르면 뜨는 바텀시트: 새 장부 생성하기 / 새 폴더 생성하기 선택. */
function NewItemSheet({
  visible,
  onClose,
  onPressNewLedger,
  onPressNewFolder,
}: NewItemSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Pressable style={styles.row} onPress={onPressNewLedger}>
        <Image source={LEDGER_ICON} style={styles.icon} />
        <Text style={styles.label}>{NEW_ITEM_SHEET_LEDGER_LABEL}</Text>
      </Pressable>
      <Pressable style={styles.row} onPress={onPressNewFolder}>
        <Image source={FOLDER_ICON} style={styles.icon} />
        <Text style={styles.label}>{NEW_ITEM_SHEET_FOLDER_LABEL}</Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
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

export default NewItemSheet;
