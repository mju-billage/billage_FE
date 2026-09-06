/** @screen DTB-3-PAGE-01-0 상세 내역_증빙자료 상세 */
/**
 * `TransactionDetailScreen`(DTB-2-PAGE-02-0)의 증빙 자료 썸네일을 누르면 뜨는
 * 원본 이미지 뷰어. 같은 그림(핀치줌 뷰어)이지만 `ReceiptDetailScreen`
 * (ETC-3-PAGE-04-0, 증빙자료 앨범에서 진입)과 시안이 다르다 — 이미 상세 내역
 * 화면 안에서 열리는 것이라 "상세 내역 바로가기" CTA가 필요 없고, 헤더도
 * 텍스트 없이 X(닫기)만 있다(내역_상세내역조회.png Case A 참고). 그래서 별도
 * 화면으로 만들고, 공용 `ZoomableImage`만 재사용했다.
 */
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import ZoomableImage from '../../components/Data Display/Zoomable Image/ZoomableImage';
import { buildAuthenticatedImageSource } from '../../utils/authenticatedImage';
import { FILL_INVERSE, FOREGROUND_INVERSE } from '../../constants/colors';

const CLOSE_ICON = require('../../assets/icons/action/Close.png');

type TransactionReceiptDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TransactionReceiptDetailRouteProp = RouteProp<
  RootStackParamList,
  'TransactionReceiptDetail'
>;

function TransactionReceiptDetailScreen() {
  const navigation = useNavigation<TransactionReceiptDetailNavigationProp>();
  const route = useRoute<TransactionReceiptDetailRouteProp>();
  const { fileUrl } = route.params;

  const source = buildAuthenticatedImageSource(fileUrl);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.closeButton}>
          <Image source={CLOSE_ICON} style={styles.closeIcon} />
        </Pressable>
      </View>

      <ZoomableImage uri={source.uri} headers={source.headers} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FILL_INVERSE,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: FOREGROUND_INVERSE,
  },
});

export default TransactionReceiptDetailScreen;
