import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import LegalDocumentView from '../../components/Data Display/Legal Document/LegalDocumentView';
import {
  MARKETING_CONSENT_TEXT,
  MARKETING_CONSENT_TITLE,
} from '../../constants/terms';

type MarketingConsentNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MarketingConsent'
>;

function MarketingConsentScreen() {
  const navigation = useNavigation<MarketingConsentNavigationProp>();
  return (
    <LegalDocumentView
      title={MARKETING_CONSENT_TITLE}
      bodyText={MARKETING_CONSENT_TEXT}
      onPressBack={() => navigation.goBack()}
    />
  );
}

export default MarketingConsentScreen;
