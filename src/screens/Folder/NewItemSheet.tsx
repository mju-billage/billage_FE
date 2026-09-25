/** @screen FDR-2-SHEET-01-0 새 장부 생성 */
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import Menu from '../../components/Navigation/Menu/Menu';
import type { MenuItem } from '../../components/Navigation/Menu/Menu';
import {
  NEW_ITEM_SHEET_LEDGER_LABEL,
  NEW_ITEM_SHEET_FOLDER_LABEL,
} from '../../constants/folderScreenText';

const LEDGER_ICON = require('../../assets/icons/content/DocumentAdd.png');
const FOLDER_ICON = require('../../assets/icons/action/Folder.png');

const NEW_ITEM_MENU_ITEMS: MenuItem[] = [
  { key: 'ledger', label: NEW_ITEM_SHEET_LEDGER_LABEL, icon: LEDGER_ICON },
  { key: 'folder', label: NEW_ITEM_SHEET_FOLDER_LABEL, icon: FOLDER_ICON },
];

type NewItemSheetProps = {
  visible: boolean;
  onClose: () => void;
  onPressNewLedger: () => void;
  onPressNewFolder: () => void;
};

/** "+" 버튼을 누르면 뜨는 바텀시트: 새 장부 생성하기 / 새 폴더 생성하기 선택.
 * 최상위(폴더 없음)에서도 `POST /groups/{groupId}/ledgers`로 장부를
 * 만들 수 있어 "새 장부 생성하기"를 숨기지 않는다. */
function NewItemSheet({
  visible,
  onClose,
  onPressNewLedger,
  onPressNewFolder,
}: NewItemSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Menu
        sections={[NEW_ITEM_MENU_ITEMS]}
        onSelect={key => (key === 'ledger' ? onPressNewLedger() : onPressNewFolder())}
      />
    </BottomSheet>
  );
}

export default NewItemSheet;
