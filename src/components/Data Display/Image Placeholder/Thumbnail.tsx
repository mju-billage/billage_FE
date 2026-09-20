import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_INVERSE,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
  OVERLAY_SCRIM,
} from '../../../constants/colors';

const CLOSE_ICON = require('../../../assets/icons/action/Close.png');
const IMAGE_ICON = require('../../../assets/icons/content/Image.png');

type ThumbnailProps = {
  imageUri?: string;
  /** imageUri가 인증이 필요한 경로(File 도메인 fileUrl 등)일 때 같이 전달한다. */
  imageHeaders?: Record<string, string>;
  size?: number;
  onRemove?: () => void;
  /** 업로드 진행 중 — 이미지 위에 스피너를 덮고 제거 버튼을 숨긴다. */
  uploading?: boolean;
};

/** 작은 정사각 이미지 썸네일. 우상단에 겹쳐진 제거 버튼을 옵션으로 보여준다. */
function Thumbnail({
  imageUri,
  imageHeaders,
  size = 56,
  onRemove,
  uploading = false,
}: ThumbnailProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri, headers: imageHeaders }}
          style={styles.image}
        />
      ) : (
        <View style={styles.emptyBackground}>
          <Image
            source={IMAGE_ICON}
            style={[styles.emptyIcon, { width: size * 0.4, height: size * 0.4 }]}
          />
        </View>
      )}
      {uploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator color={FOREGROUND_INVERSE} />
        </View>
      )}
      {onRemove && !uploading && (
        <Pressable style={styles.removeButton} onPress={onRemove} hitSlop={8}>
          <Image source={CLOSE_ICON} style={styles.removeIcon} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'visible',
  },
  emptyBackground: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
  image: {
    flex: 1,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    width: 10,
    height: 10,
    tintColor: FOREGROUND_NEUTRAL_NORMAL,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    backgroundColor: OVERLAY_SCRIM,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Thumbnail;
