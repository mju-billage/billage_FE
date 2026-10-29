import { useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_INVERSE,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_PRIMARY,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

const SEARCH_ICON = require('../../../assets/icons/system/Search.png');
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
  autoFocus?: boolean;
  onClear?: () => void;
};

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
  const inputRef = useRef<TextInput>(null);

  const handleClear = () => {
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <View
      style={[
        styles.container,
        size === 'sm' ? styles.containerSm : styles.containerLg,
        variant === 'outline' && styles.containerOutline,
      ]}
    >
      <TextInput
        ref={inputRef}
        style={styles.input}
        cursorColor={FOREGROUND_SECONDARY}
        selectionColor={FOREGROUND_SECONDARY}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={FOREGROUND_NEUTRAL_SUBTLE}
        onSubmitEditing={onSubmit}
        autoFocus={autoFocus}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
      />
      {onClear && isFocused && value.length > 0 && (
        <Pressable
          onPress={handleClear}
          hitSlop={8}
          accessibilityLabel="검색어 지우기"
          style={styles.clearButton}
        >
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
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  containerSm: {
    height: 36,
  },
  containerLg: {
    height: 48,
  },
  containerOutline: {
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
  },
  input: {
    ...TYPOGRAPHY.body2,
    flex: 1,
    padding: 0,
    color: FOREGROUND_PRIMARY,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: FOREGROUND_NEUTRAL_NORMAL,
  },
  clearButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: FOREGROUND_NEUTRAL_SUBTLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  clearIcon: {
    width: 10,
    height: 10,
    tintColor: FOREGROUND_INVERSE,
  },
});

export default SearchField;
