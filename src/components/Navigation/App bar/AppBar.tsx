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
  /** titleOnly=뒤로가기 없음/드롭다운 가능, sub=뒤로가기+굵은 타이틀(실사용 기본형),
   * detailDownload=뒤로가기+2줄 타이틀+다운로드, imageSelect=뒤로가기+중앙 타이틀+선택 개수. */
  type?: AppBarType;
  title: string;
  /** detailDownload 전용 2번째 줄 (예: YY.MM.DD). */
  subtitle?: string;
  onBackPress?: () => void;
  showDropdown?: boolean;
  onPressDropdown?: () => void;
  /** titleOnly/sub=벨+닫기 등 최대 2개, detailDownload=다운로드 1개, imageSelect는 사용 안 함. */
  rightIcons?: AppBarRightIcon[];
  /** imageSelect 전용 우측 텍스트("N 선택")의 N. */
  selectedCount?: number;
  /** imageSelect 전용. false면 우측 "선택"/"N 선택" 텍스트를 아예 숨긴다(단일
   * 선택이라 확인 버튼이 따로 없는 화면용, 예: 모임 프로필 이미지 선택). */
  showSelectionCount?: boolean;
};

/** 상단 앱바. type에 따라 titleOnly/sub/detailDownload/imageSelect 4가지 레이아웃을 지원한다. */
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
            <Text style={styles.detailLabel} numberOfLines={1}>
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
  },
  title: {
    ...TYPOGRAPHY.h2,
  },
  titleBold: {
    ...TYPOGRAPHY.h2,
  },
  dropdownIcon: {
    width: 16,
    height: 16,
    tintColor: FOREGROUND_PRIMARY,
    transform: [{ rotate: '90deg' }],
  },
  detailColumn: {
    gap: 2,
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
