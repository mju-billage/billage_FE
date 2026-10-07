import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import CardBase from '../../components/Data Display/Card/CardBase';
import {
  TERMS_LIST_AUTO_RECORD_LABEL,
  TERMS_LIST_PRIVACY_LABEL,
  TERMS_LIST_SERVICE_LABEL,
  TERMS_LIST_TITLE,
} from '../../constants/settingsScreenText';
import { TYPOGRAPHY } from '../../constants/typography';

type TermsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Terms'>;

function TermsScreen() {
  const navigation = useNavigation<TermsNavigationProp>();

  const navigateToTerm = (termType: 'SERVICE' | 'PRIVACY' | 'AUTO_RECORD', title: string) => {
    navigation.navigate('TermDetail', { termType, title });
  };

  return (
    <ScreenContainer background="primary" style={styles.container}>
      <AppBar type="sub" title={TERMS_LIST_TITLE} onBackPress={() => navigation.goBack()} />
      <CardBase
        style={styles.card}
        onPress={() => navigateToTerm('SERVICE', TERMS_LIST_SERVICE_LABEL)}
      >
        <Text style={styles.cardLabel}>{TERMS_LIST_SERVICE_LABEL}</Text>
      </CardBase>
      <CardBase
        style={styles.card}
        onPress={() => navigateToTerm('PRIVACY', TERMS_LIST_PRIVACY_LABEL)}
      >
        <Text style={styles.cardLabel}>{TERMS_LIST_PRIVACY_LABEL}</Text>
      </CardBase>
      <CardBase
        style={styles.card}
        onPress={() => navigateToTerm('AUTO_RECORD', TERMS_LIST_AUTO_RECORD_LABEL)}
      >
        <Text style={styles.cardLabel}>{TERMS_LIST_AUTO_RECORD_LABEL}</Text>
      </CardBase>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 12,
  },
  card: {
    paddingVertical: 20,
  },
  cardLabel: {
    ...TYPOGRAPHY.subtitle2,
  },
});

export default TermsScreen;
