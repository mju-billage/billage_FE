import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import BackButton from '../components/BackButton';
import AgreementCheckboxRow from '../components/AgreementCheckboxRow';
import PrimaryButton from '../components/PrimaryButton';

type TermsAgreementNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TermsAgreement'
>;

type Agreements = {
  service: boolean;
  privacy: boolean;
  marketing: boolean;
  age: boolean;
};

const INITIAL_AGREEMENTS: Agreements = {
  service: false,
  privacy: false,
  marketing: false,
  age: false,
};

/** 약관 동의 화면: 전체 동의 및 개별 약관 체크박스를 보여준다. */
function TermsAgreementScreen() {
  const navigation = useNavigation<TermsAgreementNavigationProp>();
  const [agreements, setAgreements] = useState<Agreements>(INITIAL_AGREEMENTS);

  const allChecked = Object.values(agreements).every(Boolean);
  const canProceed = agreements.service && agreements.privacy && agreements.age;

  const toggleAll = () => {
    const next = !allChecked;
    setAgreements({
      service: next,
      privacy: next,
      marketing: next,
      age: next,
    });
  };

  const toggleField = (field: keyof Agreements) => {
    setAgreements(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleNext = () => {
    navigation.navigate('SignupInfo');
  };

  return (
    <View style={styles.container}>
      <View style={styles.backRow}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>
      <Text style={styles.title}>약관 동의</Text>

      <View style={styles.list}>
        <AgreementCheckboxRow
          label="전체 동의"
          checked={allChecked}
          onToggle={toggleAll}
          emphasized
        />
        <View style={styles.divider} />
        <AgreementCheckboxRow
          label="서비스 이용 약관"
          tag="필수"
          checked={agreements.service}
          onToggle={() => toggleField('service')}
          onPressDetail={() => navigation.navigate('TermsOfService')}
        />
        <AgreementCheckboxRow
          label="개인정보 수집 및 이용에 대한 동의"
          tag="필수"
          checked={agreements.privacy}
          onToggle={() => toggleField('privacy')}
          onPressDetail={() => navigation.navigate('PrivacyPolicy')}
        />
        <AgreementCheckboxRow
          label="마케팅 정보 수신 동의"
          tag="선택"
          checked={agreements.marketing}
          onToggle={() => toggleField('marketing')}
          onPressDetail={() => navigation.navigate('MarketingConsent')}
        />
        <AgreementCheckboxRow
          label="만 14세 이상 회원입니다."
          tag="필수"
          checked={agreements.age}
          onToggle={() => toggleField('age')}
        />
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="다음으로"
          onPress={handleNext}
          disabled={!canProceed}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  backRow: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  list: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#E9ECEF',
    marginVertical: 8,
  },
  footer: {
    paddingBottom: 24,
  },
});

export default TermsAgreementScreen;
