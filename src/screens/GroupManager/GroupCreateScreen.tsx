/** @screen ETC-4-PAGE-01-0 새 모임 생성 */
/** @screen ETC-5-SNACKBAR-04-0 모임 생성 완료 */
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import BackButton from '../../components/Navigation/App bar/BackButton';
import Button from '../../components/Input/Button/Button';
import TextField from '../../components/Input/Text Field/TextField';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import * as groupService from '../../services/groupService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  GROUP_CREATE_SUBTITLE,
  GROUP_CREATE_SUBMIT_LABEL,
  GROUP_CREATE_TITLE,
  GROUP_NAME_LABEL,
  GROUP_NAME_PLACEHOLDER,
  SNACKBAR_GROUP_CREATED_SUFFIX,
} from '../../constants/groupManagerScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const SNACKBAR_AUTO_HIDE_MS = 1600;

type GroupCreateNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GroupCreate'
>;

/** "모임 생성하기": 모임 이름만 입력받아 새 모임을 만든다. */
function GroupCreateScreen() {
  const navigation = useNavigation<GroupCreateNavigationProp>();
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || isSubmitting) {
      return;
    }
    setNameError(undefined);
    setIsSubmitting(true);
    try {
      await groupService.createGroup({ name: trimmedName });
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.navigate('Main', { screen: 'More' });
      }, SNACKBAR_AUTO_HIDE_MS);
    } catch (error) {
      if (isNetworkError(error)) {
        setNameError(API_NETWORK_ERROR_MESSAGE);
      } else if (error instanceof ApiError) {
        const nameFieldError = error.fieldErrors.find(
          fieldError => fieldError.field === 'name',
        );
        setNameError(nameFieldError?.reason ?? getApiErrorMessage(error.code));
      } else {
        setNameError(API_ERROR_DEFAULT_MESSAGE);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>

      <Text style={styles.title}>{GROUP_CREATE_TITLE}</Text>
      <Text style={styles.subtitle}>{GROUP_CREATE_SUBTITLE}</Text>

      <View style={styles.form}>
        <TextField
          label={GROUP_NAME_LABEL}
          value={name}
          onChangeText={text => {
            setName(text);
            setNameError(undefined);
          }}
          placeholder={GROUP_NAME_PLACEHOLDER}
          error={nameError}
        />
      </View>

      <View style={styles.footer}>
        <Button
          label={GROUP_CREATE_SUBMIT_LABEL}
          disabled={!name.trim() || isSubmitting}
          fullWidth
          onPress={handleSubmit}
        />
      </View>

      {snackbarVisible && (
        <View style={styles.snackbarWrapper}>
          <Snackbar
            visible
            title={`'${name.trim()}'${SNACKBAR_GROUP_CREATED_SUFFIX}`}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  headerRow: {
    marginBottom: 8,
  },
  title: {
    ...TYPOGRAPHY.h1,
  },
  subtitle: {
    marginTop: 6,
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  form: {
    marginTop: 32,
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: 16,
  },
  snackbarWrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 88,
  },
});

export default GroupCreateScreen;
