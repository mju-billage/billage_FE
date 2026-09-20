import { Pressable, StyleSheet, Text } from 'react-native';
import {
  FILL_DISABLED,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_DISABLED,
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
 * 유지), 비선택은 회색(Disabled) 채움 + 회색 글자, 테두리 없음(명세 No.4
 * [상태], `더보기_보고서생성하기_장부별.png`). 내용 폭만 차지하고 좌측에
 * 모인다 — `flex:1`을 안 준다(같은 시트, 화면 폭 3등분 아님). `FilterPill`
 * (선택 시 배경이 채워지는 알약형, `TransactionFilterSheet`가 씀)과 방향이
 * 반대라 그 컴포넌트를 고치지 않고 형제로 새로 만들었다.
 */
function OutlinePill({ label, active, onPress }: OutlinePillProps) {
  return (
    <Pressable style={[styles.pill, active ? styles.pillActive : styles.pillInactive]} onPress={onPress}>
      <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pillActive: {
    borderWidth: 1,
    borderColor: FOREGROUND_SECONDARY,
    backgroundColor: FILL_NEUTRAL_SUBTLE,
  },
  pillInactive: {
    backgroundColor: FILL_DISABLED,
  },
  label: {
    ...TYPOGRAPHY.body2,
  },
  labelActive: {
    color: FOREGROUND_SECONDARY,
    fontWeight: 'bold',
  },
  labelInactive: {
    color: FOREGROUND_DISABLED,
  },
});

export default OutlinePill;
