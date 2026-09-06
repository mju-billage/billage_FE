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

/**
 * "#태그" 형태로 입력하는 태그 필드. 최대 개수를 넘으면 입력창이 비활성화된다.
 *
 * 검증 중 발견된 [결함] 3건, 전부 이 파일 하나만 고치면 된다(다른 화면에서
 * 쓰는 곳 없음, `MemberAddIndividualScreen.tsx`가 유일한 소비자):
 *  - placeholder가 "#"으로 시작하는 문구(화면명세 원문)를 그대로 쓰면 이 컴포넌트가
 *    입력 앞에 따로 그리던 장식용 "#"과 겹쳐 "##"으로 보였다 — 입력 행의 장식용
 *    "#"을 없애고(이미 확정된 태그 칩에는 그대로 둠), placeholder 문구 자체가
 *    "#"을 갖고 오게 했다. 이러면 명세 원문을 그대로 유지하면서 겹침만 없어진다.
 *  - 긴 placeholder가 좁은 폭에서 줄바꿈됐다 — `inputRow`가 이미 붙어 있는 태그
 *    칩들과 한 줄을 억지로 나눠 쓰다 보니(flex:1이 폭을 마음대로 줄임) 좁아져서
 *    생긴 문제라, 최소 폭을 넉넉히 줘서 안 맞으면 다음 줄로 통째로 넘어가게 했다.
 *  - 태그를 하나 입력·확정(엔터)하면 `returnKeyType="done"`이 키보드를 닫아버려
 *    다음 태그를 넣으려면 필드를 다시 탭해야 했다 — `blurOnSubmit={false}`로
 *    막았다(RN이 제출 시 자동으로 blur/키보드 닫기를 안 하게 하는 표준 prop).
 *  - 태그 칩에 삭제 어포던스가 안 보여 삭제하려면 칩을 다시 눌러야 했다 —
 *    화면명세(DUE-5-PAGE-01-0)가 "태그 우측의 X 아이콘 터치 시 삭제"라고
 *    명시하므로 그대로 X 아이콘을 추가했다.
 */
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
