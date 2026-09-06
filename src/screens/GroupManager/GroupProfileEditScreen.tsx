/** @screen ETC-3-PAGE-01-0 모임 프로필 변경 */
import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Avatar from '../../components/Data Display/Avatar/Avatar';
import Button from '../../components/Input/Button/Button';
import TextField from '../../components/Input/Text Field/TextField';
import MockCameraView from '../Transactions/MockCameraView';
import GroupImagePickerScreen from './GroupImagePickerScreen';
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
} from '../../constants/groupManagerScreenText';
import { FOREGROUND_INVERSE, NAVY_800 } from '../../constants/colors';

const CAMERA_ICON = require('../../assets/icons/content/Camera.png');

type GroupProfileEditNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GroupProfileEdit'
>;

type Stage = 'form' | 'camera' | 'imagePicker';

/**
 * "모임 프로필 변경": 모임명 + 대표 이미지를 수정한다. 이미지 선택 로직은
 * 시안 UI 요소 2번에 "글로벌 프로필 설정의 이미지 제어 로직과 100% 동일하게
 * 작동함"이라 적혀 있지만, 그 "글로벌 프로필"(내 프로필 변경, ETC-4-PAGE-17-0
 * 계열)은 아직 이 프로젝트에 없다 — 지금은 이 화면만 그 로직(카메라/앨범 →
 * 단일 선택)을 구현해뒀고, 내 프로필 화면이 생기면 `GroupImagePickerScreen`/
 * `MockCameraView` 조합을 그대로 가져다 쓰면 된다.
 *
 * ⚠️ 갤러리/카메라가 전부 mock이라 실제 파일이 없다(`fileService.ts` 주석과 동일한
 * 제약) — 사진을 골라도 `groupImageFileId`로 보낼 실제 fileId가 없으므로 저장
 * 시 이미지 필드는 보내지 않는다(모임명만 부분 갱신, 2026-09-06 실호출로 확인된
 * PATCH 부분 갱신 특성 덕에 안전하다). 실제 이미지 업로드가 붙으면
 * `fileService.uploadFile(..., 'GROUP_IMAGE')`로 얻은 fileId를 여기 채울 것.
 */
function GroupProfileEditScreen() {
  const navigation = useNavigation<GroupProfileEditNavigationProp>();
  const group = getActiveGroup();
  const [name, setName] = useState(group?.name ?? '');
  const [nameError, setNameError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stage, setStage] = useState<Stage>('form');

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit || !group) {
      return;
    }
    setNameError(undefined);
    setIsSubmitting(true);
    try {
      if (trimmedName !== group.name) {
        await groupService.updateGroup(group.id, { name: trimmedName });
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

  if (stage === 'camera') {
    return (
      <MockCameraView
        onBack={() => setStage('form')}
        onClose={() => setStage('form')}
        onCapture={() => setStage('form')}
      />
    );
  }

  if (stage === 'imagePicker') {
    return (
      <GroupImagePickerScreen
        onBack={() => setStage('form')}
        onOpenCamera={() => setStage('camera')}
        onSelect={() => setStage('form')}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar
        type="sub"
        title={GROUP_PROFILE_EDIT_TITLE}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.body}>
        <Pressable
          style={styles.avatarRow}
          onPress={() => setStage('imagePicker')}
        >
          <Avatar
            type={group?.groupImageUrl ? 'image' : 'icon'}
            imageUri={group?.groupImageUrl ?? ''}
            size="lg"
          />
          <View style={styles.cameraBadge}>
            <Image source={CAMERA_ICON} style={styles.cameraBadgeIcon} />
          </View>
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

export default GroupProfileEditScreen;
