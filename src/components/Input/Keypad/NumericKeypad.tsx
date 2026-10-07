import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  FILL_NEUTRAL_NORMAL,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_PRIMARY,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

type NumericKeypadProps = {
  onPressDigit: (digit: string) => void;
  onPressDecimal: () => void;
  onBackspace: () => void;
  onConfirm: () => void;
};

type KeyDef =
  | { type: 'digit'; value: string }
  | { type: 'decimal' }
  | { type: 'backspace' }
  | { type: 'confirm' }
  | { type: 'blank' };

const ROWS: KeyDef[][] = [
  [
    { type: 'digit', value: '1' },
    { type: 'digit', value: '2' },
    { type: 'digit', value: '3' },
    { type: 'backspace' },
  ],
  [
    { type: 'digit', value: '4' },
    { type: 'digit', value: '5' },
    { type: 'digit', value: '6' },
    { type: 'confirm' },
  ],
  [
    { type: 'digit', value: '7' },
    { type: 'digit', value: '8' },
    { type: 'digit', value: '9' },
    { type: 'decimal' },
  ],
  [
    { type: 'blank' },
    { type: 'digit', value: '0' },
    { type: 'blank' },
    { type: 'blank' },
  ],
];

function NumericKeypad({
  onPressDigit,
  onPressDecimal,
  onBackspace,
  onConfirm,
}: NumericKeypadProps) {
  const handlePress = (key: KeyDef) => {
    switch (key.type) {
      case 'digit':
        onPressDigit(key.value);
        break;
      case 'decimal':
        onPressDecimal();
        break;
      case 'backspace':
        onBackspace();
        break;
      case 'confirm':
        onConfirm();
        break;
      case 'blank':
        break;
    }
  };

  return (
    <View style={styles.container}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key, keyIndex) => (
            <Key key={keyIndex} keyDef={key} onPress={() => handlePress(key)} />
          ))}
        </View>
      ))}
    </View>
  );
}

function Key({ keyDef, onPress }: { keyDef: KeyDef; onPress: () => void }) {
  if (keyDef.type === 'blank') {
    return <View style={[styles.key, styles.keyGrey]} />;
  }

  const isPrimary = keyDef.type === 'digit' || keyDef.type === 'confirm';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.key,
        isPrimary ? styles.keyWhite : styles.keyGrey,
        pressed && styles.keyPressed,
      ]}
      onPress={onPress}
      disabled={keyDef.type === 'decimal'}
    >
      <Text
        style={[
          styles.keyLabel,
          keyDef.type === 'confirm' && styles.keyLabelConfirm,
          keyDef.type === 'decimal' && styles.keyLabelDisabled,
        ]}
      >
        {keyLabel(keyDef)}
      </Text>
    </Pressable>
  );
}

function keyLabel(keyDef: KeyDef): string {
  switch (keyDef.type) {
    case 'digit':
      return keyDef.value;
    case 'decimal':
      return '.';
    case 'backspace':
      return '⌫';
    case 'confirm':
      return '이동';
    case 'blank':
      return '';
  }
}

const GAP = 8;

const styles = StyleSheet.create({
  container: {
    gap: GAP,
  },
  row: {
    flexDirection: 'row',
    gap: GAP,
  },
  key: {
    flex: 1,
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyWhite: {
    backgroundColor: FILL_NEUTRAL_SUBTLE,
  },
  keyGrey: {
    backgroundColor: FILL_NEUTRAL_NORMAL,
  },
  keyPressed: {
    opacity: 0.6,
  },
  keyLabel: {
    ...TYPOGRAPHY.h3,
    color: FOREGROUND_PRIMARY,
  },
  keyLabelConfirm: {
    ...TYPOGRAPHY.button,
    color: FOREGROUND_SECONDARY,
  },
  keyLabelDisabled: {
    color: FOREGROUND_PRIMARY,
  },
});

export default NumericKeypad;
