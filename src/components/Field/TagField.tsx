import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_DISABLED,
  FOREGROUND_SECONDARY,
} from '../../constants/colors';

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
          <Text style={styles.tagText}>#{tag}</Text>
        </Pressable>
      ))}
      {canAddMore && (
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder={placeholder}
          placeholderTextColor={FOREGROUND_DISABLED}
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
        />
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
    borderBottomWidth: 1,
    borderBottomColor: BORDER_NEUTRAL_NORMAL,
    paddingVertical: 8,
  },
  tag: {
    backgroundColor: FILL_NEUTRAL_NORMAL,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: FOREGROUND_SECONDARY,
  },
  input: {
    flex: 1,
    minWidth: 120,
    fontSize: 14,
    padding: 0,
  },
});

export default TagField;
