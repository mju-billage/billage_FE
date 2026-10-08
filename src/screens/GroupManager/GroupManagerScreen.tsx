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
import { getActiveGroup, getCachedGroups } from '../../types/group';
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
      return getApiErrorMessage(error.code, error.message);
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
        await groupMembershipService.getCurrentInvitation(groupId);
        setGroup(getActiveGroup());
      } catch (error) {
        if (
          error instanceof ApiError &&
          error.code === 'INVITATION_NOT_FOUND' &&
          viewerOwner
        ) {
          try {
            await groupMembershipService.createInvitation(groupId);
            setGroup(getActiveGroup());
            return;
          } catch (createError) {
            setInviteError(true);
            showSnackbar(toErrorMessage(createError));
            return;
          }
        }
        if (error instanceof ApiError && error.code === 'INVITATION_NOT_FOUND') {
          return;
        }
        setInviteError(true);
        showSnackbar(toErrorMessage(error));
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
      return;
    }
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
          <CardBase style={styles.memberListCard}>
            <ToolsMenu
              showTitle={false}
              flush
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
          </CardBase>
        )}
      </View>

      <MemberProfileSheet
        visible={selectedMember != null}
        member={selectedMember}
        groupId={group?.id ?? ''}
        onClose={() => setSelectedMember(null)}
        onChanged={handleMemberChanged}
        onError={showSnackbar}
        onLeftGroup={() => {
          if (getCachedGroups().length === 0) {
            navigation.reset({ index: 0, routes: [{ name: 'PostLogin' }] });
            return;
          }
          navigation.pop(2);
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
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
  memberListCard: {
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
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
