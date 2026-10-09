import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import BackButton from '../../components/Navigation/App bar/BackButton';
import Button from '../../components/Input/Button/Button';
import TextField from '../../components/Input/Text Field/TextField';
import ScreenContainer from '../../components/Layout/ScreenContainer';
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
  GROUP_PROFILE_EDIT_NAME_MAX_LENGTH,
  SNACKBAR_GROUP_CREATED_SUFFIX,
} from '../../constants/groupManagerScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type GroupCreateNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GroupCreate'
>;

function GroupCreateScreen() {
  const navigation = useNavigation<GroupCreateNavigationProp>();
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || isSubmitting) {
      return;
    }
    setNameError(undefined);
    setIsSubmitting(true);
    try {
      await groupService.createGroup({ name: trimmedName });
      navigation.reset({
        index: 1,
        routes: [
          { name: 'Main', params: { screen: 'More' } },
          {
            name: 'AllGroups',
            params: {
              snackbarMessage: `'${trimmedName}'${SNACKBAR_GROUP_CREATED_SUFFIX}`,
            },
          },
        ],
      });
    } catch (error) {
      if (isNetworkError(error)) {
        setNameError(API_NETWORK_ERROR_MESSAGE);
      } else if (error instanceof ApiError) {
        const nameFieldError = error.fieldErrors.find(
          fieldError => fieldError.field === 'name',
        );
        setNameError(nameFieldError?.reason ?? getApiErrorMessage(error.code, error.message));
      } else {
        setNameError(API_ERROR_DEFAULT_MESSAGE);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer background="secondary" edges={['bottom']} style={styles.container}>
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
          maxLength={GROUP_PROFILE_EDIT_NAME_MAX_LENGTH}
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
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
});

export default GroupCreateScreen;
