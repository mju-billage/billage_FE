/** @screen ETC-3-SHEET-01-0 모임 추가 */
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

/** "새로운 모임 추가" 시트: 모임 생성/코드 참여 중 하나를 고른다. */
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
