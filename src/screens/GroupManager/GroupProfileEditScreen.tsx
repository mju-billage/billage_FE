/** @screen ETC-3-PAGE-01-0 모임 프로필 변경 */
import { useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, StyleSheet, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Avatar from '../../components/Data Display/Avatar/Avatar';
import Button from '../../components/Input/Button/Button';
import TextField from '../../components/Input/Text Field/TextField';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import Menu from '../../components/Navigation/Menu/Menu';
import GroupImagePickerScreen from './GroupImagePickerScreen';
import { captureWithFeedback, type PickedImage } from '../../utils/imagePicker';
import * as fileService from '../../services/fileService';
import { getActiveGroup } from '../../types/group';
import * as groupService from '../../services/groupService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  GROUP_NAME_PLACEHOLDER,
  GROUP_PROFILE_EDIT_NAME_LABEL,
  GROUP_PROFILE_EDIT_NAME_MAX_LENGTH,
  GROUP_PROFILE_EDIT_SUBMIT_LABEL,
  GROUP_PROFILE_EDIT_TITLE,
  GROUP_PROFILE_IMAGE_SHEET_CAMERA_LABEL,
  GROUP_PROFILE_IMAGE_SHEET_GALLERY_LABEL,
} from '../../constants/groupManagerScreenText';
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

type GroupProfileEditNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GroupProfileEdit'
>;

type Stage = 'form' | 'imagePicker';
/** 저장 시 보낼 이미지 상태 — 'none'=안 건드림(필드 생략), 'uploaded'=새로 업로드해
 * `groupImageFileId`로 보낼 fileId가 있음. */
type ImageAction = 'none' | 'uploaded';
type PermissionDialogKind = 'camera' | 'gallery' | null;

const SNACKBAR_AUTO_HIDE_MS = 1600;

/**
 * "모임 프로필 변경": 모임명 + 대표 이미지를 수정한다. 이미지 선택 로직은
 * 시안 UI 요소 2번에 "글로벌 프로필 설정의 이미지 제어 로직과 100% 동일하게
 * 작동함"이라 적혀 있어 `ProfileEditScreen`과 같은 바텀시트(촬영/선택) →
 * `GroupImagePickerScreen`(갤러리) 구조를 그대로 맞췄다.
 *
 * 카메라/갤러리 둘 다 실제 촬영·선택이고, 고른 즉시
 * `fileService.uploadFile(..., 'GROUP_IMAGE')`로 업로드해 받은 fileId를
 * `groupImageFileId`에 채운다(업로드 중엔 저장 버튼을 막는다).
 */
function GroupProfileEditScreen() {
  const navigation = useNavigation<GroupProfileEditNavigationProp>();
  const group = getActiveGroup();
  const [name, setName] = useState(group?.name ?? '');
  const [nameError, setNameError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stage, setStage] = useState<Stage>('form');
  const [imageMenuVisible, setImageMenuVisible] = useState(false);
  const [imageAction, setImageAction] = useState<ImageAction>('none');
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [permissionDialogKind, setPermissionDialogKind] =
    useState<PermissionDialogKind>(null);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(null), SNACKBAR_AUTO_HIDE_MS);
  };

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !isSubmitting && !isUploadingImage;

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
        'GROUP_IMAGE',
      );
      setUploadedFileId(Number(uploaded.id));
      setImageAction('uploaded');
    } catch {
      setPreviewUri(null);
      showSnackbar(SNACKBAR_IMAGE_UPLOAD_FAILED);
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

  const handleSubmit = async () => {
    if (!canSubmit || !group) {
      return;
    }
    setNameError(undefined);
    setIsSubmitting(true);
    try {
      const payload: groupService.UpdateGroupInput = {};
      if (trimmedName !== group.name) {
        payload.name = trimmedName;
      }
      if (imageAction === 'uploaded' && uploadedFileId !== null) {
        payload.groupImageFileId = uploadedFileId;
      }
      if (Object.keys(payload).length > 0) {
        await groupService.updateGroup(group.id, payload);
      }
      navigation.goBack();
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

  const avatarImageUri = previewUri ?? group?.groupImageUrl ?? '';

  return (
    <ScreenContainer
      background="secondary"
      snackbar={
        snackbarMessage ? <Snackbar visible title={snackbarMessage} /> : undefined
      }
    >
      <AppBar
        type="sub"
        title={GROUP_PROFILE_EDIT_TITLE}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.body}>
        <Pressable
          style={styles.avatarRow}
          onPress={() => setImageMenuVisible(true)}
          disabled={isUploadingImage}
        >
          <Avatar
            type={avatarImageUri ? 'image' : 'icon'}
            imageUri={avatarImageUri}
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
          label={GROUP_PROFILE_EDIT_NAME_LABEL}
          value={name}
          onChangeText={text => {
            setName(text);
            setNameError(undefined);
          }}
          onClear={() => setName('')}
          placeholder={GROUP_NAME_PLACEHOLDER}
          maxLength={GROUP_PROFILE_EDIT_NAME_MAX_LENGTH}
          error={nameError}
        />
      </View>

      <View style={styles.footer}>
        <Button
          label={GROUP_PROFILE_EDIT_SUBMIT_LABEL}
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
                label: GROUP_PROFILE_IMAGE_SHEET_CAMERA_LABEL,
                icon: CAMERA_ICON,
              },
              {
                key: 'gallery',
                label: GROUP_PROFILE_IMAGE_SHEET_GALLERY_LABEL,
                icon: GALLERY_ICON,
              },
            ],
          ]}
          onSelect={key => {
            setImageMenuVisible(false);
            if (key === 'camera') {
              handleTakePhoto();
            } else if (key === 'gallery') {
              setStage('imagePicker');
            }
          }}
        />
      </BottomSheet>

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
    alignSelf: 'flex-start',
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

export default GroupProfileEditScreen;
