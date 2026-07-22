import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import BackButton from '../components/BackButton';
import { PRIVACY_POLICY_TEXT } from '../constants/terms';

type PrivacyPolicyNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PrivacyPolicy'
>;

/** 개인정보 처리방침 전문을 보여주는 상세 화면. */
function PrivacyPolicyScreen() {
  const navigation = useNavigation<PrivacyPolicyNavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.title}>개인정보 처리 방침</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.body}>{PRIVACY_POLICY_TEXT}</Text>
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

export default PrivacyPolicyScreen;
