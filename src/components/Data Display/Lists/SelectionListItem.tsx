import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Switch from '../../Input/Control/Switch';
import {
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_DISABLED,
  FOREGROUND_PRIMARY,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

const CHEVRON_RIGHT_ICON = require('../../../assets/icons/nav/Chevron Right.png');

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

function SelectionListItem(props: SelectionListItemProps) {
  if (props.type === 'switch') {
    return (
      <View style={[styles.row, props.disabled && styles.rowDisabled]}>
        <View style={styles.titleColumn}>
          <Text style={styles.title}>{props.title}</Text>
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
      style={({ pressed }) => [
        styles.row,
        pressed && !props.disabled && styles.rowPressed,
        props.disabled && styles.rowDisabled,
      ]}
      onPress={props.onPress}
      disabled={props.disabled}
    >
      <Text style={styles.title}>
        {props.title}
        {props.required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, props.required && styles.valueRequired]}>
          {props.value}
        </Text>
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
    borderRadius: 8,
  },
  rowPressed: {
    backgroundColor: FILL_NEUTRAL_NORMAL,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  titleColumn: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_PRIMARY,
  },
  subtitle: {
    ...TYPOGRAPHY.body3,
    marginTop: 2,
    color: FOREGROUND_DISABLED,
  },
  required: {
    color: FOREGROUND_SECONDARY,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_PRIMARY,
  },
  valueRequired: {
    color: FOREGROUND_SECONDARY,
    fontWeight: 'bold',
  },
  chevron: {
    width: 14,
    height: 14,
    tintColor: FOREGROUND_DISABLED,
  },
});

export default SelectionListItem;
