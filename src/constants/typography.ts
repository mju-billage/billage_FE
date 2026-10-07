// 안드로이드는 MainApplication.kt에서 res/font/pyeojin_gothic.xml을 'Pyeojin Gothic'
// 패밀리로 등록한다. 굵기는 fontFamily가 아니라 fontWeight로 고른다
// (300 Light / 400 Regular / 500 Medium / 600 Semi-bold / 700 Bold).
export const FONT_FAMILY = 'Pyeojin Gothic';

export const FONT_WEIGHT = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const TYPOGRAPHY = {
  h1: {
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHT.bold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
  },
  h2: {
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHT.semibold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.15,
  },
  h3: {
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHT.semibold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  subtitle1: {
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHT.semibold,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  subtitle2: {
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHT.medium,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  subtitle3: {
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHT.semibold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  subtitle4: {
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHT.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  body1: {
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHT.regular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  body2: {
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHT.regular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  body3: {
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHT.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.25,
  },
  button: {
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHT.semibold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 1.25,
  },
  chips: {
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHT.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  badge: {
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHT.semibold,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.5,
  },
  caption: {
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHT.regular,
    fontSize: 8,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  overline: {
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHT.regular,
    fontSize: 10,
    lineHeight: 18,
    letterSpacing: 0.4,
  },
} as const;
