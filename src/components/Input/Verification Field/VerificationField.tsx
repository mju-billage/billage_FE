import { useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  BACKGROUND_PRIMARY,
  FEEDBACK_NEGATIVE_BOLD,
  FILL_DISABLED,
  FILL_NEUTRAL_NORMAL,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_DISABLED,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

type VerificationFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  length?: number;
  disabled?: boolean;
  error?: string;
};

function VerificationField({
  value,
  onChangeText,
  length = 6,
  disabled = false,
  error,
}: VerificationFieldProps) {
  const inputRef = useRef<TextInput>(null);
  const digits = Array.from({ length }, (_, index) => value[index] ?? '');

  return (
    <View>
      <Pressable
        style={styles.row}
        onPress={() => !disabled && inputRef.current?.focus()}
      >
        {digits.map((digit, index) => {
          const isActive = index === value.length;
          const isFilled = digit !== '';
          return (
            <View
              key={index}
              style={[
                styles.box,
                isFilled && !isActive && styles.boxFilled,
                isActive && !disabled && styles.boxActive,
                disabled && styles.boxDisabled,
                error && styles.boxError,
              ]}
            >
              <Text style={[styles.digit, disabled && styles.digitDisabled]}>
                {digit}
              </Text>
            </View>
          );
        })}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={value}
          onChangeText={text => onChangeText(text.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={length}
          editable={!disabled}
        />
      </Pressable>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const BOX_SIZE = 44;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 8,
    backgroundColor: FILL_NEUTRAL_NORMAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: {
    backgroundColor: BACKGROUND_PRIMARY,
  },
  boxActive: {
    borderWidth: 1,
    borderColor: FOREGROUND_SECONDARY,
    backgroundColor: FILL_NEUTRAL_SUBTLE,
  },
  boxDisabled: {
    backgroundColor: FILL_DISABLED,
  },
  boxError: {
    borderWidth: 1,
    borderColor: FEEDBACK_NEGATIVE_BOLD,
  },
  errorText: {
    ...TYPOGRAPHY.body3,
    color: FEEDBACK_NEGATIVE_BOLD,
    marginTop: 8,
  },
  digit: {
    ...TYPOGRAPHY.h3,
    color: FOREGROUND_SECONDARY,
  },
  digitDisabled: {
    color: FOREGROUND_DISABLED,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});

export default VerificationField;
