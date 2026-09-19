import { useState } from 'react';
import { Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_NORMAL,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

const SEARCH_ICON = require('../../../assets/icons/system/Search.png');
// 지우기 아이콘은 `TextField`와 같은 에셋을 쓴다(동그라미 X 에셋은 없다).
const CLEAR_ICON = require('../../../assets/icons/action/Close.png');

type SearchFieldSize = 'sm' | 'lg';
type SearchFieldVariant = 'default' | 'outline';

type SearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  size?: SearchFieldSize;
  variant?: SearchFieldVariant;
  onSubmit?: () => void;
  /** true면 화면이 열리자마자 입력 필드에 자동 포커스(키보드 노출)한다. `Dialog.autoFocusTextField`와 같은 방식. */
  autoFocus?: boolean;
  /** 주면 값이 있을 때만 돋보기 왼쪽에 지우기(X) 아이콘을 보여주고, 누르면 이걸 호출한다. */
  onClear?: () => void;
};

/** 좌측 입력 + 우측 돋보기 아이콘으로 구성된 검색 필드. outline 변형은 흰 바탕 + 테두리이고 포커스 시 테두리가 파란색으로 바뀐다. */
function SearchField({
  value,
  onChangeText,
  placeholder = '검색',
  size = 'lg',
  variant = 'default',
  onSubmit,
  autoFocus = false,
  onClear,
}: SearchFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[
        styles.container,
        size === 'sm' ? styles.containerSm : styles.containerLg,
        variant === 'outline' && styles.containerOutline,
        variant === 'outline' && isFocused && styles.containerOutlineFocused,
      ]}
    >
      <TextInput
        style={[styles.input, isFocused && styles.inputFocused]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={FOREGROUND_DISABLED}
        onSubmitEditing={onSubmit}
        autoFocus={autoFocus}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
      />
      {onClear && value.length > 0 && (
        <Pressable onPress={onClear} hitSlop={8} accessibilityLabel="검색어 지우기">
          <Image source={CLEAR_ICON} style={styles.clearIcon} />
        </Pressable>
      )}
      <Image source={SEARCH_ICON} style={styles.icon} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FILL_NEUTRAL_NORMAL,
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  containerSm: {
    height: 36,
  },
  containerLg: {
    height: 44,
  },
  containerOutline: {
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
  },
  containerOutlineFocused: {
    borderColor: FOREGROUND_SECONDARY,
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
  icon: {
    width: 18,
    height: 18,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
  clearIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
});

export default SearchField;
