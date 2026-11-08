import { useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import Button from '../../components/Input/Button/Button';
import TextArea from '../../components/Input/Text Field/TextArea';
import {
  DUES_REQUEST_PLACEHOLDER,
  DUES_REQUEST_SUBMIT_LABEL,
  DUES_REQUEST_TITLE,
} from '../../constants/duesScreenText';

type DuesRequestNavigationProp = NativeStackNavigationProp<RootStackParamList>;

function DuesRequestScreen() {
  const navigation = useNavigation<DuesRequestNavigationProp>();
  const [message, setMessage] = useState('');

  const hasInput = message.length > 0;

  const handleSubmit = () => {
    if (!hasInput) {
      return;
    }
    Share.share({ message });
  };

  return (
    <ScreenContainer background="primary" avoidKeyboard={false}>
      <AppBar type="sub" title={DUES_REQUEST_TITLE} onBackPress={() => navigation.goBack()} />

      <View style={styles.body}>
        <TextArea
          value={message}
          onChangeText={setMessage}
          placeholder={DUES_REQUEST_PLACEHOLDER}
          rows={10}
          autoFocus
          filled
        />
      </View>

      <View style={styles.footer}>
        <Button
          label={DUES_REQUEST_SUBMIT_LABEL}
          onPress={handleSubmit}
          disabled={!hasInput}
          fullWidth
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
});

export default DuesRequestScreen;
