import { Image, Pressable, StyleSheet, View } from 'react-native';
import { FILL_NEUTRAL } from '../../constants/colors';

const CLOSE_ICON = require('../../assets/icons/action/Close.png');

type ThumbnailProps = {
  imageUri?: string;
  size?: number;
  onRemove?: () => void;
};

/** 작은 정사각 이미지 썸네일. 우상단에 겹쳐진 제거 버튼을 옵션으로 보여준다. */
function Thumbnail({ imageUri, size = 56, onRemove }: ThumbnailProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <View style={styles.emptyBackground} />
      )}
      {onRemove && (
        <Pressable style={styles.removeButton} onPress={onRemove} hitSlop={8}>
          <Image source={CLOSE_ICON} style={styles.removeIcon} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'visible',
  },
  emptyBackground: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: FILL_NEUTRAL,
  },
  image: {
    flex: 1,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#495057',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    width: 10,
    height: 10,
    tintColor: '#FFFFFF',
  },
});

export default Thumbnail;
