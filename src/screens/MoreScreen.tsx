import PlaceholderNotice from '../components/Feedback/Placeholder/PlaceholderNotice';
import { TAB_MORE_LABEL } from '../constants/mainTabScreenText';

/** 더보기 탭 임시 화면: 더보기 기능이 아직 구현되지 않아 안내 문구만 보여준다. */
function MoreScreen() {
  return <PlaceholderNotice title={TAB_MORE_LABEL} />;
}

export default MoreScreen;
