import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { generateMockScanResult, type MockScanResult } from '../../utils/mockOcr';
import {
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_SECONDARY,
  GREY_800,
} from '../../constants/colors';

const SCAN_DELAY_MS = 1500;
const PREVIEW_SIZE = 240;

type ReceiptScanningViewProps = {
  onComplete: (result: MockScanResult | null) => void;
};

function ReceiptScanningView({ onComplete }: ReceiptScanningViewProps) {
  const sweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(sweep, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();

    const timer = setTimeout(() => {
      onComplete(generateMockScanResult());
    }, SCAN_DELAY_MS);

    return () => {
      animation.stop();
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const translateY = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [0, PREVIEW_SIZE],
  });

  return (
    <View style={styles.container}>
      <View style={styles.previewBox}>
        <Animated.View
          style={[styles.sweepLine, { transform: [{ translateY }] }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GREY_800,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBox: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    borderRadius: 12,
    backgroundColor: FILL_NEUTRAL_NORMAL,
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
    overflow: 'hidden',
  },
  sweepLine: {
    width: '100%',
    height: 2,
    backgroundColor: FOREGROUND_SECONDARY,
  },
});

export default ReceiptScanningView;
