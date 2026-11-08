import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Chip from '../../Data Display/Chips/Chip';
import {
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

const PLUS_ICON = require('../../../assets/icons/action/Plus.png');

type TagSelectFieldProps = {
  label: string;
  tags: string[];
  onRemoveTag: (index: number) => void;
  onPressAdd: () => void;
  addLabel?: string;
};

function TagSelectField({
  label,
  tags,
  onRemoveTag,
  onPressAdd,
  addLabel = '추가하기',
}: TagSelectFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {tags.length > 0 && (
        <View style={styles.tagRow}>
          {tags.map((tag, index) => (
            <Chip key={`${tag}-${index}`} label={tag} onRemove={() => onRemoveTag(index)} />
          ))}
        </View>
      )}
      <Pressable style={styles.addButton} onPress={onPressAdd}>
        <Image source={PLUS_ICON} style={styles.addIcon} />
        <Text style={styles.addLabel}>{addLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    gap: 12,
  },
  label: {
    ...TYPOGRAPHY.subtitle2,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderWidth: 1.5,
    borderColor: BORDER_NEUTRAL_NORMAL,
    borderRadius: 12,
  },
  addIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
  addLabel: {
    ...TYPOGRAPHY.button,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
});

export default TagSelectField;
