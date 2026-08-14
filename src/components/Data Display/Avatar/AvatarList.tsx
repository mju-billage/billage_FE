import { StyleSheet, Text, View } from 'react-native';
import Avatar from './Avatar';
import { BLUE_100, BLUE_500 } from '../../../constants/colors';

type AvatarListMember = {
  id: string;
  name: string;
  imageUri?: string;
};

type AvatarListProps = {
  members: AvatarListMember[];
  maxVisible?: number;
  showIndicator?: boolean;
};

const AVATAR_SIZE = 28;
const CORNER_RADIUS = AVATAR_SIZE * (7 / 24);

/** 이니셜/이미지 아바타가 겹쳐진 캡슐형 인원 목록. maxVisible을 넘으면 "+n"으로 표시한다. */
function AvatarList({
  members,
  maxVisible = 3,
  showIndicator = true,
}: AvatarListProps) {
  const visibleMembers = members.slice(0, maxVisible);
  const overflowCount = members.length - visibleMembers.length;

  return (
    <View style={styles.container}>
      {visibleMembers.map((member, index) => (
        <View
          key={member.id}
          style={[styles.avatarWrapper, index > 0 && styles.avatarOverlap]}
        >
          {member.imageUri ? (
            <Avatar type="image" imageUri={member.imageUri} size="sm" />
          ) : (
            <Avatar
              type="initial"
              initial={member.name.slice(0, 1)}
              size="sm"
            />
          )}
        </View>
      ))}
      {overflowCount > 0 && showIndicator && (
        <View style={[styles.overflow, styles.avatarOverlap]}>
          <Text style={styles.overflowText}>+{overflowCount}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    borderRadius: CORNER_RADIUS,
  },
  avatarOverlap: {
    marginLeft: -10,
  },
  overflow: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: CORNER_RADIUS,
    backgroundColor: BLUE_100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: 'bold',
    color: BLUE_500,
    textAlign: 'center',
  },
});

export default AvatarList;
