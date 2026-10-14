import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import {
  Edge,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { BACKGROUND_PRIMARY, BACKGROUND_SECONDARY } from '../../constants/colors';
import { BOTTOM_NAVIGATION_HEIGHT } from '../Navigation/Bottom Navigation/BottomNavigation';

type ScreenContainerProps = {
  background: 'primary' | 'secondary';
  edges?: readonly Edge[];
  style?: StyleProp<ViewStyle>;
  avoidKeyboard?: boolean;
  snackbar?: ReactNode;
  snackbarOffset?: number;
  aboveTabBar?: boolean;
  children: React.ReactNode;
};

function ScreenContainer({
  background,
  edges = ['top', 'bottom'],
  style,
  avoidKeyboard = true,
  snackbar,
  snackbarOffset = 0,
  aboveTabBar = false,
  children,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const bottomEdgeInset = edges.includes('bottom') ? insets.bottom : 0;
  const snackbarBottom = aboveTabBar
    ? BOTTOM_NAVIGATION_HEIGHT + SNACKBAR_TAB_BAR_GAP - bottomEdgeInset + snackbarOffset
    : SNACKBAR_SLOT_BOTTOM + snackbarOffset;

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
            style={[styles.snackbarSlot, { bottom: snackbarBottom }]}
            pointerEvents="box-none"
          >
            {snackbar}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const SNACKBAR_SLOT_BOTTOM = 24;
const SNACKBAR_TAB_BAR_GAP = 12;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  snackbarSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  primary: {
    backgroundColor: BACKGROUND_PRIMARY,
  },
  secondary: {
    backgroundColor: BACKGROUND_SECONDARY,
  },
});

export default ScreenContainer;
