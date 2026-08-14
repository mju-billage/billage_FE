import { Image, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';
import {
  BASIC_0,
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_NORMAL,
  FILL_NEUTRAL_SUBTLE,
} from '../../../constants/colors';

const CHECKER_TILE = 10;

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
        <View style={styles.emptyBackground}>
          <Svg width="100%" height="100%">
            <Defs>
              <Pattern
                id="checker"
                width={CHECKER_TILE * 2}
                height={CHECKER_TILE * 2}
                patternUnits="userSpaceOnUse"
              >
                <Rect
                  width={CHECKER_TILE * 2}
                  height={CHECKER_TILE * 2}
                  fill={BASIC_0}
                />
                <Rect
                  width={CHECKER_TILE}
                  height={CHECKER_TILE}
                  fill={FILL_NEUTRAL_NORMAL}
                />
                <Rect
                  x={CHECKER_TILE}
                  y={CHECKER_TILE}
                  width={CHECKER_TILE}
                  height={CHECKER_TILE}
                  fill={FILL_NEUTRAL_NORMAL}
                />
              </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#checker)" />
          </Svg>
        </View>
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
  },
  image: {
    flex: 1,
  },
  optionButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
  },
});

export default ImagePlaceholder;
