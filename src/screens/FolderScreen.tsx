import PlaceholderNotice from '../components/PlaceholderNotice';
import { TAB_FOLDER_LABEL } from '../constants/mainTabScreenText';

/** 폴더 탭 임시 화면: 폴더 기능이 아직 구현되지 않아 안내 문구만 보여준다. */
function FolderScreen() {
  return <PlaceholderNotice title={TAB_FOLDER_LABEL} />;
}

export default FolderScreen;
