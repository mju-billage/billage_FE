/** @screen ETC-4-PAGE-02-0 이미지 선택 (모임 프로필/내 프로필 단일 선택) */
/**
 * 실제 사진은 이 화면이 아니라
 * 시스템 포토 피커(`utils/imagePicker.ts`의 `pickGalleryWithFeedback`,
 * `launchImageLibrary`, 단일 선택은 `limit=1`)가 보여준다 — 그래서 이 화면은
 * 그리드를 그리는 대신 마운트되자마자 피커를 띄우고 결과를 그대로 호출부에
 * 넘기는 다리 역할만 한다(`ReceiptGalleryPickerScreen`과 동일한 이유).
 */
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBar from '../../components/Navigation/App bar/AppBar';
import { pickGalleryWithFeedback, type PickedImage } from '../../utils/imagePicker';
import { GROUP_IMAGE_PICKER_TITLE } from '../../constants/groupManagerScreenText';

const SINGLE_SELECT_LIMIT = 1;

type GroupImagePickerScreenProps = {
  onPicked: (image: PickedImage) => void;
  onBack: () => void;
  onMessage: (message: string) => void;
  onPermanentlyDenied: () => void;
};

/** 시스템 갤러리를 열어 사진 한 장을 선택한다(모임/내 프로필 이미지 공용). */
function GroupImagePickerScreen({
  onPicked,
  onBack,
  onMessage,
  onPermanentlyDenied,
}: GroupImagePickerScreenProps) {
  const hasLaunched = useRef(false);

  useEffect(() => {
    if (hasLaunched.current) {
      return;
    }
    hasLaunched.current = true;

    pickGalleryWithFeedback(SINGLE_SELECT_LIMIT, onMessage, onPermanentlyDenied).then(
      images => {
        if (images && images.length > 0) {
          onPicked(images[0]);
        } else {
          onBack();
        }
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar type="sub" title={GROUP_IMAGE_PICKER_TITLE} onBackPress={onBack} />
      <View style={styles.loadingBody}>
        <ActivityIndicator />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GroupImagePickerScreen;
