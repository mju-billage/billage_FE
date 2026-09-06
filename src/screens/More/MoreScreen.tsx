/** @screen ETC-1-PAGE-01-0 더보기 메인 */
import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import IconButton from '../../components/Input/Button/IconButton';
import CardBase from '../../components/Data Display/Card/CardBase';
import AvatarList from '../../components/Data Display/Avatar/AvatarList';
import ToolsMenu from '../../components/Navigation/Menu/ToolsMenu';
import Button from '../../components/Input/Button/Button';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import GroupSwitcherMenu from '../GroupManager/GroupSwitcherMenu';
import { getActiveGroup, getCachedGroups, setActiveGroup } from '../../types/group';
import * as groupService from '../../services/groupService';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import { ApiError } from '../../services/apiClient';
import {
  MORE_EMPTY_ADD_LABEL,
  MORE_EMPTY_MESSAGE,
  MORE_LOADING,
  MORE_MEMBER_CARD_ADD,
  MORE_MEMBER_CARD_TITLE,
  MORE_MEMBER_CARD_VIEW_ALL,
  MORE_MENU_ARCHIVE,
  MORE_MENU_GROUP_MANAGE,
  MORE_MENU_RECEIPT_ALBUM,
  MORE_MENU_REPORT,
  MORE_MENU_STATISTICS,
  MORE_RETRY_LABEL,
  SNACKBAR_GROUP_SWITCHED_PREFIX,
  SNACKBAR_GROUP_SWITCHED_SUFFIX,
} from '../../constants/groupManagerScreenText';
import { DASHBOARD_NOTIFICATION_ACCESSIBILITY_LABEL } from '../../constants/dashboardScreenText';
import { BLUE_50, FOREGROUND_DISABLED, FOREGROUND_SECONDARY } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type LoadState = 'loading' | 'error' | 'ready';

const SNACKBAR_AUTO_HIDE_MS = 1600;

const CHEVRON_DOWN_ICON = require('../../assets/icons/nav/Chevron Down.png');
const GROUP_ICON = require('../../assets/icons/user/Group.png');
const REPORT_ICON = require('../../assets/icons/content/Report.png');
const ALBUM_ICON = require('../../assets/icons/content/Image.png');
const STATISTICS_ICON = require('../../assets/icons/content/Graph.png');
const ARCHIVE_ICON = require('../../assets/icons/action/Backup.png');
const SETTING_ICON = require('../../assets/icons/system/Setting.png');

type MoreScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

