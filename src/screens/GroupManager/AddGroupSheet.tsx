import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import Menu from '../../components/Navigation/Menu/Menu';
import {
  ADD_GROUP_CREATE_LABEL,
  ADD_GROUP_JOIN_LABEL,
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

export default AddGroupSheet;
