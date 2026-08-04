import { Image, StyleSheet, TextInput, View } from 'react-native';
import { BORDER_NEUTRAL, FILL_NEUTRAL } from '../../constants/colors';

const SEARCH_ICON = require('../../assets/icons/system/Search.png');

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

/** 좌측 입력 + 우측 돋보기 아이콘으로 구성된 검색 필드. */
function SearchField({
  value,
  onChangeText,
  placeholder = '검색',
  size = 'lg',
  variant = 'default',
  onSubmit,
}: SearchFieldProps) {
  return (
    <View
      style={[
        styles.container,
        size === 'sm' ? styles.containerSm : styles.containerLg,
        variant === 'outline' && styles.containerOutline,
      ]}
    >
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#ADB5BD"
        onSubmitEditing={onSubmit}
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
    backgroundColor: FILL_NEUTRAL,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL,
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  icon: {
    width: 18,
    height: 18,
    tintColor: '#868E96',
  },
});

export default SearchField;
