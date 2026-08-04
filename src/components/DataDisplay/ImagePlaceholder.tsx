import { Image, Pressable, StyleSheet, View } from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_NORMAL,
  FILL_NEUTRAL_SUBTLE,
} from '../../constants/colors';

type ImagePlaceholderAspectRatio = '1:1' | '3:4' | '9:16';

type ImagePlaceholderProps = {
  imageUri?: string;
  aspectRatio?: ImagePlaceholderAspectRatio;
  showOptionButton?: boolean;
  onPressOption?: () => void;
};

const ASPECT_RATIO_VALUE: Record<ImagePlaceholderAspectRatio, number> = {
  '1:1': 1,
  '3:4': 3 / 4,
  '9:16': 9 / 16,
};

/** 이미지 미선택 상태를 보여주는 플레이스홀더. 비율과 우상단 옵션 버튼을 지원한다. */
function ImagePlaceholder({
  imageUri,
  aspectRatio = '1:1',
  showOptionButton = true,
  onPressOption,
}: ImagePlaceholderProps) {
  return (
    <View
      style={[
        styles.container,
        { aspectRatio: ASPECT_RATIO_VALUE[aspectRatio] },
      ]}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <View style={styles.emptyBackground} />
      )}
      {showOptionButton && (
        <Pressable
          style={styles.optionButton}
          onPress={onPressOption}
          hitSlop={8}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: FILL_NEUTRAL_NORMAL,
  },
  emptyBackground: {
    flex: 1,
    backgroundColor: FILL_NEUTRAL_NORMAL,
  },
  image: {
    flex: 1,
  },
  optionButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
  },
});

export default ImagePlaceholder;
