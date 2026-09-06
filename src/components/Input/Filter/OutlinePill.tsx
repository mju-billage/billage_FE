import { Pressable, StyleSheet, Text } from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

type OutlinePillProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

/**
 * 단일 선택 세그먼트용 아웃라인 버튼 — 선택 시 파란 테두리+파란 글자(흰 배경
 * 유지), 비선택은 회색 테두리+회색 글자. `FilterPill`(선택 시 배경이 채워지는
 * 알약형, `TransactionFilterSheet`가 씀)과 방향이 반대라 그 컴포넌트를 고치지
 * 않고 형제로 새로 만들었다(보고서 "구분" 세그먼트, `더보기_보고서생성하기_
 * 장부별.png` Case A).
 */
function OutlinePill({ label, active, onPress }: OutlinePillProps) {
  return (
    <Pressable style={[styles.pill, active && styles.pillActive]} onPress={onPress}>
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
    borderRadius: 8,
    paddingVertical: 10,
    backgroundColor: FILL_NEUTRAL_SUBTLE,
  },
  pillActive: {
    borderColor: FOREGROUND_SECONDARY,
  },
  label: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  labelActive: {
    color: FOREGROUND_SECONDARY,
    fontWeight: 'bold',
  },
});

export default OutlinePill;
