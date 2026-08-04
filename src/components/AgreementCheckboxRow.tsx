import { Pressable, StyleSheet, Text, View } from 'react-native';
import CheckBox from './Selection/CheckBox';
import { LINK_BLUE } from '../constants/colors';
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
        <View style={styles.checkboxSlot}>
          <CheckBox checked={checked} onToggle={onToggle} />
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
  checkboxSlot: {
    marginRight: 12,
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
