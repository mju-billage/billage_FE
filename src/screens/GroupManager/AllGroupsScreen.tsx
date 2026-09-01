/** @screen ETC-2-PAGE-01-0 전체 모임 관리 */
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import EntityCard from '../../components/Data Display/Card/EntityCard';
import Button from '../../components/Input/Button/Button';
import AddGroupSheet from './AddGroupSheet';
import JoinGroupSheet from './JoinGroupSheet';
import { setActiveGroup } from '../../types/group';
import type { GroupSummary } from '../../types/group';
import * as groupService from '../../services/groupService';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import { ApiError } from '../../services/apiClient';
import {
  ALL_GROUPS_LOADING,
  ALL_GROUPS_RETRY_LABEL,
  ALL_GROUPS_ROLE_TREASURER,
  ALL_GROUPS_TITLE,
} from '../../constants/groupManagerScreenText';
import { FOREGROUND_DISABLED } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type AllGroupsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AllGroups'
>;

type SheetKey = 'none' | 'add' | 'join';
type LoadState = 'loading' | 'error' | 'ready';

/** 전체 모임 관리: 내가 속한 모임 목록 + 새 모임 추가(생성/코드 참여). */
function AllGroupsScreen() {
  const navigation = useNavigation<AllGroupsNavigationProp>();
  const [sheet, setSheet] = useState<SheetKey>('none');
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const loadGroups = useCallback(async () => {
    setLoadState('loading');
    try {
      const result = await groupService.getMyGroups();
      setGroups(result);
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

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar
        type="sub"
        title={ALL_GROUPS_TITLE}
        onBackPress={() => navigation.goBack()}
      />

      {loadState === 'loading' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{ALL_GROUPS_LOADING}</Text>
        </View>
      )}

      {loadState === 'error' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <Button
            label={ALL_GROUPS_RETRY_LABEL}
            onPress={loadGroups}
            hierarchy="secondary"
          />
        </View>
      )}

      {loadState === 'ready' && (
        <ScrollView contentContainerStyle={styles.content}>
          {groups.map(group => (
            <EntityCard
              key={group.id}
              type="group"
              groupName={group.name}
              label={
                group.myRole === 'OWNER' ? ALL_GROUPS_ROLE_TREASURER : undefined
              }
              memberCount={group.memberCount}
              onPress={() => {
                setActiveGroup(group.id);
                navigation.goBack();
              }}
            />
          ))}
          <EntityCard type="newGroup" onPress={() => setSheet('add')} />
        </ScrollView>
      )}

      <AddGroupSheet
        visible={sheet === 'add'}
        onClose={() => setSheet('none')}
        onSelect={key => {
          if (key === 'create') {
            setSheet('none');
            navigation.navigate('GroupCreate');
          } else {
            setSheet('join');
          }
        }}
      />
      <JoinGroupSheet
        visible={sheet === 'join'}
        onClose={() => setSheet('none')}
        onJoined={() => {
          setSheet('none');
          navigation.goBack();
        }}
      />
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
    paddingBottom: 24,
    gap: 12,
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

export default AllGroupsScreen;
