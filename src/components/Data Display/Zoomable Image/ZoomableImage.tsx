/**
 * 핀치줌·더블탭·팬을 지원하는 이미지 뷰어. `ReceiptDetailScreen`(ETC-3-PAGE-04-0)
 * 에서 처음 구현했던 걸 `TransactionReceiptDetailScreen`(DTB-3-PAGE-01-0)과
 * 공유하려고 뽑아냈다 — 두 화면 다 "증빙 이미지 원본을 몰입감 있게 보여주는"
 * 같은 상호작용이라 로직 자체는 손대지 않았다. 새 네이티브 의존성
 * (react-native-gesture-handler 등) 없이 RN 코어 `PanResponder`만 쓴다.
 */
import { useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, StyleSheet, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
const DOUBLE_TAP_MAX_INTERVAL_MS = 300;
const TAP_MAX_MOVEMENT = 8;

function distance(touches: { pageX: number; pageY: number }[]): number {
  const [a, b] = touches;
  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

type ZoomableImageProps = {
  uri: string;
  headers?: Record<string, string>;
};

function ZoomableImage({ uri, headers }: ZoomableImageProps) {
  const [scale, setScale] = useState(MIN_SCALE);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const scaleRef = useRef(MIN_SCALE);
  const translateRef = useRef({ x: 0, y: 0 });
  const pinchStartDistanceRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef(MIN_SCALE);
  const panStartRef = useRef({ x: 0, y: 0 });
  const lastTapRef = useRef(0);
  const gestureStartRef = useRef({ x: 0, y: 0, moved: false });

  const applyScale = (next: number) => {
    scaleRef.current = next;
    setScale(next);
  };

  const applyTranslate = (next: { x: number; y: number }) => {
    translateRef.current = next;
    setTranslate(next);
  };

  const resetZoom = () => {
    applyScale(MIN_SCALE);
    applyTranslate({ x: 0, y: 0 });
  };

  const toggleDoubleTapZoom = () => {
    if (scaleRef.current > MIN_SCALE) {
      resetZoom();
    } else {
      applyScale(DOUBLE_TAP_SCALE);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: evt => {
        const touches = evt.nativeEvent.touches;
        gestureStartRef.current = {
          x: touches[0]?.pageX ?? 0,
          y: touches[0]?.pageY ?? 0,
          moved: false,
        };
        panStartRef.current = translateRef.current;
        if (touches.length === 2) {
          pinchStartDistanceRef.current = distance(touches);
          pinchStartScaleRef.current = scaleRef.current;
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
          if (pinchStartDistanceRef.current == null) {
            pinchStartDistanceRef.current = distance(touches);
            pinchStartScaleRef.current = scaleRef.current;
            return;
          }
          const ratio = distance(touches) / pinchStartDistanceRef.current;
          applyScale(clamp(pinchStartScaleRef.current * ratio, MIN_SCALE, MAX_SCALE));
          return;
        }
        if (
          Math.abs(gestureState.dx) > TAP_MAX_MOVEMENT ||
          Math.abs(gestureState.dy) > TAP_MAX_MOVEMENT
        ) {
          gestureStartRef.current.moved = true;
        }
        if (scaleRef.current > MIN_SCALE) {
          const maxOffsetX = (SCREEN_WIDTH * (scaleRef.current - 1)) / 2;
          const maxOffsetY = (SCREEN_HEIGHT * (scaleRef.current - 1)) / 2;
          applyTranslate({
            x: clamp(panStartRef.current.x + gestureState.dx, -maxOffsetX, maxOffsetX),
            y: clamp(panStartRef.current.y + gestureState.dy, -maxOffsetY, maxOffsetY),
          });
        }
      },
      onPanResponderRelease: () => {
        pinchStartDistanceRef.current = null;
        if (scaleRef.current < MIN_SCALE) {
          resetZoom();
        }
        if (!gestureStartRef.current.moved) {
          const now = Date.now();
          if (now - lastTapRef.current < DOUBLE_TAP_MAX_INTERVAL_MS) {
            toggleDoubleTapZoom();
            lastTapRef.current = 0;
          } else {
            lastTapRef.current = now;
          }
        }
      },
    }),
  ).current;

  return (
    <View style={styles.viewer} {...panResponder.panHandlers}>
      <Animated.Image
        source={{ uri, headers }}
        style={[
          styles.image,
          {
            transform: [
              { translateX: translate.x },
              { translateY: translate.y },
              { scale },
            ],
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  viewer: {
    flex: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default ZoomableImage;
