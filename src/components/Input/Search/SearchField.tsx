import { useState } from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_NORMAL,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';

const SEARCH_ICON = require('../../../assets/icons/system/Search.png');

type SearchFieldSize = 'sm' | 'lg';
type SearchFieldVariant = 'default' | 'outline';

type SearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  size?: SearchFieldSize;
  variant?: SearchFieldVariant;
  onSubmit?: () => void;
};

/** 좌측 입력 + 우측 돋보기 아이콘으로 구성된 검색 필드. outline 변형은 포커스 시 테두리가 파란색으로 바뀐다. */
function SearchField({
  value,
  onChangeText,
  placeholder = '검색',
  size = 'lg',
  variant = 'default',
  onSubmit,
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
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
      />
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
    flex: 1,
    fontSize: 14,
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
});

export default SearchField;
