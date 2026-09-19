/** @screen ETC-3-PAGE-05-0 증빙자료 앨범 내 검색 */
/**
 * 앨범 메인의 돋보기 아이콘에서 들어오는 검색 전용 화면. 검색 범위는
 * File.txt "keyword: 내역명·메모 검색"(Entry 7번과 동일 규칙) — 장부명은
 * 검색하지 않는다. 시안이 "실시간 검색(On-change)"이라고 적었지만
 * 7-A(모임원 검색)와 같은 이유로 타이핑마다 서버를 부르는 대신 300ms
 * 디바운스를 얹었다.
 *
 * 진입 시 곧바로 전체 목록을 보여주지 않는다 — 시안엔 "빈 검색어" 상태가
 * 없고(Case A/B 둘 다 텍스트가 입력된 상태부터 시작), 앨범 메인과 똑같은
 * 목록을 검색어 없이 또 한 번 불러오는 건 낭비다. 키워드를 입력해야 조회한다.
 */
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import SearchField from '../../components/Input/Search/SearchField';
import Button from '../../components/Input/Button/Button';
import ReceiptGrid from './ReceiptGrid';
import { getActiveGroup } from '../../types/group';
import type { Receipt } from '../../types/receipt';
import * as receiptService from '../../services/receiptService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  RECEIPT_ALBUM_COUNT_SUFFIX,
  RECEIPT_ALBUM_RETRY_LABEL,
  RECEIPT_ALBUM_TITLE,
  RECEIPT_SEARCH_EMPTY,
  RECEIPT_SEARCH_PLACEHOLDER,
} from '../../constants/receiptScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const SEARCH_DEBOUNCE_MS = 300;

type ReceiptSearchNavigationProp = NativeStackNavigationProp<RootStackParamList>;

function ReceiptSearchScreen() {
  const navigation = useNavigation<ReceiptSearchNavigationProp>();
  const [keyword, setKeyword] = useState('');
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [searchError, setSearchError] = useState<string | undefined>();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const search = async (searchKeyword: string, pageToLoad: number) => {
    const trimmed = searchKeyword.trim();
    if (!trimmed) {
      setReceipts([]);
      setHasMore(false);
      setSearchError(undefined);
      return;
    }
    const group = getActiveGroup();
    if (!group) {
      return;
    }
    try {
      const result = await receiptService.getReceipts(group.id, {
        keyword: trimmed,
        page: pageToLoad,
      });
      if (pageToLoad === 0) {
        setReceipts(result.items);
      } else {
        setReceipts(current => [...current, ...result.items]);
      }
      setPage(result.page);
      setHasMore(!result.last);
      setSearchError(undefined);
    } catch (error) {
      // "결과 없음"과 "요청 실패"를 구분한다 — 전에는 둘 다 빈 목록으로만 보여서
      // 사용자가 검색이 실패한 건지 그냥 결과가 없는 건지 알 수 없었다.
      if (pageToLoad === 0) {
        setReceipts([]);
        setHasMore(false);
        setSearchError(toErrorMessage(error));
      }
    }
  };

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      search(keyword, 0);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  const loadMore = () => {
    if (hasMore) {
      search(keyword, page + 1);
    }
  };

  const handlePressReceipt = (item: Receipt) => {
    navigation.navigate('ReceiptDetail', {
      fileId: item.fileId,
      fileUrl: item.fileUrl,
      entryId: item.entryId,
      entryTitle: item.entryTitle,
      occurredOn: item.occurredOn,
    });
  };

  return (
    <ScreenContainer background="secondary">
      <AppBar type="sub" title={RECEIPT_ALBUM_TITLE} onBackPress={() => navigation.goBack()} />

      <View style={styles.body}>
        <SearchField
          value={keyword}
          onChangeText={setKeyword}
          placeholder={RECEIPT_SEARCH_PLACEHOLDER}
          variant="outline"
        />

        {keyword.trim().length > 0 && (
          searchError ? (
            <View style={styles.errorState}>
              <Text style={styles.errorText}>{searchError}</Text>
              <Button
                label={RECEIPT_ALBUM_RETRY_LABEL}
                onPress={() => search(keyword, 0)}
                hierarchy="secondary"
                style={styles.retryButton}
              />
            </View>
          ) : (
            <>
              <Text style={styles.countText}>
                {receipts.length}
                {RECEIPT_ALBUM_COUNT_SUFFIX}
              </Text>
              <ReceiptGrid
                items={receipts}
                emptyText={RECEIPT_SEARCH_EMPTY}
                onEndReached={loadMore}
                onPressItem={handlePressReceipt}
              />
            </>
          )
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 8,
  },
  countText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  errorText: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  retryButton: {
    marginTop: 4,
  },
});

export default ReceiptSearchScreen;
