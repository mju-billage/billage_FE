import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import LegalDocumentView from '../components/LegalDocumentView';
import { PRIVACY_POLICY_TEXT, PRIVACY_POLICY_TITLE } from '../constants/terms';

type PrivacyPolicyNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PrivacyPolicy'
>;

/** 개인정보 처리방침 전문을 보여주는 상세 화면. */
function PrivacyPolicyScreen() {
  const navigation = useNavigation<PrivacyPolicyNavigationProp>();
  return (
    <LegalDocumentView
      title={PRIVACY_POLICY_TITLE}
      bodyText={PRIVACY_POLICY_TEXT}
      onPressBack={() => navigation.goBack()}
    />
  );
}

export default PrivacyPolicyScreen;
