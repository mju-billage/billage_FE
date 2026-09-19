/** @screen ADD-2-SHEET-05-0 증빙자료 등록 */
/**
 * 2026-09-11: 실제 갤러리로 교체했다. 예전엔 `MOCK_PHOTO_IDS` 12장을 그려
 * 탭으로 다중 선택하는 자체 그리드였는데, 실제 사진은 이 화면이 아니라
 * 시스템 포토 피커(`utils/imagePicker.ts`의 `pickGalleryWithFeedback`,
 * `launchImageLibrary`)가 보여준다 — 그래서 이 화면은 그리드를 그리는 대신
 * 마운트되자마자 피커를 띄우고 결과를 그대로 호출부에 넘기는 다리 역할만
 * 한다(카메라 쪽 `MockCameraView` 제거와 같은 이유: 프리뷰 없는 자체 그리드가
 * "시스템 피커가 한 번 더 뜨는 것"처럼 보여 의미가 없어졌다).
 */
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBar from '../../components/Navigation/App bar/AppBar';
import { pickGalleryWithFeedback, type PickedImage } from '../../utils/imagePicker';
import { GALLERY_PICKER_TITLE, SNACKBAR_RECEIPT_MAX_LIMIT } from '../../constants/transactionScreenText';

type ReceiptGalleryPickerScreenProps = {
  remainingSlots: number;
  onPicked: (images: PickedImage[]) => void;
  onBack: () => void;
  onMessage: (message: string) => void;
  onPermanentlyDenied: () => void;
};

/** 시스템 갤러리를 열어 증빙 사진을 다중 선택한다(남은 자리만큼). */
function ReceiptGalleryPickerScreen({
  remainingSlots,
  onPicked,
  onBack,
  onMessage,
  onPermanentlyDenied,
}: ReceiptGalleryPickerScreenProps) {
  const hasLaunched = useRef(false);

  useEffect(() => {
    if (hasLaunched.current) {
      return;
    }
    hasLaunched.current = true;

    if (remainingSlots <= 0) {
      onMessage(SNACKBAR_RECEIPT_MAX_LIMIT);
      onBack();
      return;
    }

    pickGalleryWithFeedback(remainingSlots, onMessage, onPermanentlyDenied).then(
      images => {
        if (images && images.length > 0) {
          onPicked(images);
        } else {
          onBack();
        }
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar type="sub" title={GALLERY_PICKER_TITLE} onBackPress={onBack} />
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

export default ReceiptGalleryPickerScreen;
