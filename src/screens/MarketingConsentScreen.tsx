import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import BackButton from '../components/BackButton';
import { MARKETING_CONSENT_TEXT } from '../constants/terms';

type MarketingConsentNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MarketingConsent'
>;

/** 마케팅 정보 수신 동의 전문을 보여주는 상세 화면. */
function MarketingConsentScreen() {
  const navigation = useNavigation<MarketingConsentNavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.title}>마케팅 정보 수신 동의</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.body}>{MARKETING_CONSENT_TEXT}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
    color: '#495057',
  },
});

export default MarketingConsentScreen;
