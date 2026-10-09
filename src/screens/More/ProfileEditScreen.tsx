import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Avatar from '../../components/Data Display/Avatar/Avatar';
import Button from '../../components/Input/Button/Button';
import TextField from '../../components/Input/Text Field/TextField';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import Menu from '../../components/Navigation/Menu/Menu';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import GroupImagePickerScreen from '../GroupManager/GroupImagePickerScreen';
import { captureWithFeedback, type PickedImage } from '../../utils/imagePicker';
import * as fileService from '../../services/fileService';
import { getCurrentUser } from '../../types/session';
import * as authService from '../../services/authService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
  toUserErrorMessage,
} from '../../constants/apiErrorMessages';
import {
  PROFILE_EDIT_LEAVE_CANCEL_LABEL,
  PROFILE_EDIT_LEAVE_CONFIRM_LABEL,
  PROFILE_EDIT_LEAVE_DESCRIPTION,
  PROFILE_EDIT_LEAVE_TITLE,
  PROFILE_EDIT_NAME_LABEL,
  PROFILE_EDIT_NAME_MAX_LENGTH,
  PROFILE_EDIT_SUBMIT_LABEL,
  PROFILE_EDIT_TITLE,
  PROFILE_IMAGE_SHEET_CAMERA_LABEL,
  PROFILE_IMAGE_SHEET_GALLERY_LABEL,
  PROFILE_IMAGE_SHEET_RESET_LABEL,
  SNACKBAR_PROFILE_UPDATED,
} from '../../constants/settingsScreenText';
import {
  CAMERA_PERMISSION_DIALOG_DESCRIPTION,
  CAMERA_PERMISSION_DIALOG_TITLE,
  GALLERY_PERMISSION_DIALOG_DESCRIPTION,
  GALLERY_PERMISSION_DIALOG_TITLE,
  PERMISSION_DIALOG_CANCEL_LABEL,
  PERMISSION_SETTINGS_BUTTON_LABEL,
  SNACKBAR_IMAGE_TOO_LARGE,
  SNACKBAR_IMAGE_UPLOAD_FAILED,
} from '../../constants/commonText';
import { FOREGROUND_INVERSE, NAVY_800, OVERLAY_SCRIM } from '../../constants/colors';

const CAMERA_ICON = require('../../assets/icons/content/Camera.png');
const GALLERY_ICON = require('../../assets/icons/content/Image.png');
const RESET_ICON = require('../../assets/icons/user/User.png');

type ProfileEditNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProfileEdit'
>;

type Stage = 'form' | 'imagePicker';

const SNACKBAR_AUTO_HIDE_MS = 1600;
type ImageAction = 'none' | 'reset' | 'uploaded';
type PermissionDialogKind = 'camera' | 'gallery' | null;

