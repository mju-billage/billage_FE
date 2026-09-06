import { StyleSheet, View } from 'react-native';
import { BORDER_NEUTRAL_NORMAL } from '../../../constants/colors';

type DividerOrientation = 'horizontal' | 'vertical';
type DividerVariant = 'full-width' | 'inset' | 'thick' | 'dashed';

type DividerProps = {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
};

/** 콘텐츠를 구분하는 얇은 선. 가로/세로, full-width/inset/thick/dashed 스타일을 지원한다. */
function Divider({
  orientation = 'horizontal',
  variant = 'full-width',
}: DividerProps) {
  const isVertical = orientation === 'vertical';
  const thickness = variant === 'thick' ? 4 : 1;

  if (variant === 'dashed') {
    return <View style={styles.dashed} />;
  }

  return (
    <View
      style={[
        isVertical ? styles.vertical : styles.horizontal,
        variant === 'inset' &&
          (isVertical ? styles.insetVertical : styles.insetHorizontal),
        isVertical ? { width: thickness } : { height: thickness },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    width: '100%',
    backgroundColor: BORDER_NEUTRAL_NORMAL,
  },
  vertical: {
    // `height: '100%'`였다가 [치명2]로 정정: 세로 Divider가 항상 높이 미확정인
    // 부모(예: `alignItems:'stretch'`로만 키가 정해지는 행) 안에 있으면, '%'
    // 기준이 될 부모 높이가 그 자체로 순환 의존이라 Yoga가 잘못된(비정상적으로
    // 큰) 값으로 풀어버릴 수 있다 — DuesStatusCard에서 실측 카드 높이가
    // 242dp여야 할 게 604dp로 부풀어 있었다(원인: 이 스타일). 부모가 이미
    // `alignItems:'stretch'`로 감싸는 상황뿐이라 `flex: 1`로 형제와 같은 높이를
    // 채우게 하면 같은 결과를 순환 의존 없이 얻는다.
    flex: 1,
    backgroundColor: BORDER_NEUTRAL_NORMAL,
  },
  insetHorizontal: {
    marginHorizontal: 24,
    width: undefined,
  },
  insetVertical: {
    marginVertical: 12,
    height: undefined,
  },
  dashed: {
    width: '100%',
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: BORDER_NEUTRAL_NORMAL,
  },
});

export default Divider;
