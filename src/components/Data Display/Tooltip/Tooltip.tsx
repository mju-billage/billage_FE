import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { GREY_100, GREY_600 } from '../../../constants/colors';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

type TooltipProps = {
  content: string;
  position?: TooltipPosition;
  visible: boolean;
  children: React.ReactNode;
};

const TAIL_LENGTH = 16;
const TAIL_DEPTH = 6;

/** position별 꼬리 방향 SVG path. 몸체 사각형과 매끄럽게 이어지도록 밑변이 둥글게 말려 들어간다.
 * viewBox가 실제 렌더 크기와 정확히 일치해야 한다 (다르면 aspect-ratio 보정 때문에 몸체와 틈이 생김). */
const TAIL_PATH: Record<TooltipPosition, { viewBox: string; d: string }> = {
  // 말풍선이 앵커 위에 뜸 → 꼬리는 아래쪽을 향함
  top: {
    viewBox: '0 0 16 6',
    d: 'M16,0 Q13,0 11.1,2.3 L9.9,3.7 Q8,6 6.1,3.7 L4.9,2.3 Q3,0 0,0 Z',
  },
  // 말풍선이 앵커 아래에 뜸 → 꼬리는 위쪽을 향함
  bottom: {
    viewBox: '0 0 16 6',
    d: 'M16,6 Q13,6 11.1,3.7 L9.9,2.3 Q8,0 6.1,2.3 L4.9,3.7 Q3,6 0,6 Z',
  },
  // 말풍선이 앵커 왼쪽에 뜸 → 꼬리는 오른쪽을 향함
  left: {
    viewBox: '0 0 6 16',
    d: 'M0,16 Q0,13 2.3,11.1 L3.7,9.9 Q6,8 3.7,6.1 L2.3,4.9 Q0,3 0,0 Z',
  },
  // 말풍선이 앵커 오른쪽에 뜸 → 꼬리는 왼쪽을 향함
  right: {
    viewBox: '0 0 6 16',
    d: 'M6,16 Q6,13 3.7,11.1 L2.3,9.9 Q0,8 2.3,6.1 L3.7,4.9 Q6,3 6,0 Z',
  },
};

/** 앵커 대비 상/하/좌/우 위치에 뜨는 말풍선 툴팁. */
function Tooltip({
  content,
  position = 'top',
  visible,
  children,
}: TooltipProps) {
  const tail = TAIL_PATH[position];
  const isVertical = position === 'top' || position === 'bottom';

  return (
    <View style={styles.anchor}>
      {children}
      {visible && (
        <View style={[styles.bubble, POSITION_STYLE[position]]}>
          <Text style={styles.text} numberOfLines={1}>
            {content}
          </Text>
          <View style={[styles.tailWrapper, TAIL_POSITION_STYLE[position]]}>
            <Svg
              width={isVertical ? TAIL_LENGTH : TAIL_DEPTH}
              height={isVertical ? TAIL_DEPTH : TAIL_LENGTH}
              viewBox={tail.viewBox}
            >
              <Path d={tail.d} fill={GREY_100} />
            </Svg>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  bubble: {
    position: 'absolute',
    backgroundColor: GREY_100,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontSize: 10,
    color: GREY_600,
  },
  top: {
    bottom: '100%',
    left: 0,
    marginBottom: TAIL_DEPTH,
  },
  bottom: {
    top: '100%',
    left: 0,
    marginTop: TAIL_DEPTH,
  },
  left: {
    right: '100%',
    top: 0,
    marginRight: TAIL_DEPTH,
  },
  right: {
    left: '100%',
    top: 0,
    marginLeft: TAIL_DEPTH,
  },
  tailWrapper: {
    position: 'absolute',
  },
  tailTop: {
    bottom: -(TAIL_DEPTH - 1),
    left: 8,
  },
  tailBottom: {
    top: -(TAIL_DEPTH - 1),
    left: 8,
  },
  tailLeft: {
    right: -(TAIL_DEPTH - 1),
    top: '50%',
    marginTop: -TAIL_LENGTH / 2,
  },
  tailRight: {
    left: -(TAIL_DEPTH - 1),
    top: '50%',
    marginTop: -TAIL_LENGTH / 2,
  },
});

const POSITION_STYLE: Record<TooltipPosition, object> = {
  top: styles.top,
  bottom: styles.bottom,
  left: styles.left,
  right: styles.right,
};

const TAIL_POSITION_STYLE: Record<TooltipPosition, object> = {
  top: styles.tailTop,
  bottom: styles.tailBottom,
  left: styles.tailLeft,
  right: styles.tailRight,
};

export default Tooltip;
