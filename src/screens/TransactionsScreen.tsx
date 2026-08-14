import PlaceholderNotice from '../components/Feedback/Placeholder/PlaceholderNotice';
import { TAB_TRANSACTIONS_LABEL } from '../constants/mainTabScreenText';

/** 내역 탭 임시 화면: 내역 기능이 아직 구현되지 않아 안내 문구만 보여준다. */
function TransactionsScreen() {
  return <PlaceholderNotice title={TAB_TRANSACTIONS_LABEL} />;
}

export default TransactionsScreen;
