import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Chip from '../../Data Display/Chips/Chip';
import {
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_PRIMARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

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
  placeholder = `태그를 입력해 주세요(최대 ${maxTags}개)`,
}: TagFieldProps) {
  const [draft, setDraft] = useState('');
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
    <View>
      <View style={styles.inputBox}>
        <Text style={styles.hash}>#</Text>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder={placeholder}
          placeholderTextColor={FOREGROUND_NEUTRAL_SUBTLE}
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
          blurOnSubmit={false}
          editable={canAddMore}
          numberOfLines={1}
        />
      </View>
      {tags.length > 0 && (
        <View style={styles.tagRow}>
          {tags.map((tag, index) => (
            <Chip key={`${tag}-${index}`} label={tag} onRemove={() => handleRemove(index)} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 48,
    backgroundColor: FILL_NEUTRAL_NORMAL,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  hash: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_PRIMARY,
  },
  input: {
    ...TYPOGRAPHY.subtitle4,
    flex: 1,
    padding: 0,
    color: FOREGROUND_PRIMARY,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
});

export default TagField;
