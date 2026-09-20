import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import CheckBox from './CheckBox';
import { FOREGROUND_DISABLED, FOREGROUND_SECONDARY } from '../../../constants/colors';
import {
  AGREEMENT_TAG_REQUIRED,
  AGREEMENT_TAG_OPTIONAL,
} from '../../../constants/commonText';
import { TYPOGRAPHY } from '../../../constants/typography';

const CHEVRON_RIGHT_ICON = require('../../../assets/icons/nav/Chevron Right.png');

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
          {tag && (
            <Text style={tag === AGREEMENT_TAG_REQUIRED ? styles.tagRequired : undefined}> ({tag})</Text>
          )}
        </Text>
      </Pressable>
      {onPressDetail && (
        <Pressable onPress={onPressDetail} hitSlop={8}>
          <Image source={CHEVRON_RIGHT_ICON} style={styles.chevron} />
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
    ...TYPOGRAPHY.body2,
  },
  labelEmphasized: {
    ...TYPOGRAPHY.subtitle1,
  },
  // 시안 실측(회원가입_약관동의.png 픽셀): `(필수)`만 파랑이고 `(선택)`은 본문과 같은 색이다.
  tagRequired: {
    color: FOREGROUND_SECONDARY,
  },
  chevron: {
    width: 16,
    height: 16,
    tintColor: FOREGROUND_DISABLED,
    marginHorizontal: 4,
  },
});

export default AgreementCheckboxRow;
