/** @screen ETC-2-PAGE-03-0 모임 관리자 */
/** @screen ETC-3-SNACKBAR-01-0 초대 코드 복사완료 */
/** @screen ETC-5-SNACKBAR-01-0 권한 변경 완료 (스낵바 렌더링은 여기, 메시지 조합은 MemberProfileSheet.tsx) */
/** @screen ETC-5-SNACKBAR-02-0 모임 내보내기 완료 (스낵바 렌더링은 여기, 메시지 조합은 MemberProfileSheet.tsx) */
import { useCallback, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
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
import * as groupService from '../../services/groupService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  NO_ACTIVE_GROUP_MESSAGE,
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
  GROUP_MANAGER_MEMBER_MANAGE_LABEL,
  GROUP_MANAGER_RETRY_LABEL,
  GROUP_MANAGER_TITLE,
  SNACKBAR_INVITE_CODE_COPIED,
} from '../../constants/groupManagerScreenText';
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_NORMAL } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const COPY_ICON = require('../../assets/icons/system/Copy.png');
const CHEVRON_RIGHT_ICON = require('../../assets/icons/nav/Chevron Right.png');

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

  const fetchInvitation = useCallback(
    async (groupId: string, viewerOwner: boolean) => {
      setIsIssuingInvite(true);
      setInviteError(false);
      try {
        // GET current로 먼저 "지금 있는 코드"를 읽는다 — 이게 성공하면 발급 API는
        // 아예 안 부른다(재발급은 매번 새 코드를 만들어 이전 공유 코드를 무효화한다).
        await groupMembershipService.getCurrentInvitation(groupId);
        setGroup(getActiveGroup());
      } catch (error) {
        if (
          error instanceof ApiError &&
          error.code === 'INVITATION_NOT_FOUND' &&
          viewerOwner
        ) {
          // 코드가 아예 없는 최초 상태 — 발급은 총무만 가능하다(정책 확정).
          try {
            await groupMembershipService.createInvitation(groupId);
            setGroup(getActiveGroup());
            return;
          } catch {
            setInviteError(true);
            return;
          }
        }
        if (error instanceof ApiError && error.code === 'INVITATION_NOT_FOUND') {
          // 일반 관리자는 코드를 만들 수 없다 — "총무에게 요청" 문구만 보여준다.
          return;
        }
        setInviteError(true);
      } finally {
        setIsIssuingInvite(false);
      }
    },
    [],
  );

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      let activeGroup = getActiveGroup();
      if (!activeGroup) {
        // [치명1] 로그인 직후 첫 포커스처럼 모임 캐시가 아직 없는 순간 대비 —
        // "다시 시도"가 실제로 동작하도록 여기서 한 번 더 직접 불러온다.
        await groupService.getMyGroups();
        activeGroup = getActiveGroup();
      }
      setGroup(activeGroup);
      if (!activeGroup) {
        setLoadErrorMessage(NO_ACTIVE_GROUP_MESSAGE);
        setLoadState('error');
        return;
      }
      const result = await groupMembershipService.getMemberships(activeGroup.id);
      setMembers(result);
      setLoadState('ready');
      // 2026-09-06: `GET .../invitations/current`(조회 전용)가 확인돼 화면 진입
      // 시 자동으로 부른다 — 이전엔 발급 API가 멱등하지 않아(재호출마다 새 코드)
      // 자동 호출을 못 하고 카드를 눌렀을 때만 발급했었다.
      fetchInvitation(activeGroup.id, activeGroup.myRole === 'OWNER');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, [fetchInvitation]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleMemberChanged = (message: string) => {
    if (group) {
      load();
    }
    showSnackbar(message);
  };

  // [치명1] 예전엔 group이 없으면(모임 캐시 미준비) 여기서 바로 null을 반환해
  // 로딩/에러 상태조차 못 그렸다 — AppBar도 없는 완전 빈 화면으로 멈췄다. 이제
  // group 의존 값은 group이 있을 때만 계산하고, 없을 때도 아래 loadState 분기가
  // 에러+재시도를 보여줄 수 있게 렌더를 계속 진행한다.
  const inviteCodeText = group
    ? isIssuingInvite
      ? GROUP_MANAGER_INVITE_CODE_ISSUING
      : group.inviteCode ??
        (inviteError
          ? GROUP_MANAGER_INVITE_CODE_ERROR
          : GROUP_MANAGER_INVITE_CODE_PENDING)
    : '';

  const handlePressInviteCode = () => {
    if (!group || isIssuingInvite) {
      return;
    }
    if (group.inviteCode) {
      showSnackbar(SNACKBAR_INVITE_CODE_COPIED);
      return;
    }
    if (!viewerIsOwner) {
      // 일반 관리자는 발급 권한이 없다 — 다시 눌러봐야 안내 문구만 반복된다.
      return;
    }
    // 조회/발급 실패 후 다시 누르면 재시도한다.
    fetchInvitation(group.id, true);
  };

  return (
    <ScreenContainer
      background="primary"
      snackbar={
        snackbarMessage ? <Snackbar visible title={snackbarMessage} /> : undefined
      }
    >
      <AppBar
        type="sub"
        title={GROUP_MANAGER_TITLE}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {group && (
          <CardBase onPress={handlePressInviteCode} style={styles.inviteCodeRow}>
            <Image source={COPY_ICON} style={styles.inviteCodeIcon} />
            <Text style={styles.inviteCodeText}>
              {GROUP_MANAGER_INVITE_CODE_PREFIX}
              {inviteCodeText}
            </Text>
          </CardBase>
        )}

        {group && (
          <CardBase onPress={() => navigation.navigate('MemberManage')} style={styles.memberManageRow}>
            <Text style={styles.memberManageLabel}>{GROUP_MANAGER_MEMBER_MANAGE_LABEL}</Text>
            <Image source={CHEVRON_RIGHT_ICON} style={styles.memberManageChevron} />
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
              onPress={load}
              hierarchy="secondary"
              style={{ alignSelf: 'center' }}
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
        groupId={group?.id ?? ''}
        onClose={() => setSelectedMember(null)}
        onChanged={handleMemberChanged}
        onError={showSnackbar}
        // "모임 관리자"는 이제 "모임 관리"(GroupManageScreen)를 거쳐 들어온다 — 나가면
        // 두 화면 다 지나쳐 더보기로 돌아가야 한다(goBack 한 번이면 모임 관리에
        // 남는데, 그 화면도 활성 모임이 없어 바로 에러 상태가 되니 의미가 없다).
        onLeftGroup={() => navigation.pop(2)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
  memberManageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberManageLabel: {
    ...TYPOGRAPHY.subtitle3,
  },
  memberManageChevron: {
    width: 16,
    height: 16,
    tintColor: FOREGROUND_DISABLED,
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
});

export default GroupManagerScreen;
