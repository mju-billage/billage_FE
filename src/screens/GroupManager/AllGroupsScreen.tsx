import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import EntityCard from '../../components/Data Display/Card/EntityCard';
import Button from '../../components/Input/Button/Button';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
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
  SNACKBAR_GROUP_JOINED_SUFFIX,
} from '../../constants/groupManagerScreenText';
import { FOREGROUND_DISABLED } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const SNACKBAR_AUTO_HIDE_MS = 1600;

type AllGroupsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AllGroups'
>;
type AllGroupsRouteProp = RouteProp<RootStackParamList, 'AllGroups'>;

type SheetKey = 'none' | 'add' | 'join';
type LoadState = 'loading' | 'error' | 'ready';

function AllGroupsScreen() {
  const navigation = useNavigation<AllGroupsNavigationProp>();
  const route = useRoute<AllGroupsRouteProp>();
  const [sheet, setSheet] = useState<SheetKey>('none');
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(null), SNACKBAR_AUTO_HIDE_MS);
  };

  useEffect(() => {
    if (route.params?.snackbarMessage) {
      showSnackbar(route.params.snackbarMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <ScreenContainer
      background="primary"
      snackbar={
        snackbarMessage ? <Snackbar visible title={snackbarMessage} /> : undefined
      }
    >
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
            style={{ alignSelf: 'center' }}
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
        onJoined={joinedGroup => {
          setSheet('none');
          showSnackbar(`${joinedGroup.name}${SNACKBAR_GROUP_JOINED_SUFFIX}`);
          setTimeout(() => navigation.goBack(), SNACKBAR_AUTO_HIDE_MS);
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
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
