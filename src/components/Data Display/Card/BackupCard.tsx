import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../../Input/Button/Button';
import CardBase from './CardBase';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

const EDIT_ICON = require('../../../assets/icons/action/Edit.png');
const CLOSE_ICON = require('../../../assets/icons/action/Close.png');

type BackupCardProps = {
  title: string;
  dateTimeLabel: string;
  capacityLabel: string;
  onEditTitle?: () => void;
  onDelete?: () => void;
  onViewRecords: () => void;
};

/** 폴더 백업 카드: 제목 수정/삭제, 백업 정보, 기록보기 버튼으로 구성된다. */
function BackupCard({
  title,
  dateTimeLabel,
  capacityLabel,
  onEditTitle,
  onDelete,
  onViewRecords,
}: BackupCardProps) {
  return (
    <CardBase>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {onEditTitle && (
            <Pressable onPress={onEditTitle} hitSlop={8}>
              <Image source={EDIT_ICON} style={styles.smallIcon} />
            </Pressable>
          )}
        </View>
        {onDelete && (
          <Pressable onPress={onDelete} hitSlop={8}>
            <Image source={CLOSE_ICON} style={styles.smallIcon} />
          </Pressable>
        )}
      </View>
      <Text style={styles.meta}>{dateTimeLabel}</Text>
      <Text style={styles.meta}>{capacityLabel}</Text>
      <View style={styles.footer}>
        <Button
          label="기록보기"
          onPress={onViewRecords}
          hierarchy="secondary"
          fullWidth
        />
      </View>
    </CardBase>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    ...TYPOGRAPHY.subtitle3,
  },
  smallIcon: {
    width: 16,
    height: 16,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
  meta: {
    marginTop: 6,
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  footer: {
    marginTop: 12,
  },
});

export default BackupCard;
