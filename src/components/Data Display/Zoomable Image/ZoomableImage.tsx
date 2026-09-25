import { useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, useWindowDimensions, View } from 'react-native';

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
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const windowSizeRef = useRef({ width: windowWidth, height: windowHeight });
  windowSizeRef.current = { width: windowWidth, height: windowHeight };

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
          const maxOffsetX = (windowSizeRef.current.width * (scaleRef.current - 1)) / 2;
          const maxOffsetY = (windowSizeRef.current.height * (scaleRef.current - 1)) / 2;
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
