/** @screen ETC-2-PAGE-03-0 모임 관리자 */
/** @screen ETC-3-SNACKBAR-01-0 초대 코드 복사완료 */
/** @screen ETC-5-SNACKBAR-01-0 권한 변경 완료 (스낵바 렌더링은 여기, 메시지 조합은 MemberProfileSheet.tsx) */
import { useCallback, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import CardBase from '../../components/Data Display/Card/CardBase';
import ToolsMenu from '../../components/Navigation/Menu/ToolsMenu';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import Button from '../../components/Input/Button/Button';
import MemberProfileSheet from './MemberProfileSheet';
import { getActiveGroup } from '../../types/group';
import type { GroupSummary } from '../../types/group';
import type { GroupMembership } from '../../types/groupMembership';
import * as groupMembershipService from '../../services/groupMembershipService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  ALL_GROUPS_ROLE_TREASURER,
  GROUP_MANAGER_INVITE_CODE_ERROR,
  GROUP_MANAGER_INVITE_CODE_ISSUING,
  GROUP_MANAGER_INVITE_CODE_PENDING,
  GROUP_MANAGER_INVITE_CODE_PREFIX,
  GROUP_MANAGER_LOADING,
  GROUP_MANAGER_RETRY_LABEL,
  GROUP_MANAGER_TITLE,
  SNACKBAR_INVITE_CODE_COPIED,
} from '../../constants/groupManagerScreenText';
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_NORMAL } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const COPY_ICON = require('../../assets/icons/system/Copy.png');

type GroupManagerNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GroupManager'
>;

const SNACKBAR_AUTO_HIDE_MS = 1600;
type LoadState = 'loading' | 'error' | 'ready';

/** "모임 관리자": 현재 모임의 초대코드(총무만) + 모임원 목록(권한 설정 진입점). */
function GroupManagerScreen() {
  const navigation = useNavigation<GroupManagerNavigationProp>();
  const [group, setGroup] = useState<GroupSummary | undefined>(
    getActiveGroup(),
  );
  const [members, setMembers] = useState<GroupMembership[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [selectedMember, setSelectedMember] = useState<GroupMembership | null>(
    null,
  );
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [isIssuingInvite, setIsIssuingInvite] = useState(false);
  const [inviteError, setInviteError] = useState(false);

  const viewerIsOwner = group?.myRole === 'OWNER';

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(null), SNACKBAR_AUTO_HIDE_MS);
  };

  const fetchInvitation = useCallback(async (groupId: string) => {
    setIsIssuingInvite(true);
    setInviteError(false);
    try {
      await groupMembershipService.createInvitation(groupId);
      setGroup(getActiveGroup());
    } catch {
      // 발급 실패는 화면 자체를 막지 않는다 — 행을 다시 누르면 재시도한다.
      setInviteError(true);
    } finally {
      setIsIssuingInvite(false);
    }
  }, []);

  const loadMembers = useCallback(
    async (groupId: string) => {
      setLoadState('loading');
      try {
        const result = await groupMembershipService.getMemberships(groupId);
        setMembers(result);
        setLoadState('ready');
      } catch (error) {
        setLoadErrorMessage(toErrorMessage(error));
        setLoadState('error');
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      const activeGroup = getActiveGroup();
      setGroup(activeGroup);
      if (!activeGroup) {
        return;
      }
      loadMembers(activeGroup.id);
      // 초대코드는 자동 발급하지 않는다 — 발급 API가 멱등하지 않아(재호출마다 새 코드,
      // docs/api-gaps.md 정책 결함 참고) 화면 진입만으로 호출하면 코드가 계속 늘어난다.
      // 카드를 눌렀을 때만(handlePressInviteCode) 발급을 요청한다.
    }, [loadMembers]),
  );

  const handleMemberChanged = (message: string) => {
    if (group) {
      loadMembers(group.id);
    }
    showSnackbar(message);
  };

  if (!group) {
    return null;
  }

  const inviteCodeText = isIssuingInvite
    ? GROUP_MANAGER_INVITE_CODE_ISSUING
    : group.inviteCode ??
      (inviteError
        ? GROUP_MANAGER_INVITE_CODE_ERROR
        : GROUP_MANAGER_INVITE_CODE_PENDING);

  const handlePressInviteCode = () => {
    if (isIssuingInvite) {
      return;
    }
    if (group.inviteCode) {
      showSnackbar(SNACKBAR_INVITE_CODE_COPIED);
      return;
    }
    // 초대코드가 없는 상태(최초 발급 실패 등)에서 다시 누르면 재시도한다.
    fetchInvitation(group.id);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar
        type="sub"
        title={GROUP_MANAGER_TITLE}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {viewerIsOwner && (
          <CardBase onPress={handlePressInviteCode} style={styles.inviteCodeRow}>
            <Image source={COPY_ICON} style={styles.inviteCodeIcon} />
            <Text style={styles.inviteCodeText}>
              {GROUP_MANAGER_INVITE_CODE_PREFIX}
              {inviteCodeText}
            </Text>
          </CardBase>
        )}

        {loadState === 'loading' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{GROUP_MANAGER_LOADING}</Text>
          </View>
        )}

        {loadState === 'error' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{loadErrorMessage}</Text>
            <Button
              label={GROUP_MANAGER_RETRY_LABEL}
              onPress={() => loadMembers(group.id)}
              hierarchy="secondary"
            />
          </View>
        )}

        {loadState === 'ready' && (
          <View style={styles.memberListWrapper}>
            <ToolsMenu
              showTitle={false}
              sections={[
                {
                  items: members.map(member => ({
                    key: member.membershipId,
                    itemType: 'avatar',
                    label: member.name,
                    tag:
                      member.role === 'OWNER'
                        ? ALL_GROUPS_ROLE_TREASURER
                        : undefined,
                    onPress: () => setSelectedMember(member),
                  })),
                },
              ]}
            />
          </View>
        )}
      </View>

      <MemberProfileSheet
        visible={selectedMember != null}
        member={selectedMember}
        groupId={group.id}
        onClose={() => setSelectedMember(null)}
        onChanged={handleMemberChanged}
        onError={showSnackbar}
        onLeftGroup={() => navigation.goBack()}
      />

      {snackbarMessage && (
        <View style={styles.snackbarWrapper}>
          <Snackbar visible title={snackbarMessage} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 12,
    flex: 1,
  },
  inviteCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inviteCodeIcon: {
    width: 20,
    height: 20,
    tintColor: FOREGROUND_NEUTRAL_NORMAL,
  },
  inviteCodeText: {
    ...TYPOGRAPHY.subtitle3,
  },
  memberListWrapper: {
    marginTop: 4,
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
  snackbarWrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
  },
});

export default GroupManagerScreen;
