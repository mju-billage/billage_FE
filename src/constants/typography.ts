// Typography Style.pdf / Primitive Typography.pdf 기준 타이포그래피 시맨틱 스타일.
// PyeojinGothic-Regular/-Bold는 TTF name table상 같은 Family("Pyeojin Gothic")로 묶여
// fontWeight:'bold'로 굵기를 고를 수 있지만, Medium/Semi-bold/Light는 각자 독립된
// Family라서 fontWeight로 못 고르고 fontFamily 자체를 바꿔야 한다.
// letterSpacing 값 출처: Typography Style.pdf (2-1 Typography Style).
const FONT_FAMILY = {
  light: 'Pyeojin Gothic Light',
  regular: 'Pyeojin Gothic',
  medium: 'Pyeojin Gothic Medium',
  semibold: 'Pyeojin Gothic Semi-bold',
  bold: 'Pyeojin Gothic',
} as const;

export const TYPOGRAPHY = {
  h1: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: 'bold' as const,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
  },
  h2: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.15,
  },
  h3: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  subtitle1: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  subtitle2: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  subtitle3: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  subtitle4: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  body1: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  body2: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  body3: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.25,
  },
  button: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 1.25,
  },
  chips: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  badge: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.5,
  },
  caption: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 8,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  overline: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 10,
    lineHeight: 18,
    letterSpacing: 0.4,
  },
} as const;
