import { useCallback, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Avatar from '../../components/Data Display/Avatar/Avatar';
import Button from '../../components/Input/Button/Button';
import CardBase from '../../components/Data Display/Card/CardBase';
import * as groupMembershipService from '../../services/groupMembershipService';
import type { GroupMembership } from '../../types/groupMembership';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  WITHDRAW_TRANSFER_LOADING,
  WITHDRAW_TRANSFER_RETRY_LABEL,
  WITHDRAW_TRANSFER_SUBMIT_LABEL,
  WITHDRAW_TRANSFER_TITLE,
  withdrawTransferHeading,
  WITHDRAW_TRANSFER_DESCRIPTION,
} from '../../constants/settingsScreenText';
import {
  FOREGROUND_DISABLED,
  FOREGROUND_SECONDARY,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const CLOSE_ICON = require('../../assets/icons/action/Close.png');
const CHECK_ICON = require('../../assets/icons/action/Check.png');

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'WithdrawOwnershipTransfer'
>;
type RouteProps = RouteProp<RootStackParamList, 'WithdrawOwnershipTransfer'>;

type LoadState = 'loading' | 'error' | 'ready';

function WithdrawOwnershipTransferScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { groups } = route.params;

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [candidatesByGroup, setCandidatesByGroup] = useState<
    Record<string, GroupMembership[]>
  >({});
  const [selections, setSelections] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const entries = await Promise.all(
        groups.map(async group => {
          const memberships = await groupMembershipService.getMemberships(
            group.groupId,
          );
          return [
            group.groupId,
            memberships.filter(membership => !membership.isMe),
          ] as const;
        }),
      );
      setCandidatesByGroup(Object.fromEntries(entries));
      setLoadState('ready');
    } catch (error) {
      setErrorMessage(
        isNetworkError(error)
          ? API_NETWORK_ERROR_MESSAGE
          : error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : API_ERROR_DEFAULT_MESSAGE,
      );
      setLoadState('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleClose = () => navigation.navigate('MyProfile');

  const canSubmit = groups.every(group => !!selections[group.groupId]);

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }
    navigation.navigate('WithdrawReason', {
      ownershipTransfers: groups.map(group => ({
        groupId: Number(group.groupId),
        newOwnerUserId: Number(selections[group.groupId]),
      })),
    });
  };

  return (
    <ScreenContainer background="primary">
      <AppBar
        type="sub"
        title={WITHDRAW_TRANSFER_TITLE}
        onBackPress={() => navigation.goBack()}
        rightIcons={[{ icon: CLOSE_ICON, onPress: handleClose }]}
      />

      {loadState === 'loading' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{WITHDRAW_TRANSFER_LOADING}</Text>
        </View>
      )}

      {loadState === 'error' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <Button
            label={WITHDRAW_TRANSFER_RETRY_LABEL}
            onPress={load}
            hierarchy="secondary"
            style={{ alignSelf: 'center' }}
          />
        </View>
      )}

      {loadState === 'ready' && (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.heading}>
              {withdrawTransferHeading(groups.length)}
            </Text>
            <Text style={styles.description}>
              {WITHDRAW_TRANSFER_DESCRIPTION}
            </Text>

            {groups.map(group => (
              <View key={group.groupId} style={styles.groupSection}>
                <Text style={styles.groupName}>{group.name}</Text>
                <CardBase>
                  {(candidatesByGroup[group.groupId] ?? []).map(candidate => {
                    const selected =
                      selections[group.groupId] === candidate.userId;
                    return (
                      <Pressable
                        key={candidate.membershipId}
                        style={styles.memberRow}
                        onPress={() =>
                          setSelections(prev => ({
                            ...prev,
                            [group.groupId]: candidate.userId,
                          }))
                        }
                      >
                        <Avatar type="icon" size="sm" style="neutral" />
                        <Text style={styles.memberName}>{candidate.name}</Text>
                        {selected && (
                          <Image source={CHECK_ICON} style={styles.checkIcon} />
                        )}
                      </Pressable>
                    );
                  })}
                </CardBase>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <Button
              label={WITHDRAW_TRANSFER_SUBMIT_LABEL}
              onPress={handleSubmit}
              disabled={!canSubmit}
              fullWidth
            />
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  heading: {
    ...TYPOGRAPHY.subtitle2,
  },
  description: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_DISABLED,
    marginTop: 4,
    marginBottom: 20,
  },
  groupSection: {
    marginBottom: 24,
  },
  groupName: {
    ...TYPOGRAPHY.subtitle3,
    marginBottom: 8,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  memberName: {
    ...TYPOGRAPHY.body1,
    flex: 1,
  },
  checkIcon: {
    width: 20,
    height: 20,
    tintColor: FOREGROUND_SECONDARY,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default WithdrawOwnershipTransferScreen;
