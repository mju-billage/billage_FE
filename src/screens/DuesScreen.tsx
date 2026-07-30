import PlaceholderNotice from '../components/PlaceholderNotice';
import { TAB_DUES_LABEL } from '../constants/mainTabScreenText';

/** 납부관리 탭 임시 화면: 납부관리 기능이 아직 구현되지 않아 안내 문구만 보여준다. */
function DuesScreen() {
  return <PlaceholderNotice title={TAB_DUES_LABEL} />;
}

export default DuesScreen;
