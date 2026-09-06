/** @screen ETC-4-PAGE-15-0 프로필 변경 */
/** @screen ETC-4-SHEET-02-0 프로필 변경_사진 변경 (imageMenuVisible) */
/**
 * "프로필 변경": 닉네임 + 대표 이미지를 수정한다. `GroupProfileEditScreen.tsx`와
 * 구조가 거의 같지만 이미지 선택 진입 방식이 다르다 — 모임 쪽은 아바타를
 * 누르면 바로 `GroupImagePickerScreen`(그리드)으로 가지만, 이 화면은 시안
 * (글로벌설정_내프로필_프로필변경-1.png, 실제 Screen ID는 파일명과 달리
 * `ETC-4-SHEET-02-0`이었다 — 표 헤더로 직접 확인)대로 먼저 바텀시트(사진
 * 촬영하기 / 사진 선택하기 / 기본 프로필로 변경하기)를 띄운다. 그리드 화면
 * 자체는 `ETC-4-PAGE-02-0`(이미 만든 `GroupImagePickerScreen`)을 그대로
 * 재사용한다 — 새로 만들지 않는다.
 *
 * ⚠️ 갤러리/카메라가 전부 mock이라 실제 파일이 없다(`GroupProfileEditScreen.tsx`
 * 주석과 동일한 제약) — 촬영/앨범 선택은 로컬 미리보기조차 못 만들고(실제
 * 이미지 데이터가 없음) 저장 시에도 `profileImageFileId`를 보내지 않는다.
 * 단, "기본 프로필로 변경하기"는 서버에 `null`만 보내면 되고 실제 파일이
 * 필요 없어 — 이것만 진짜로 동작한다(3-state 규칙 중 "초기화"만 이번에
 * 실제로 붙는다).
 */
import { useCallback, useState } from 'react';
import { BackHandler, Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import MockCameraView from '../Transactions/MockCameraView';
import GroupImagePickerScreen from '../GroupManager/GroupImagePickerScreen';
import { getCurrentUser } from '../../types/session';
import * as authService from '../../services/authService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
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
import { FOREGROUND_INVERSE, NAVY_800 } from '../../constants/colors';

const CAMERA_ICON = require('../../assets/icons/content/Camera.png');
const GALLERY_ICON = require('../../assets/icons/content/Image.png');
const RESET_ICON = require('../../assets/icons/user/User.png');

type ProfileEditNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProfileEdit'
>;

type Stage = 'form' | 'camera' | 'imagePicker';
/** 저장 시 보낼 이미지 상태 — 'none'=안 건드림(필드 생략), 'reset'=기본으로
 * 초기화(null 전송), 'picked'=mock으로 골랐지만 실제 파일이 없어 저장 안 함. */
type ImageAction = 'none' | 'reset' | 'picked';

/** "프로필 변경": 닉네임 + 대표 이미지 수정. */
function ProfileEditScreen() {
  const navigation = useNavigation<ProfileEditNavigationProp>();
  const user = getCurrentUser();
  const [name, setName] = useState(user?.name ?? '');
  const [nameError, setNameError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stage, setStage] = useState<Stage>('form');
  const [imageMenuVisible, setImageMenuVisible] = useState(false);
  const [imageAction, setImageAction] = useState<ImageAction>('none');
  const [leaveDialogVisible, setLeaveDialogVisible] = useState(false);

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !isSubmitting;
  const hasChanges = trimmedName !== (user?.name ?? '') || imageAction !== 'none';
  const hasCustomImage =
    imageAction === 'picked' || (imageAction === 'none' && !!user?.profileImageUrl);

  const handleBack = () => {
    if (hasChanges) {
      setLeaveDialogVisible(true);
    } else {
      navigation.goBack();
    }
  };

  // 안드로이드 하드웨어 back도 같은 이탈 확인을 거치게 한다(ReportCreateByLedgerScreen
  // 패턴) — 포커스 중일 때만 걸어야 카메라/이미지 선택 스테이지 위에 있을 때
  // 뒤로가기를 가로채지 않는다.
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
        setNameError(nameFieldError?.reason ?? getApiErrorMessage(error.code));
      } else {
        setNameError(API_ERROR_DEFAULT_MESSAGE);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (stage === 'camera') {
    return (
      <MockCameraView
        onBack={() => setStage('form')}
        onClose={() => setStage('form')}
        onCapture={() => {
          setImageAction('picked');
          setStage('form');
        }}
      />
    );
  }

  if (stage === 'imagePicker') {
    return (
      <GroupImagePickerScreen
        onBack={() => setStage('form')}
        onOpenCamera={() => setStage('camera')}
        onSelect={() => {
          setImageAction('picked');
          setStage('form');
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar type="sub" title={PROFILE_EDIT_TITLE} onBackPress={handleBack} />

      <View style={styles.body}>
        <Pressable
          style={styles.avatarRow}
          onPress={() => setImageMenuVisible(true)}
        >
          <Avatar
            type={hasCustomImage ? 'image' : 'icon'}
            imageUri={imageAction === 'none' ? user?.profileImageUrl ?? '' : ''}
            size="lg"
          />
          <View style={styles.cameraBadge}>
            <Image source={CAMERA_ICON} style={styles.cameraBadgeIcon} />
          </View>
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
              setStage('camera');
            } else if (key === 'gallery') {
              setStage('imagePicker');
            } else if (key === 'reset') {
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
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
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
});

export default ProfileEditScreen;
