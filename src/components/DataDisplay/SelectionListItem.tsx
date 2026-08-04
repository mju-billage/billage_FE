import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Switch from '../Selection/Switch';
import {
  FEEDBACK_NEGATIVE_BOLD,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';

const CHEVRON_RIGHT_ICON = require('../../assets/icons/nav/ChevronRight.png');

type SelectionListItemProps =
  | {
      type: 'picker';
      title: string;
      required?: boolean;
      value: string;
      disabled?: boolean;
      onPress?: () => void;
    }
  | {
      type: 'switch';
      title: string;
      subtitle?: string;
      value: boolean;
      disabled?: boolean;
      onValueChange?: (value: boolean) => void;
    };

/** 설정 화면 등에서 쓰는 선택 행. 값 선택(picker) 또는 토글(switch) 두 타입을 지원한다. */
function SelectionListItem(props: SelectionListItemProps) {
  if (props.type === 'switch') {
    return (
      <View style={styles.row}>
        <View style={styles.titleColumn}>
          <Text style={[styles.title, props.disabled && styles.titleDisabled]}>
            {props.title}
          </Text>
          {props.subtitle && (
            <Text style={styles.subtitle}>{props.subtitle}</Text>
          )}
        </View>
        <Switch
          value={props.value}
          onValueChange={props.onValueChange ?? (() => {})}
          disabled={props.disabled}
        />
      </View>
    );
  }

  return (
    <Pressable
      style={styles.row}
      onPress={props.onPress}
      disabled={props.disabled}
    >
      <Text style={[styles.title, props.disabled && styles.titleDisabled]}>
        {props.title}
        {props.required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{props.value}</Text>
        <Image source={CHEVRON_RIGHT_ICON} style={styles.chevron} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  titleColumn: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  titleDisabled: {
    color: FOREGROUND_DISABLED,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: FOREGROUND_DISABLED,
  },
  required: {
    color: FEEDBACK_NEGATIVE_BOLD,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontSize: 14,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  chevron: {
    width: 14,
    height: 14,
    tintColor: FOREGROUND_DISABLED,
  },
});

export default SelectionListItem;
