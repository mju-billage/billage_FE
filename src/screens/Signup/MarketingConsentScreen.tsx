/** @screen COM-3-PAGE-01-0 약관 상세 (마케팅 정보 수신 동의) */
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

/** 마케팅 정보 수신 동의 전문을 보여주는 상세 화면. */
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
