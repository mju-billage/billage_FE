import { StyleSheet, Text } from 'react-native';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import Menu from '../../components/Navigation/Menu/Menu';
import { TYPOGRAPHY } from '../../constants/typography';
import {
  ADD_GROUP_CREATE_LABEL,
  ADD_GROUP_JOIN_LABEL,
  ADD_GROUP_SHEET_TITLE,
} from '../../constants/groupManagerScreenText';

const GROUP_ICON = require('../../assets/icons/user/Group.png');
const LOCK_ICON = require('../../assets/icons/system/Lock.png');

type AddGroupSheetKey = 'create' | 'join';

type AddGroupSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (key: AddGroupSheetKey) => void;
};

function AddGroupSheet({ visible, onClose, onSelect }: AddGroupSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.sheetTitle}>{ADD_GROUP_SHEET_TITLE}</Text>
      <Menu
        sections={[
          [
            { key: 'create', label: ADD_GROUP_CREATE_LABEL, icon: GROUP_ICON },
            { key: 'join', label: ADD_GROUP_JOIN_LABEL, icon: LOCK_ICON },
          ],
        ]}
        onSelect={key => onSelect(key as AddGroupSheetKey)}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetTitle: {
    ...TYPOGRAPHY.subtitle1,
    marginBottom: 16,
  },
});

export default AddGroupSheet;
