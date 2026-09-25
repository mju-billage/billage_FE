import {
  KeyboardTypeOptions,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { KeyboardStickyView, useKeyboardState } from 'react-native-keyboard-controller';
import TextButton from '../../Input/Button/TextButton';
import TextField from '../../Input/Text Field/TextField';
import {
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_NEUTRAL_SUBTLE,
  OVERLAY_SCRIM,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

type DialogProps = {
  visible: boolean;
  title: string;
  description?: string;
  showTextField?: boolean;
  textFieldValue?: string;
  onChangeTextField?: (text: string) => void;
  textFieldPlaceholder?: string;
  textFieldKeyboardType?: KeyboardTypeOptions;
  textFieldMaxLength?: number;
  /** 서버 fieldErrors 등 인라인 필드 에러 — 있으면 입력 필드 아래에 그대로 보여준다. */
  textFieldError?: string;
  /** true면 다이얼로그가 열리자마자 입력 필드에 자동 포커스(키보드 노출)한다. */
  autoFocusTextField?: boolean;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel?: () => void;
  onConfirm: () => void;
  /** true면 취소 버튼 없이 confirm 버튼 하나만 보여준다(단순 안내 모달용). */
  singleButton?: boolean;
  /** true면 confirm 버튼을 빨간색(파괴적 액션)으로 보여준다. */
  destructive?: boolean;
  /** true면 confirm 버튼을 비활성화한다(요청 진행 중 중복 제출 방지 등). */
  confirmDisabled?: boolean;
};

/** 제목/설명/입력필드를 조합할 수 있는 확인 모달. */
function Dialog({
  visible,
  title,
  description,
  showTextField = false,
  textFieldValue = '',
  onChangeTextField,
  textFieldPlaceholder,
  textFieldKeyboardType,
  textFieldMaxLength,
  textFieldError,
  autoFocusTextField = false,
  cancelLabel = '취소',
  confirmLabel = '확인',
  onCancel,
  onConfirm,
  singleButton = false,
  destructive = false,
  confirmDisabled = false,
}: DialogProps) {
  // 더보기_기록보관_보관제목변경.png: 키보드가 뜨면 다이얼로그가 화면 중앙이
  // 아니라 키보드 상단에 붙어서 올라온다(중앙정렬 유지한 채 밀어올리는 게
  // 아니다). 키보드가 뜬 동안만 컨테이너를
  // 하단 정렬로 바꾸고, KeyboardStickyView가 카드를 정확히 키보드 높이만큼
  // 밀어올려 키보드 상단에 딱 붙게 한다. 레이아웃이 바뀌는 시점(keyboard
  // height가 막 0을 벗어나는/거의 0으로 돌아오는 순간)엔 translateY도 0에
  // 가까워 전환이 튀지 않는다.
  const isKeyboardVisible = useKeyboardState(state => state.isVisible);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel ?? onConfirm}
    >
      <View style={[styles.overlay, isKeyboardVisible && styles.overlayDocked]}>
        <KeyboardStickyView style={styles.stickyWrapper}>
          <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            {description && <Text style={styles.description}>{description}</Text>}
            {showTextField && (
              <View style={styles.textFieldWrapper}>
                <TextField
                  value={textFieldValue}
                  onChangeText={onChangeTextField ?? (() => {})}
                  placeholder={textFieldPlaceholder ?? '텍스트'}
                  keyboardType={textFieldKeyboardType}
                  maxLength={textFieldMaxLength}
                  error={textFieldError}
                  autoFocus={autoFocusTextField}
                  onClear={onChangeTextField ? () => onChangeTextField('') : undefined}
                />
              </View>
            )}
            <View style={styles.footer}>
              {!singleButton && (
                <TextButton
                  label={cancelLabel}
                  hierarchy="tertiary"
                  onPress={onCancel ?? onConfirm}
                />
              )}
              <TextButton
                label={confirmLabel}
                hierarchy={destructive ? 'negative' : 'secondary'}
                onPress={onConfirm}
                disabled={confirmDisabled}
              />
            </View>
          </View>
        </KeyboardStickyView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: OVERLAY_SCRIM,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  overlayDocked: {
    justifyContent: 'flex-end',
    paddingBottom: 0,
  },
  // overlay가 alignItems:'center'라 자식(KeyboardStickyView)이 폭 지정 없으면
  // 콘텐츠 크기로 쪼그라든다 — card의 width:'100%'는 "그 부모"(이 뷰) 기준으로
  // 계산되므로, 이 뷰 자체를 overlay 폭 100%로 명시해야 card가 시안대로
  // 화면 폭을 채운다.
  stickyWrapper: {
    width: '100%',
  },
  card: {
    width: '100%',
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    ...TYPOGRAPHY.subtitle1,
  },
  description: {
    ...TYPOGRAPHY.body2,
    marginTop: 8,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  textFieldWrapper: {
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
});

export default Dialog;
