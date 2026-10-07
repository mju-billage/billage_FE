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
