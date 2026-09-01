/** @screen ADD-3-PAGE-02-0 사진 촬영 (Mock 구현, 디자인 이미지 미확보) */
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IconButton from '../../components/Input/Button/IconButton';
import { FOREGROUND_INVERSE, GREY_800 } from '../../constants/colors';

const CHEVRON_LEFT_ICON = require('../../assets/icons/nav/Chevron Left.png');
const CLOSE_ICON = require('../../assets/icons/action/Close.png');

type MockCameraViewProps = {
  onBack: () => void;
  onClose: () => void;
  onCapture: () => void;
};

/** 실카메라 라이브러리가 없어 뷰파인더를 흉내낸 전체화면 mock 카메라. */
function MockCameraView({ onBack, onClose, onCapture }: MockCameraViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.topRow, { top: insets.top + 12 }]}>
        <IconButton icon={CHEVRON_LEFT_ICON} onPress={onBack} overlay />
        <IconButton icon={CLOSE_ICON} onPress={onClose} overlay />
      </View>

      <View style={[styles.bottomRow, { bottom: insets.bottom + 24 }]}>
        <View style={styles.recentThumbnail} />
        <Pressable
          style={({ pressed }) => [
            styles.shutterButton,
            pressed && styles.shutterButtonPressed,
          ]}
          onPress={onCapture}
        />
        <View style={styles.recentThumbnailPlaceholder} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GREY_800,
  },
  topRow: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomRow: {
    position: 'absolute',
    left: 32,
    right: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  recentThumbnailPlaceholder: {
    width: 40,
    height: 40,
  },
  shutterButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: FOREGROUND_INVERSE,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  shutterButtonPressed: {
    opacity: 0.8,
  },
});

export default MockCameraView;
