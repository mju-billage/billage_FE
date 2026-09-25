import { Pressable, StyleSheet } from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_SECONDARY,
  GREY_300,
} from '../../../constants/colors';

type SwitchToggleProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

const TRACK_WIDTH = 44;
const TRACK_HEIGHT = 24;
const THUMB_SIZE = 20;

function Switch({ value, onValueChange, disabled = false }: SwitchToggleProps) {
  return (
    <Pressable
      style={[
        styles.track,
        value && styles.trackOn,
        disabled && styles.trackDisabled,
      ]}
      onPress={() => onValueChange(!value)}
      disabled={disabled}
    >
      <Pressable
        style={[styles.thumb, value && styles.thumbOn]}
        onPress={() => onValueChange(!value)}
        disabled={disabled}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: GREY_300,
    justifyContent: 'center',
    padding: 2,
  },
  trackOn: {
    backgroundColor: FOREGROUND_SECONDARY,
  },
  trackDisabled: {
    backgroundColor: BORDER_NEUTRAL_NORMAL,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: FILL_NEUTRAL_SUBTLE,
  },
  thumbOn: {
    alignSelf: 'flex-end',
  },
});

export default Switch;
