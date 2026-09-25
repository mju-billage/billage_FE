import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import BackButton from './BackButton';
import {
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_PRIMARY,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

const CHEVRON_DOWN_ICON = require('../../../assets/icons/nav/Chevron Right.png');

export type AppBarType = 'titleOnly' | 'sub' | 'detailDownload' | 'imageSelect';

export type AppBarRightIcon = {
  icon: ImageSourcePropType;
  onPress: () => void;
  accessibilityLabel?: string;
};

type AppBarProps = {
  type?: AppBarType;
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  showDropdown?: boolean;
  onPressDropdown?: () => void;
  rightIcons?: AppBarRightIcon[];
  selectedCount?: number;
  showSelectionCount?: boolean;
};

function AppBar({
  type = 'sub',
  title,
  subtitle,
  onBackPress,
  showDropdown = false,
  onPressDropdown,
  rightIcons,
  selectedCount,
  showSelectionCount = true,
}: AppBarProps) {
  const titleNode = (
    <View style={styles.titleRow}>
      <Text
        style={type === 'sub' ? styles.titleBold : styles.title}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
      {showDropdown && type !== 'sub' && (
        <Pressable onPress={onPressDropdown} hitSlop={8}>
          <Image source={CHEVRON_DOWN_ICON} style={styles.dropdownIcon} />
        </Pressable>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {type !== 'titleOnly' && (
          <BackButton onPress={onBackPress ?? (() => {})} size={34} />
        )}

        {type === 'detailDownload' ? (
          <View style={styles.detailColumn}>
            <Text style={styles.detailLabel} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
            {subtitle && <Text style={styles.detailSubtitle}>{subtitle}</Text>}
          </View>
        ) : type !== 'imageSelect' ? (
          titleNode
        ) : null}
      </View>

      {type === 'imageSelect' && (
        <View style={styles.centerRow}>{titleNode}</View>
      )}

      <View style={styles.rightRow}>
        {type === 'imageSelect' ? (
          showSelectionCount && (
            <Text style={styles.selectedCountText}>
              {selectedCount ? `${selectedCount} 선택` : '선택'}
            </Text>
          )
        ) : (
          rightIcons?.map((rightIcon, index) => (
            <Pressable
              key={index}
              onPress={rightIcon.onPress}
              hitSlop={8}
              accessibilityLabel={rightIcon.accessibilityLabel}
            >
              <Image source={rightIcon.icon} style={styles.rightIcon} />
            </Pressable>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  centerRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  title: {
    ...TYPOGRAPHY.h2,
    flexShrink: 1,
  },
  titleBold: {
    ...TYPOGRAPHY.h2,
    flexShrink: 1,
  },
  dropdownIcon: {
    width: 16,
    height: 16,
    tintColor: FOREGROUND_PRIMARY,
    transform: [{ rotate: '90deg' }],
  },
  detailColumn: {
    gap: 2,
    flexShrink: 1,
  },
  detailLabel: {
    ...TYPOGRAPHY.subtitle3,
  },
  detailSubtitle: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rightIcon: {
    width: 24,
    height: 24,
  },
  selectedCountText: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_SECONDARY,
  },
});

export default AppBar;
