import { StyleSheet, Text, View } from 'react-native';
import { FOREGROUND_INVERSE, NAVY_800 } from '../../constants/colors';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

type TooltipProps = {
  content: string;
  position?: TooltipPosition;
  visible: boolean;
  children: React.ReactNode;
};

/** 앵커 대비 상/하/좌/우 위치에 뜨는 말풍선 툴팁. */
function Tooltip({
  content,
  position = 'top',
  visible,
  children,
}: TooltipProps) {
  return (
    <View style={styles.anchor}>
      {children}
      {visible && (
        <View style={[styles.bubble, POSITION_STYLE[position]]}>
          <Text style={styles.text}>{content}</Text>
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
    backgroundColor: NAVY_800,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  text: {
    fontSize: 12,
    color: FOREGROUND_INVERSE,
  },
  top: {
    bottom: '100%',
    left: 0,
    marginBottom: 6,
  },
  bottom: {
    top: '100%',
    left: 0,
    marginTop: 6,
  },
  left: {
    right: '100%',
    top: 0,
    marginRight: 6,
  },
  right: {
    left: '100%',
    top: 0,
    marginLeft: 6,
  },
});

const POSITION_STYLE: Record<TooltipPosition, object> = {
  top: styles.top,
  bottom: styles.bottom,
  left: styles.left,
  right: styles.right,
};

export default Tooltip;
