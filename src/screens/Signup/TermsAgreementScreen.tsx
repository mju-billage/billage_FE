import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import BackButton from '../../components/Navigation/App bar/BackButton';
import AgreementCheckboxRow from '../../components/Input/Control/AgreementCheckboxRow';
import Divider from '../../components/Data Display/Divider/Divider';
import Button from '../../components/Input/Button/Button';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { TYPOGRAPHY } from '../../constants/typography';
import {
  TERMS_AGREEMENT_TITLE,
  AGREE_ALL_LABEL,
  AGREE_SERVICE_LABEL,
  AGREE_PRIVACY_LABEL,
  AGREE_MARKETING_LABEL,
  AGREE_AGE_LABEL,
} from '../../constants/termsAgreementScreenText';
import {
  NEXT_BUTTON_LABEL,
  AGREEMENT_TAG_REQUIRED,
  AGREEMENT_TAG_OPTIONAL,
} from '../../constants/commonText';

type TermsAgreementNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TermsAgreement'
>;

type TermsAgreementRouteProp = RouteProp<RootStackParamList, 'TermsAgreement'>;

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

function TermsAgreementScreen() {
  const navigation = useNavigation<TermsAgreementNavigationProp>();
  const socialProfile = useRoute<TermsAgreementRouteProp>().params?.socialProfile;
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
    const signupAgreements = {
      termsOfService: agreements.service,
      privacyPolicy: agreements.privacy,
      ageOver14: agreements.age,
      marketing: agreements.marketing,
    };
    if (socialProfile) {
      navigation.navigate('SocialSignupInfo', { profile: socialProfile, agreements: signupAgreements });
      return;
    }
    navigation.navigate('SignupInfo', { agreements: signupAgreements });
  };

  return (
    <ScreenContainer background="secondary" edges={['bottom']} style={styles.container}>
      <View style={styles.backRow}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>
      <Text style={styles.title}>{TERMS_AGREEMENT_TITLE}</Text>

      <View style={styles.list}>
        <AgreementCheckboxRow
          label={AGREE_ALL_LABEL}
          checked={allChecked}
          onToggle={toggleAll}
          emphasized
        />
        <View style={styles.dividerWrapper}>
          <Divider />
        </View>
        <AgreementCheckboxRow
          label={AGREE_SERVICE_LABEL}
          tag={AGREEMENT_TAG_REQUIRED}
          checked={agreements.service}
          onToggle={() => toggleField('service')}
          onPressDetail={() => navigation.navigate('TermsOfService')}
        />
        <AgreementCheckboxRow
          label={AGREE_PRIVACY_LABEL}
          tag={AGREEMENT_TAG_REQUIRED}
          checked={agreements.privacy}
          onToggle={() => toggleField('privacy')}
          onPressDetail={() => navigation.navigate('PrivacyPolicy')}
        />
        <AgreementCheckboxRow
          label={AGREE_MARKETING_LABEL}
          tag={AGREEMENT_TAG_OPTIONAL}
          checked={agreements.marketing}
          onToggle={() => toggleField('marketing')}
          onPressDetail={() => navigation.navigate('MarketingConsent')}
        />
        <AgreementCheckboxRow
          label={AGREE_AGE_LABEL}
          tag={AGREEMENT_TAG_REQUIRED}
          checked={agreements.age}
          onToggle={() => toggleField('age')}
        />
      </View>

      <View style={styles.footer}>
        <Button
          label={NEXT_BUTTON_LABEL}
          onPress={handleNext}
          fullWidth
          disabled={!canProceed}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backRow: {
    marginBottom: 16,
  },
  title: {
    ...TYPOGRAPHY.h1,
    marginBottom: 24,
  },
  list: {
    flex: 1,
  },
  dividerWrapper: {
    marginVertical: 8,
  },
  footer: {
    paddingBottom: 24,
  },
});

export default TermsAgreementScreen;
