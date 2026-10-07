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
