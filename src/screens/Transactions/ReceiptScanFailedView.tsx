/** @screen ADD-4-PAGE-01-1 영수증 스캔 실패 */
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/Input/Button/Button';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import {
  SCAN_FAILED_RETRY_LABEL,
  SCAN_FAILED_SUBTITLE,
  SCAN_FAILED_TITLE,
} from '../../constants/transactionScreenText';
import {
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_PRIMARY,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const CLOSE_ICON = require('../../assets/icons/action/Close.png');
const RECEIPT_GRAPHIC = require('../../assets/images/receipt-graphic.png');

type ReceiptScanFailedViewProps = {
  onRetry: () => void;
  onClose: () => void;
};

/** 영수증 인식(OCR)에 실패했을 때 보여주는 전체화면. */
function ReceiptScanFailedView({ onRetry, onClose }: ReceiptScanFailedViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScreenContainer
      background="secondary"
      edges={[]}
      style={[styles.container, { paddingTop: insets.top + 12 }]}
    >
      <Pressable style={styles.closeButton} onPress={onClose} hitSlop={8}>
        <Image source={CLOSE_ICON} style={styles.closeIcon} />
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.title}>{SCAN_FAILED_TITLE}</Text>
        <Text style={styles.subtitle}>{SCAN_FAILED_SUBTITLE}</Text>
        <Image source={RECEIPT_GRAPHIC} style={styles.graphic} resizeMode="contain" />
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button
          label={SCAN_FAILED_RETRY_LABEL}
          onPress={onRetry}
          fullWidth
        />
      </View>
    </ScreenContainer>
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
    paddingHorizontal: 20,
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
  // 회색 자리표시 박스(160×160)를 그래픽으로 교체 — 자리 크기는 그대로, 비율은 contain으로 유지(356×344 원본).
  graphic: {
    width: 160,
    height: 160,
    marginTop: 32,
  },
  footer: {
    paddingHorizontal: 20,
  },
});

export default ReceiptScanFailedView;
