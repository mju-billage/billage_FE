import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { BACKGROUND_PRIMARY, BACKGROUND_SECONDARY } from '../../constants/colors';

type ScreenContainerProps = {
  /** 'primary'=목록/조회형(옅은 블루), 'secondary'=폼/입력형(흰색) — 시안 대조로
   * 확정된 화면만 지정한다. */
  background: 'primary' | 'secondary';
  edges?: readonly Edge[];
  style?: StyleProp<ViewStyle>;
  /** 키보드가 뜰 때 콘텐츠 영역을 키보드 높이만큼 줄여 하단 CTA/필드가 가려지지
   * 않게 한다(폴더_메인화면.png Case C 기준 — 콘텐츠가 줄고 하단 탭바는 키보드에
   * 가려짐). 기본 true. 입력 필드가 없는 화면 등 불필요한 경우에만 false로 꺼라. */
  avoidKeyboard?: boolean;
  /** 화면 하단(안전영역 위)에 띄울 스낵바 노드. 화면마다 absolute 래퍼를 따로 두지 않게 여기서 배치한다.
   * 콘텐츠와 같은 KeyboardAvoidingView 안에 있어 키보드가 뜨면 콘텐츠 영역과 함께 키보드 위로 올라간다. */
  snackbar?: ReactNode;
  /** 스낵바 슬롯을 기본 위치(하단 인셋 + 24)에서 위로 더 올리는 값(dp). 기본 0.
   * 하단 고정 CTA가 있는 화면에서 스낵바를 CTA 위로 올리기 위한 값.
   * 기존 bottom:88 = 24(기본) + 64(CTA 높이)에서 유래. */
  snackbarOffset?: number;
  children: React.ReactNode;
};

/** 화면 루트 컨테이너. 배경색을 화면마다 SafeAreaView에 흩뿌리지 않고 여기서 통일한다. */
function ScreenContainer({
  background,
  edges = ['top', 'bottom'],
  style,
  avoidKeyboard = true,
  snackbar,
  snackbarOffset = 0,
  children,
}: ScreenContainerProps) {
  return (
    <SafeAreaView
      style={[
        styles.container,
        background === 'primary' ? styles.primary : styles.secondary,
        style,
      ]}
      edges={edges}
    >
      <KeyboardAvoidingView style={styles.container} enabled={avoidKeyboard} behavior="height">
        {children}
        {snackbar != null && (
          <View
            style={[styles.snackbarSlot, { bottom: SNACKBAR_SLOT_INSET + snackbarOffset }]}
            pointerEvents="box-none"
          >
            {snackbar}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// 화면들이 각자 두던 snackbarWrapper(left/right/bottom 24)와 같은 값.
const SNACKBAR_SLOT_INSET = 24;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  snackbarSlot: {
    position: 'absolute',
    left: SNACKBAR_SLOT_INSET,
    right: SNACKBAR_SLOT_INSET,
  },
  primary: {
    backgroundColor: BACKGROUND_PRIMARY,
  },
  secondary: {
    backgroundColor: BACKGROUND_SECONDARY,
  },
});

export default ScreenContainer;
