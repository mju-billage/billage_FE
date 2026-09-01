/** @screen ADD-4-PAGE-01-1 영수증 스캔 실패 */
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/Input/Button/Button';
import {
  SCAN_FAILED_RETRY_LABEL,
  SCAN_FAILED_SUBTITLE,
  SCAN_FAILED_TITLE,
} from '../../constants/transactionScreenText';
import {
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_PRIMARY,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const CLOSE_ICON = require('../../assets/icons/action/Close.png');

type ReceiptScanFailedViewProps = {
  onRetry: () => void;
  onClose: () => void;
};

/** 영수증 인식(OCR)에 실패했을 때 보여주는 전체화면. */
function ReceiptScanFailedView({ onRetry, onClose }: ReceiptScanFailedViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <Pressable style={styles.closeButton} onPress={onClose} hitSlop={8}>
        <Image source={CLOSE_ICON} style={styles.closeIcon} />
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.title}>{SCAN_FAILED_TITLE}</Text>
        <Text style={styles.subtitle}>{SCAN_FAILED_SUBTITLE}</Text>
        <View style={styles.previewBox} />
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button
          label={SCAN_FAILED_RETRY_LABEL}
          onPress={onRetry}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginRight: 20,
  },
  closeIcon: {
    width: 24,
    height: 24,
    tintColor: FOREGROUND_PRIMARY,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  title: {
    ...TYPOGRAPHY.h3,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.body2,
    marginTop: 8,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    textAlign: 'center',
  },
  previewBox: {
    width: 160,
    height: 160,
    borderRadius: 12,
    backgroundColor: FILL_NEUTRAL_NORMAL,
    marginTop: 32,
  },
  footer: {
    paddingHorizontal: 24,
  },
});

export default ReceiptScanFailedView;
