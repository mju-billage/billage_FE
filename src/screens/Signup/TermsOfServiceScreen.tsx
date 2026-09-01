/** @screen COM-3-PAGE-01-0 약관 상세 (서비스 이용 약관) */
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import LegalDocumentView from '../../components/Data Display/Legal Document/LegalDocumentView';
import {
  TERMS_OF_SERVICE_TEXT,
  TERMS_OF_SERVICE_TITLE,
} from '../../constants/terms';

type TermsOfServiceNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TermsOfService'
>;

/** 서비스 이용 약관 전문을 보여주는 상세 화면. */
function TermsOfServiceScreen() {
  const navigation = useNavigation<TermsOfServiceNavigationProp>();
  return (
    <LegalDocumentView
      title={TERMS_OF_SERVICE_TITLE}
      bodyText={TERMS_OF_SERVICE_TEXT}
      onPressBack={() => navigation.goBack()}
    />
  );
}

export default TermsOfServiceScreen;
