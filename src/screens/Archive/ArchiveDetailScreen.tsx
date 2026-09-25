import { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import CardBase from '../../components/Data Display/Card/CardBase';
import type { ArchiveDetail } from '../../types/archive';
import * as archiveService from '../../services/archiveService';
import { ApiError } from '../../services/apiClient';
import { formatExpense, formatWon } from '../../utils/currency';
import { formatDateDot } from '../../utils/dueDate';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  ARCHIVE_DETAIL_CREATED_AT_LABEL,
  ARCHIVE_DETAIL_EMPTY,
  ARCHIVE_DETAIL_EXPENSE_LABEL,
  ARCHIVE_DETAIL_INCOME_LABEL,
  ARCHIVE_DETAIL_LOADING,
  ARCHIVE_RETRY_LABEL,
} from '../../constants/archiveScreenText';
import {
  FEEDBACK_POSITIVE_BOLD,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const CHEVRON_RIGHT_ICON = require('../../assets/icons/nav/Chevron Right.png');
const CLOSE_ICON = require('../../assets/icons/action/Close.png');

type LoadState = 'loading' | 'error' | 'ready';
type ArchiveDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ArchiveDetailRouteProp = RouteProp<RootStackParamList, 'ArchiveDetail'>;

function ArchiveDetailScreen() {
  const navigation = useNavigation<ArchiveDetailNavigationProp>();
  const route = useRoute<ArchiveDetailRouteProp>();
  const { archiveId } = route.params;

  const [archive, setArchive] = useState<ArchiveDetail | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const detail = await archiveService.getArchiveDetail(archiveId);
      setArchive(detail);
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, [archiveId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loadState === 'loading' || loadState === 'error' || !archive) {
    return (
      <ScreenContainer background="primary">
        <AppBar
          type="sub"
          title=""
          onBackPress={() => navigation.goBack()}
          rightIcons={[
            { icon: CLOSE_ICON, onPress: () => navigation.goBack(), accessibilityLabel: 'close' },
          ]}
        />
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>
            {loadState === 'error' ? loadErrorMessage : ARCHIVE_DETAIL_LOADING}
          </Text>
          {loadState === 'error' && (
            <Button
              label={ARCHIVE_RETRY_LABEL}
              onPress={load}
              hierarchy="secondary"
              style={{ alignSelf: 'center' }}
            />
          )}
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer background="primary">
      <AppBar
        type="sub"
        title={archive.title}
        onBackPress={() => navigation.goBack()}
        rightIcons={[
          {
            icon: CLOSE_ICON,
            onPress: () => navigation.goBack(),
            accessibilityLabel: 'close',
          },
        ]}
      />

      <View style={styles.body}>
        <Text style={styles.metaText}>
          {ARCHIVE_DETAIL_CREATED_AT_LABEL} {formatDateDot(archive.createdAt)}
        </Text>

        {archive.ledgers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{ARCHIVE_DETAIL_EMPTY}</Text>
          </View>
        ) : (
          <FlatList
            data={archive.ledgers}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const hasEntries = item.entries.length > 0;
              return (
                <Pressable
                  onPress={() =>
                    navigation.navigate('ArchiveLedgerEntries', {
                      ledgerName: item.name,
                      startDate: archive.startDate,
                      endDate: archive.endDate,
                      totalIncome: item.totalIncome,
                      totalExpense: item.totalExpense,
                      entries: item.entries,
                    })
                  }
                >
                  <CardBase style={styles.ledgerCard}>
                    <View style={styles.ledgerNameRow}>
                      <Text style={styles.ledgerName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Image source={CHEVRON_RIGHT_ICON} style={styles.chevronIcon} />
                    </View>
                    {hasEntries && (
                      <>
                        <Text style={styles.periodText}>
                          {formatDateDot(archive.startDate)} - {formatDateDot(archive.endDate)}
                        </Text>
                        <View style={styles.amountRow}>
                          <Text style={styles.amountLabel}>{ARCHIVE_DETAIL_INCOME_LABEL}</Text>
                          <Text style={styles.ledgerIncome}>{formatWon(item.totalIncome)}원</Text>
                        </View>
                        <View style={styles.amountRow}>
                          <Text style={styles.amountLabel}>{ARCHIVE_DETAIL_EXPENSE_LABEL}</Text>
                          <Text style={styles.ledgerExpense}>{formatExpense(item.totalExpense)}</Text>
                        </View>
                      </>
                    )}
                  </CardBase>
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 8,
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
  metaText: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    textAlign: 'right',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  ledgerCard: {
    gap: 4,
  },
  ledgerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ledgerName: {
    ...TYPOGRAPHY.subtitle3,
    flex: 1,
  },
  chevronIcon: {
    width: 20,
    height: 20,
  },
  periodText: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountLabel: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  ledgerIncome: {
    ...TYPOGRAPHY.body2,
    color: FEEDBACK_POSITIVE_BOLD,
  },
  ledgerExpense: {
    ...TYPOGRAPHY.body2,
  },
});

export default ArchiveDetailScreen;
