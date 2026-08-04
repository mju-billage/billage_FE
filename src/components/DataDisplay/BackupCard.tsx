import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../Button/Button';
import {
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';

const EDIT_ICON = require('../../assets/icons/action/Edit.png');
const CLOSE_ICON = require('../../assets/icons/action/Close.png');

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
    <View style={styles.card}>
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
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderRadius: 12,
    padding: 16,
  },
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
    fontSize: 15,
    fontWeight: 'bold',
  },
  smallIcon: {
    width: 16,
    height: 16,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
  meta: {
    marginTop: 6,
    fontSize: 12,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  footer: {
    marginTop: 12,
  },
});

export default BackupCard;
