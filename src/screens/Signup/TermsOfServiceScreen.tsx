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
