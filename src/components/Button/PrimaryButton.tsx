import { Pressable, StyleSheet, Text } from 'react-native';
import { NAVY } from '../../constants/colors';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
};

/**
 * 전체 너비 기본 액션 버튼.
 * `disabled`는 비활성(터치 불가) 상태, `variant="secondary"`는 활성 상태를 유지한 채
 * 보조 액션임을 나타내는 연한 배경 스타일이다.
 */
function PrimaryButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
}: PrimaryButtonProps) {
  const isMuted = disabled || variant === 'secondary';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isMuted ? styles.muted : styles.enabled,
        pressed && !disabled && { opacity: 0.8 },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={isMuted ? styles.mutedLabel : styles.enabledLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enabled: {
    backgroundColor: NAVY,
  },
  muted: {
    backgroundColor: '#F1F3F5',
  },
  enabledLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mutedLabel: {
    color: '#ADB5BD',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PrimaryButton;