/** 더보기 탭 메인 화면: 모임 전환, 모임원 미리보기, 모임 관리/보고서/증빙자료/통계/보관함/설정 진입점. */
function MoreScreen() {
  const navigation = useNavigation<MoreScreenNavigationProp>();
  const [group, setGroup] = useState(getActiveGroup());
  const [switcherVisible, setSwitcherVisible] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [switchSnackbarMessage, setSwitchSnackbarMessage] = useState<
    string | null
  >(null);

  const loadGroups = useCallback(async () => {
    setLoadState('loading');
    try {
      await groupService.getMyGroups();
      setGroup(getActiveGroup());
      setLoadState('ready');
    } catch (error) {
      setErrorMessage(
        isNetworkError(error)
          ? API_NETWORK_ERROR_MESSAGE
          : error instanceof ApiError
          ? getApiErrorMessage(error.code)
          : API_ERROR_DEFAULT_MESSAGE,
      );
      setLoadState('error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, [loadGroups]),
  );

  if (loadState === 'loading') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{MORE_LOADING}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loadState === 'error') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <Button label={MORE_RETRY_LABEL} onPress={loadGroups} hierarchy="secondary" style={{ alignSelf: 'center' }} />
        </View>
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{MORE_EMPTY_MESSAGE}</Text>
          <Button
            label={MORE_EMPTY_ADD_LABEL}
            onPress={() => navigation.navigate('AllGroups')}
            style={styles.stateButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const cachedGroups = getCachedGroups();
  const otherGroups = cachedGroups
    .filter(item => item.id !== group.id)
    .map(item => ({ id: item.id, name: item.name }));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerRow}>
          <Pressable
            style={styles.groupNameRow}
            onPress={() => setSwitcherVisible(true)}
          >
            <Text style={styles.groupName}>{group.name}</Text>
            <Image source={CHEVRON_DOWN_ICON} style={styles.chevronIcon} />
          </Pressable>
          <IconButton
            icon={SETTING_ICON}
            onPress={() => navigation.navigate('Settings')}
            accessibilityLabel={DASHBOARD_NOTIFICATION_ACCESSIBILITY_LABEL}
          />
        </View>

        <CardBase style={styles.memberCard}>
          <View style={styles.memberCardHeader}>
            <Text style={styles.memberCardTitle}>{MORE_MEMBER_CARD_TITLE}</Text>
            <Pressable
              style={styles.viewAllRow}
              onPress={() => navigation.navigate('AllGroups')}
            >
              <Text style={styles.viewAllText}>
                {otherGroups.length > 0
                  ? MORE_MEMBER_CARD_VIEW_ALL
                  : MORE_MEMBER_CARD_ADD}
              </Text>
            </Pressable>
          </View>
          <AvatarList members={cachedGroups} />
        </CardBase>

        <View style={styles.menuWrapper}>
          <ToolsMenu
            showTitle={false}
            sections={[
              {
                items: [
                  {
                    key: 'groupManage',
                    icon: GROUP_ICON,
                    label: MORE_MENU_GROUP_MANAGE,
                    onPress: () => navigation.navigate('GroupManage'),
                  },
                ],
              },
              {
                items: [
                  {
                    key: 'report',
                    icon: REPORT_ICON,
                    label: MORE_MENU_REPORT,
                    onPress: () => navigation.navigate('ReportMain'),
                  },
                  {
                    key: 'album',
                    icon: ALBUM_ICON,
                    label: MORE_MENU_RECEIPT_ALBUM,
                    onPress: () => navigation.navigate('ReceiptAlbum'),
                  },
                  {
                    key: 'statistics',
                    icon: STATISTICS_ICON,
                    label: MORE_MENU_STATISTICS,
                    onPress: () => navigation.navigate('Statistics'),
                  },
                  {
                    key: 'archive',
                    icon: ARCHIVE_ICON,
                    label: MORE_MENU_ARCHIVE,
                    onPress: () => navigation.navigate('Archive'),
                  },
                ],
              },
            ]}
          />
        </View>
      </ScrollView>

      <GroupSwitcherMenu
        visible={switcherVisible}
        onClose={() => setSwitcherVisible(false)}
        onSelectGroup={groupId => {
          setActiveGroup(groupId);
          const nextGroup = getActiveGroup();
          setGroup(nextGroup);
          setSwitcherVisible(false);
          if (nextGroup) {
            setSwitchSnackbarMessage(
              `${SNACKBAR_GROUP_SWITCHED_PREFIX}${nextGroup.name}${SNACKBAR_GROUP_SWITCHED_SUFFIX}`,
            );
            setTimeout(() => setSwitchSnackbarMessage(null), SNACKBAR_AUTO_HIDE_MS);
          }
        }}
        onPressAllGroups={() => {
          setSwitcherVisible(false);
          navigation.navigate('AllGroups');
        }}
      />

      {switchSnackbarMessage && (
        <View style={styles.snackbarWrapper}>
          <Snackbar visible title={switchSnackbarMessage} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BLUE_50,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  groupNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  groupName: {
    ...TYPOGRAPHY.h3,
  },
  chevronIcon: {
    width: 20,
    height: 20,
  },
  memberCard: {
    gap: 12,
  },
  memberCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberCardTitle: {
    ...TYPOGRAPHY.subtitle1,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_SECONDARY,
  },
  menuWrapper: {
    marginTop: 20,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  stateText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_DISABLED,
  },
  stateButton: {
    alignSelf: 'center',
  },
  snackbarWrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
  },
});

export default MoreScreen;
