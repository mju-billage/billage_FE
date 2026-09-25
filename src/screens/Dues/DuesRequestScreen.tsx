import { useCallback, useState } from 'react';
import { BackHandler, Share, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import Button from '../../components/Input/Button/Button';
import TextArea from '../../components/Input/Text Field/TextArea';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import {
  DUES_CREATE_LEAVE_CONFIRM_LABEL,
  DUES_REQUEST_LEAVE_DESCRIPTION,
  DUES_REQUEST_LEAVE_TITLE,
  DUES_REQUEST_PLACEHOLDER,
  DUES_REQUEST_SUBMIT_LABEL,
  DUES_REQUEST_TITLE,
} from '../../constants/duesScreenText';

type DuesRequestNavigationProp = NativeStackNavigationProp<RootStackParamList>;

function DuesRequestScreen() {
  const navigation = useNavigation<DuesRequestNavigationProp>();
  const [message, setMessage] = useState('');
  const [leaveDialogVisible, setLeaveDialogVisible] = useState(false);

  const hasInput = message.length > 0;

  const handleBack = () => {
    if (hasInput) {
      setLeaveDialogVisible(true);
    } else {
      navigation.goBack();
    }
  };

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (hasInput) {
          setLeaveDialogVisible(true);
          return true;
        }
        return false;
      });
      return () => subscription.remove();
    }, [hasInput]),
  );

  const handleSubmit = () => {
    if (!hasInput) {
      return;
    }
    Share.share({ message });
  };

  return (
    <ScreenContainer background="primary">
      <AppBar type="sub" title={DUES_REQUEST_TITLE} onBackPress={handleBack} />

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

      <Dialog
        visible={leaveDialogVisible}
        title={DUES_REQUEST_LEAVE_TITLE}
        description={DUES_REQUEST_LEAVE_DESCRIPTION}
        confirmLabel={DUES_CREATE_LEAVE_CONFIRM_LABEL}
        destructive
        onCancel={() => setLeaveDialogVisible(false)}
        onConfirm={() => {
          setLeaveDialogVisible(false);
          navigation.goBack();
        }}
      />
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
