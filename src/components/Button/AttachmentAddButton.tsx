import { Image, Pressable, StyleSheet, Text } from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  FILL_DISABLED,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_DISABLED,
  FOREGROUND_INVERSE,
  FOREGROUND_NEUTRAL_NORMAL,
  NAVY_800,
} from '../../constants/colors';

const CAMERA_ICON = require('../../assets/icons/content/Camera.png');

type AttachmentAddButtonType = 'attachmentAdd' | 'gallery';

type AttachmentAddButtonProps = {
  type?: AttachmentAddButtonType;
  onPress: () => void;
  disabled?: boolean;
};

const LABEL_BY_TYPE: Record<AttachmentAddButtonType, string> = {
  attachmentAdd: '사진/스캔',
  gallery: '카메라',
};

/** 영수증/증빙자료 첨부용 정사각 버튼. attachmentAdd(아웃라인)와 gallery(진한 배경) 두 타입을 지원한다. */
function AttachmentAddButton({
  type = 'attachmentAdd',
  onPress,
  disabled = false,
}: AttachmentAddButtonProps) {
  const isGallery = type === 'gallery';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isGallery ? styles.galleryCard : styles.attachmentCard,
        disabled && styles.disabledCard,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Image
        source={CAMERA_ICON}
        style={[
          styles.icon,
          isGallery ? styles.galleryIcon : styles.attachmentIcon,
          disabled && styles.disabledIcon,
        ]}
      />
      <Text
        style={[
          styles.label,
          isGallery ? styles.galleryLabel : styles.attachmentLabel,
          disabled && styles.disabledLabel,
        ]}
      >
        {LABEL_BY_TYPE[type]}
      </Text>
    </Pressable>
  );
}

const SIZE = 88;

const styles = StyleSheet.create({
  card: {
    width: SIZE,
    height: SIZE,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  attachmentCard: {
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
  },
  galleryCard: {
    backgroundColor: NAVY_800,
  },
  disabledCard: {
    backgroundColor: FILL_DISABLED,
    borderColor: FILL_DISABLED,
  },
  pressed: {
    opacity: 0.85,
  },
  icon: {
    width: 22,
    height: 22,
  },
  attachmentIcon: {
    tintColor: FOREGROUND_NEUTRAL_NORMAL,
  },
  galleryIcon: {
    tintColor: FOREGROUND_INVERSE,
  },
  disabledIcon: {
    tintColor: FOREGROUND_DISABLED,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  attachmentLabel: {
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  galleryLabel: {
    color: FOREGROUND_INVERSE,
    fontSize: 14,
  },
  disabledLabel: {
    color: FOREGROUND_DISABLED,
  },
});

export default AttachmentAddButton;
