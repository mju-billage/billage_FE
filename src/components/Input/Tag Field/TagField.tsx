import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

type TagFieldProps = {
  tags: string[];
  onChangeTags: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
};

/** "#태그" 형태로 입력하는 태그 필드. 최대 개수를 넘으면 입력창이 비활성화된다. */
function TagField({
  tags,
  onChangeTags,
  maxTags = 3,
  placeholder = `태그를 입력해 주세요(최대 ${maxTags}개)`,
}: TagFieldProps) {
  const [draft, setDraft] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const canAddMore = tags.length < maxTags;

  const handleSubmit = () => {
    const trimmed = draft.trim();
    if (!trimmed || !canAddMore) {
      return;
    }
    onChangeTags([...tags, trimmed]);
    setDraft('');
  };

  const handleRemove = (index: number) => {
    onChangeTags(tags.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      {tags.map((tag, index) => (
        <Pressable
          key={`${tag}-${index}`}
          style={styles.tag}
          onPress={() => handleRemove(index)}
        >
          <Text style={styles.hash}>#</Text>
          <Text style={styles.tagText}>{tag}</Text>
        </Pressable>
      ))}
      {canAddMore && (
        <View style={styles.inputRow}>
          <Text style={styles.hash}>#</Text>
          <TextInput
            style={[styles.input, isFocused && styles.inputFocused]}
            value={draft}
            onChangeText={setDraft}
            placeholder={placeholder}
            placeholderTextColor={FOREGROUND_DISABLED}
            onSubmitEditing={handleSubmit}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            returnKeyType="done"
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
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 120,
  },
  hash: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  tagText: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  input: {
    ...TYPOGRAPHY.body2,
    flex: 1,
    padding: 0,
    marginLeft: 2,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  inputFocused: {
    color: FOREGROUND_SECONDARY,
  },
});

export default TagField;
