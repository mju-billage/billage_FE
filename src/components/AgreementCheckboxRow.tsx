import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LINK_BLUE, NAVY } from '../constants/colors';
import {
  AGREEMENT_TAG_REQUIRED,
  AGREEMENT_TAG_OPTIONAL,
} from '../constants/commonText';

type AgreementCheckboxRowProps = {
  label: string;
  checked: boolean;
  onToggle: () => void;
  tag?: typeof AGREEMENT_TAG_REQUIRED | typeof AGREEMENT_TAG_OPTIONAL;
  onPressDetail?: () => void;
  emphasized?: boolean;
};

/** 약관 동의 화면의 체크박스 한 줄: 라벨, 필수/선택 태그, 상세 화면 이동 화살표를 보여준다. */
function AgreementCheckboxRow({
  label,
  checked,
  onToggle,
  tag,
  onPressDetail,
  emphasized = false,
}: AgreementCheckboxRowProps) {
  return (
    <View style={styles.row}>
      <Pressable style={styles.tapArea} onPress={onToggle}>
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={[styles.label, emphasized && styles.labelEmphasized]}>
          {label}
          {tag && <Text style={styles.tag}> ({tag})</Text>}
        </Text>
      </Pressable>
      {onPressDetail && (
        <Pressable onPress={onPressDetail} hitSlop={8}>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  tapArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CED4DA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 15,
  },
  labelEmphasized: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  tag: {
    color: LINK_BLUE,
  },
  chevron: {
    fontSize: 20,
    color: '#ADB5BD',
    paddingHorizontal: 4,
  },
});

export default AgreementCheckboxRow;
