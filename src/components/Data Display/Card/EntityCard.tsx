import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Avatar from '../Avatar/Avatar';
import Badge from '../Badge/Badge';
import Chip from '../Chips/Chip';
import {
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_NORMAL,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../../constants/colors';

const PLUS_ICON = require('../../../assets/icons/action/Plus.png');

type EntityCardProps =
  | {
      type: 'profile';
      name: string;
      roleLabel?: string;
      email?: string;
      avatarUri?: string;
    }
  | {
      type: 'profileEdit';
      name: string;
      roleLabel?: string;
      avatarUri?: string;
    }
  | {
      type: 'group';
      groupName: string;
      label?: string;
      memberCount: number;
      onPress?: () => void;
    }
  | { type: 'newGroup'; onPress: () => void };

/** 프로필/모임 요약 정보를 보여주는 카드. type에 따라 4가지 레이아웃을 지원한다. */
function EntityCard(props: EntityCardProps) {
  if (props.type === 'newGroup') {
    return (
      <Pressable
        style={[styles.card, styles.newGroupCard]}
        onPress={props.onPress}
      >
        <View style={styles.plusAvatar}>
          <Image source={PLUS_ICON} style={styles.plusIcon} />
        </View>
        <Text style={styles.newGroupLabel}>새로운 모임 추가하기</Text>
      </Pressable>
    );
  }

  if (props.type === 'group') {
    return (
      <Pressable
        style={[styles.card, styles.groupCard]}
        onPress={props.onPress}
      >
        <View>
          <Text style={styles.groupName}>{props.groupName}</Text>
          <Text style={styles.memberCount}>모임원 {props.memberCount}명</Text>
        </View>
        {props.label && (
          <View>
            <Badge label={props.label} status="positive" />
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.profileRow}>
        {props.avatarUri ? (
          <Avatar type="image" imageUri={props.avatarUri} />
        ) : (
          <Avatar type="initial" initial={props.name.slice(0, 1)} />
        )}
        <View style={styles.profileTextColumn}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupName}>{props.name}</Text>
            {props.roleLabel && (
              <Chip label={props.roleLabel} removable={false} />
            )}
          </View>
          {props.type === 'profile' && props.email && (
            <Text style={styles.email}>{props.email}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
    padding: 16,
  },
  newGroupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderStyle: 'dashed',
  },
  plusAvatar: {
    width: 36,
    height: 36,
    borderRadius: 36 * (7 / 24),
    backgroundColor: FILL_NEUTRAL_NORMAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    width: 16,
    height: 16,
    tintColor: FOREGROUND_NEUTRAL_NORMAL,
  },
  newGroupLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  memberCount: {
    marginTop: 6,
    fontSize: 12,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileTextColumn: {
    gap: 4,
  },
  email: {
    fontSize: 12,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
});

export default EntityCard;
