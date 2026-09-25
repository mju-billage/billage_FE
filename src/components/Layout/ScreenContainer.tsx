import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { BACKGROUND_PRIMARY, BACKGROUND_SECONDARY } from '../../constants/colors';

type ScreenContainerProps = {
  background: 'primary' | 'secondary';
  edges?: readonly Edge[];
  style?: StyleProp<ViewStyle>;
  avoidKeyboard?: boolean;
  snackbar?: ReactNode;
  snackbarOffset?: number;
  children: React.ReactNode;
};

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
