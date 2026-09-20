/** @screen COM-2-PAGE-04-0 탈퇴하기_권한 이전 */
/**
 * 회원 탈퇴 플로우 2단계([Case A] 전용): 유일한 총무로 있는 모임마다 새 총무를
 * 1명씩 골라야 한다. 시안 UI 요소 3번 그대로 모임(그룹)별 단일 선택 —
 * 다른 멤버를 선택하면 같은 모임 안의 기존 선택은 자동 해제된다.
 *
 * 실제 권한 이전 API 호출은 여기서 하지 않는다 — 선택 결과(`ownershipTransfers`)를
 * 다음 화면(`WithdrawReason`)으로 들고 가서 최종 확인 모달에서 탈퇴 요청과 한
 * 트랜잭션으로 같이 보낸다(Auth.txt 11번 정책 메모).
 */
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

/** "탈퇴하기" 2단계([Case A]): 모임별 새 총무 선택. */
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
          ? getApiErrorMessage(error.code)
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
    paddingHorizontal: 24,
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
    paddingHorizontal: 24,
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
    paddingHorizontal: 24,
  },
});

export default WithdrawOwnershipTransferScreen;