function ProfileEditScreen() {
  const navigation = useNavigation<ProfileEditNavigationProp>();
  const user = getCurrentUser();
  const [name, setName] = useState(user?.name ?? '');
  const [nameError, setNameError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stage, setStage] = useState<Stage>('form');
  const [imageMenuVisible, setImageMenuVisible] = useState(false);
  const [imageAction, setImageAction] = useState<ImageAction>('none');
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [leaveDialogVisible, setLeaveDialogVisible] = useState(false);
  const [permissionDialogKind, setPermissionDialogKind] =
    useState<PermissionDialogKind>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(null), SNACKBAR_AUTO_HIDE_MS);
  };

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !isSubmitting && !isUploadingImage;
  const hasChanges = trimmedName !== (user?.name ?? '') || imageAction !== 'none';
  const hasCustomImage =
    imageAction === 'uploaded' ||
    (imageAction === 'none' && !!user?.profileImageUrl);

  const handleBack = () => {
    if (hasChanges) {
      setLeaveDialogVisible(true);
    } else {
      navigation.goBack();
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (stage !== 'form') {
        return undefined;
      }
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (hasChanges) {
            setLeaveDialogVisible(true);
            return true;
          }
          return false;
        },
      );
      return () => subscription.remove();
    }, [stage, hasChanges]),
  );

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }
    setNameError(undefined);
    setIsSubmitting(true);
    try {
      const payload: authService.UpdateProfileInput = {};
      if (trimmedName !== (user?.name ?? '')) {
        payload.name = trimmedName;
      }
      if (imageAction === 'reset') {
        payload.profileImageFileId = null;
      } else if (imageAction === 'uploaded' && uploadedFileId !== null) {
        payload.profileImageFileId = uploadedFileId;
      }
      if (Object.keys(payload).length > 0) {
        await authService.updateMyProfile(payload);
      }
      navigation.navigate('MyProfile', {
        snackbarMessage: SNACKBAR_PROFILE_UPDATED,
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

  const handleImagePicked = async (image: PickedImage) => {
    if (image.size !== undefined && image.size > fileService.MAX_UPLOAD_FILE_SIZE_BYTES) {
      showSnackbar(SNACKBAR_IMAGE_TOO_LARGE);
      return;
    }
    setPreviewUri(image.uri);
    setIsUploadingImage(true);
    try {
      const uploaded = await fileService.uploadFile(
        image.uri,
        image.fileName,
        image.type,
        'PROFILE_IMAGE',
      );
      setUploadedFileId(Number(uploaded.id));
      setImageAction('uploaded');
    } catch (error) {
      setPreviewUri(null);
      showSnackbar(toUserErrorMessage(error, SNACKBAR_IMAGE_UPLOAD_FAILED));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleTakePhoto = async () => {
    const image = await captureWithFeedback(showSnackbar, () =>
      setPermissionDialogKind('camera'),
    );
    if (image) {
      await handleImagePicked(image);
    }
  };

  if (stage === 'imagePicker') {
    return (
      <GroupImagePickerScreen
        onBack={() => setStage('form')}
        onMessage={showSnackbar}
        onPermanentlyDenied={() => setPermissionDialogKind('gallery')}
        onPicked={image => {
          setStage('form');
          handleImagePicked(image);
        }}
      />
    );
  }

  return (
    <ScreenContainer
      background="secondary"
      snackbar={
        snackbarMessage ? <Snackbar visible title={snackbarMessage} /> : undefined
      }
    >
      <AppBar type="sub" title={PROFILE_EDIT_TITLE} onBackPress={handleBack} />

      <View style={styles.body}>
        <Pressable
          style={styles.avatarRow}
          onPress={() => setImageMenuVisible(true)}
          disabled={isUploadingImage}
        >
          <Avatar
            type={hasCustomImage ? 'image' : 'icon'}
            imageUri={
              previewUri ?? (imageAction === 'none' ? user?.profileImageUrl ?? '' : '')
            }
            size="lg"
          />
          {isUploadingImage ? (
            <View style={styles.avatarUploadingOverlay}>
              <ActivityIndicator color={FOREGROUND_INVERSE} />
            </View>
          ) : (
            <View style={styles.cameraBadge}>
              <Image source={CAMERA_ICON} style={styles.cameraBadgeIcon} />
            </View>
          )}
        </Pressable>

        <TextField
          label={PROFILE_EDIT_NAME_LABEL}
          value={name}
          onChangeText={text => {
            setName(text);
            setNameError(undefined);
          }}
          onClear={() => setName('')}
          placeholder={PROFILE_EDIT_NAME_LABEL}
          maxLength={PROFILE_EDIT_NAME_MAX_LENGTH}
          error={nameError}
        />
      </View>

      <View style={styles.footer}>
        <Button
          label={PROFILE_EDIT_SUBMIT_LABEL}
          onPress={handleSubmit}
          disabled={!canSubmit}
          fullWidth
        />
      </View>

      <BottomSheet
        visible={imageMenuVisible}
        onClose={() => setImageMenuVisible(false)}
      >
        <Menu
          sections={[
            [
              {
                key: 'camera',
                label: PROFILE_IMAGE_SHEET_CAMERA_LABEL,
                icon: CAMERA_ICON,
              },
              {
                key: 'gallery',
                label: PROFILE_IMAGE_SHEET_GALLERY_LABEL,
                icon: GALLERY_ICON,
              },
              ...(hasCustomImage
                ? [
                    {
                      key: 'reset',
                      label: PROFILE_IMAGE_SHEET_RESET_LABEL,
                      icon: RESET_ICON,
                      destructive: true,
                    },
                  ]
                : []),
            ],
          ]}
          onSelect={key => {
            setImageMenuVisible(false);
            if (key === 'camera') {
              handleTakePhoto();
            } else if (key === 'gallery') {
              setStage('imagePicker');
            } else if (key === 'reset') {
              setPreviewUri(null);
              setUploadedFileId(null);
              setImageAction('reset');
            }
          }}
        />
      </BottomSheet>

      <Dialog
        visible={leaveDialogVisible}
        title={PROFILE_EDIT_LEAVE_TITLE}
        description={PROFILE_EDIT_LEAVE_DESCRIPTION}
        cancelLabel={PROFILE_EDIT_LEAVE_CANCEL_LABEL}
        confirmLabel={PROFILE_EDIT_LEAVE_CONFIRM_LABEL}
        destructive
        onCancel={() => setLeaveDialogVisible(false)}
        onConfirm={() => {
          setLeaveDialogVisible(false);
          navigation.goBack();
        }}
      />
      <Dialog
        visible={permissionDialogKind === 'camera'}
        title={CAMERA_PERMISSION_DIALOG_TITLE}
        description={CAMERA_PERMISSION_DIALOG_DESCRIPTION}
        cancelLabel={PERMISSION_DIALOG_CANCEL_LABEL}
        confirmLabel={PERMISSION_SETTINGS_BUTTON_LABEL}
        onCancel={() => setPermissionDialogKind(null)}
        onConfirm={() => {
          setPermissionDialogKind(null);
          Linking.openSettings();
        }}
      />
      <Dialog
        visible={permissionDialogKind === 'gallery'}
        title={GALLERY_PERMISSION_DIALOG_TITLE}
        description={GALLERY_PERMISSION_DIALOG_DESCRIPTION}
        cancelLabel={PERMISSION_DIALOG_CANCEL_LABEL}
        confirmLabel={PERMISSION_SETTINGS_BUTTON_LABEL}
        onCancel={() => setPermissionDialogKind(null)}
        onConfirm={() => {
          setPermissionDialogKind(null);
          Linking.openSettings();
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  avatarRow: {
    alignSelf: 'center',
    marginBottom: 32,
  },
  cameraBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: NAVY_800,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: FOREGROUND_INVERSE,
  },
  cameraBadgeIcon: {
    width: 14,
    height: 14,
    tintColor: FOREGROUND_INVERSE,
  },
  avatarUploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
    backgroundColor: OVERLAY_SCRIM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});

export default ProfileEditScreen;
