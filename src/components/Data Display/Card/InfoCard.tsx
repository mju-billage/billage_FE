import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Chip from '../Chips/Chip';
import CardBase from './CardBase';
import {
  FEEDBACK_NEGATIVE_BOLD,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

const CHEVRON_RIGHT_ICON = require('../../../assets/icons/nav/Chevron Right.png');

type InfoCardField = {
  label: string;
  value?: string;
  required?: boolean;
};

type InfoCardProps = {
  fields: InfoCardField[];
  tags?: string[];
  onRemoveTag?: (index: number) => void;
  onAddTag?: () => void;
  memo?: string;
  memoPlaceholder?: string;
};

/** 필드 목록 + 태그 + 메모를 보여주는 점선 정보 카드. */
function InfoCard({
  fields,
  tags,
  onRemoveTag,
  onAddTag,
  memo,
  memoPlaceholder = '메모를 입력해주세요.',
}: InfoCardProps) {
  return (
    <CardBase variant="dashed">
      {fields.map(field => (
        <View key={field.label} style={styles.fieldColumn}>
          <Text style={styles.fieldLabel}>
            {field.label}
            {field.required && <Text style={styles.required}>*</Text>}
          </Text>
          <Text
            style={[styles.fieldValue, !field.value && styles.fieldValueEmpty]}
          >
            {field.value}
          </Text>
        </View>
      ))}

      {tags && (
        <View style={styles.tagSection}>
          <View style={styles.tagHeaderRow}>
            <Text style={styles.fieldLabel}>
              태그<Text style={styles.required}>*</Text>
            </Text>
            {onAddTag && (
              <Pressable style={styles.addTagRow} onPress={onAddTag}>
                <Text style={styles.addTagText}>추가하기</Text>
                <Image source={CHEVRON_RIGHT_ICON} style={styles.chevron} />
              </Pressable>
            )}
          </View>
          <View style={styles.tagList}>
            {tags.map((tag, index) => (
              <Chip
                key={`${tag}-${index}`}
                label={tag}
                onRemove={() => onRemoveTag?.(index)}
              />
            ))}
          </View>
        </View>
      )}

      {memo !== undefined && (
        <View style={styles.memoSection}>
          <Text style={styles.fieldLabel}>메모</Text>
          <Text style={memo ? styles.memoText : styles.memoPlaceholder}>
            {memo || memoPlaceholder}
          </Text>
        </View>
      )}
    </CardBase>
  );
}

const styles = StyleSheet.create({
  fieldColumn: {
    gap: 4,
    paddingVertical: 6,
  },
  fieldLabel: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  required: {
    color: FEEDBACK_NEGATIVE_BOLD,
  },
  fieldValue: {
    ...TYPOGRAPHY.subtitle3,
  },
  // subtitle3(SemiBold)는 별도 fontFamily라 fontWeight 오버레이가 안 먹혀서
  // 빈 값 상태는 스타일 객체 자체를 Regular 계열로 통째로 바꾼다.
  fieldValueEmpty: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_DISABLED,
  },
  tagSection: {
    marginTop: 8,
  },
  tagHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  addTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // 12px+Bold 조합은 정식 스타일에 없어 body3+bold를 예외로 채택.
  addTagText: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_SECONDARY,
    fontWeight: 'bold',
  },
  chevron: {
    width: 14,
    height: 14,
    marginTop: 1,
    tintColor: FOREGROUND_SECONDARY,
  },
  memoSection: {
    marginTop: 12,
  },
  memoText: {
    ...TYPOGRAPHY.body3,
    marginTop: 4,
  },
  memoPlaceholder: {
    ...TYPOGRAPHY.body3,
    marginTop: 4,
    color: FOREGROUND_DISABLED,
  },
});

export default InfoCard;
