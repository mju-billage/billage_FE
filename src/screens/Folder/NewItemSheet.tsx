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
  /** 폴더 탭 최상위(folderId=null)엔 장부를 바로 만들 API가 없다 — 반드시
   * 폴더 안에서만 생성 가능하므로(`POST /folders/{folderId}/ledgers`) 최상위에선
   * "새 장부 생성하기"를 숨긴다. */
  showLedgerOption?: boolean;
};

/** "+" 버튼을 누르면 뜨는 바텀시트: 새 장부 생성하기 / 새 폴더 생성하기 선택. */
function NewItemSheet({
  visible,
  onClose,
  onPressNewLedger,
  onPressNewFolder,
  showLedgerOption = true,
}: NewItemSheetProps) {
  const items = showLedgerOption
    ? NEW_ITEM_MENU_ITEMS
    : NEW_ITEM_MENU_ITEMS.filter(item => item.key !== 'ledger');

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Menu
        sections={[items]}
        onSelect={key => (key === 'ledger' ? onPressNewLedger() : onPressNewFolder())}
      />
    </BottomSheet>
  );
}

export default NewItemSheet;
