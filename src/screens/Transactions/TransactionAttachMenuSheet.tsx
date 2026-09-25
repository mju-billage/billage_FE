import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import Menu from '../../components/Navigation/Menu/Menu';
import type { MenuItem } from '../../components/Navigation/Menu/Menu';
import {
  ATTACH_MENU_GALLERY_LABEL,
  ATTACH_MENU_PHOTO_LABEL,
  ATTACH_MENU_SCAN_LABEL,
} from '../../constants/transactionScreenText';

const SCAN_ICON = require('../../assets/icons/content/Ocr.png');
const CAMERA_ICON = require('../../assets/icons/content/Camera.png');
const GALLERY_ICON = require('../../assets/icons/content/Image.png');

export type AttachMenuKey = 'scan' | 'photo' | 'gallery';

const ATTACH_MENU_ITEMS: MenuItem[] = [
  { key: 'scan', label: ATTACH_MENU_SCAN_LABEL, icon: SCAN_ICON },
  { key: 'photo', label: ATTACH_MENU_PHOTO_LABEL, icon: CAMERA_ICON },
  { key: 'gallery', label: ATTACH_MENU_GALLERY_LABEL, icon: GALLERY_ICON },
];

type TransactionAttachMenuSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (key: AttachMenuKey) => void;
};

function TransactionAttachMenuSheet({
  visible,
  onClose,
  onSelect,
}: TransactionAttachMenuSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Menu
        sections={[ATTACH_MENU_ITEMS]}
        onSelect={key => onSelect(key as AttachMenuKey)}
      />
    </BottomSheet>
  );
}

export default TransactionAttachMenuSheet;
