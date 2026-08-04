import { Image, Pressable, StyleSheet, Text } from 'react-native';
import { BORDER_NEUTRAL, NAVY, TEXT_MUTED } from '../../constants/colors';

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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL,
  },
  galleryCard: {
    backgroundColor: NAVY,
  },
  disabledCard: {
    backgroundColor: '#F1F3F5',
    borderColor: '#F1F3F5',
  },
  pressed: {
    opacity: 0.85,
  },
  icon: {
    width: 22,
    height: 22,
  },
  attachmentIcon: {
    tintColor: '#495057',
  },
  galleryIcon: {
    tintColor: '#FFFFFF',
  },
  disabledIcon: {
    tintColor: TEXT_MUTED,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  attachmentLabel: {
    color: '#495057',
  },
  galleryLabel: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  disabledLabel: {
    color: TEXT_MUTED,
  },
});

export default AttachmentAddButton;
