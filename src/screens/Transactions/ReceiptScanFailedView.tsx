import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/Input/Button/Button';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import {
  SCAN_FAILED_RETRY_LABEL,
  SCAN_FAILED_SUBTITLE,
  SCAN_FAILED_TITLE,
} from '../../constants/transactionScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const RECEIPT_GRAPHIC = require('../../assets/images/receipt-graphic.png');

type ReceiptScanFailedViewProps = {
  onRetry: () => void;
};

function ReceiptScanFailedView({ onRetry }: ReceiptScanFailedViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScreenContainer
      background="secondary"
      edges={[]}
      style={[styles.container, { paddingTop: insets.top + 12 }]}
    >
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    ...TYPOGRAPHY.h2,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.body3,
    marginTop: 8,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    textAlign: 'center',
  },
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
