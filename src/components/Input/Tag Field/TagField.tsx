import { useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

const CLOSE_ICON = require('../../../assets/icons/action/Close.png');

type TagFieldProps = {
  tags: string[];
  onChangeTags: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
};

function TagField({
  tags,
  onChangeTags,
  maxTags = 3,
  placeholder = `#태그를 입력해 주세요(최대 ${maxTags}개)`,
}: TagFieldProps) {
  const [draft, setDraft] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const canAddMore = tags.length < maxTags;

  const handleSubmit = () => {
    const trimmed = draft.trim();
    if (!trimmed || !canAddMore) {
      return;
    }
    onChangeTags([...tags, trimmed]);
    setDraft('');
    inputRef.current?.focus();
  };

  const handleRemove = (index: number) => {
    onChangeTags(tags.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      {tags.map((tag, index) => (
        <View key={`${tag}-${index}`} style={styles.tag}>
          <Text style={styles.hash}>#</Text>
          <Text style={styles.tagText}>{tag}</Text>
          <Pressable onPress={() => handleRemove(index)} hitSlop={8}>
            <Image source={CLOSE_ICON} style={styles.removeIcon} />
          </Pressable>
        </View>
      ))}
      {canAddMore && (
        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={[styles.input, isFocused && styles.inputFocused]}
            value={draft}
            onChangeText={setDraft}
            placeholder={placeholder}
            placeholderTextColor={FOREGROUND_DISABLED}
            onSubmitEditing={handleSubmit}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            returnKeyType="done"
            blurOnSubmit={false}
            numberOfLines={1}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    backgroundColor: FILL_NEUTRAL_NORMAL,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 220,
  },
  hash: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  tagText: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  removeIcon: {
    width: 12,
    height: 12,
    marginLeft: 2,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
  input: {
    ...TYPOGRAPHY.body2,
    flex: 1,
    padding: 0,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  inputFocused: {
    color: FOREGROUND_SECONDARY,
  },
});

export default TagField;
