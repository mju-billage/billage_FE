import { useState } from 'react';
import { Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
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
        style={styles.input}
        cursorColor={FOREGROUND_SECONDARY}
        selectionColor={FOREGROUND_SECONDARY}
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
  containerOutlineFocused: {
    borderColor: FOREGROUND_SECONDARY,
  },
  input: {
    ...TYPOGRAPHY.body2,
    flex: 1,
    padding: 0,
    color: FOREGROUND_NEUTRAL_NORMAL,
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
