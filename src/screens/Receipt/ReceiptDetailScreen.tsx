/** @screen ETC-3-PAGE-04-0 증빙자료 앨범 내 자료 상세 */
/**
 * 앨범 그리드에서 썸네일을 누르면 뜨는 원본 이미지 뷰어. 단건 조회 API가
 * 없어(File.txt §3 참고 — 목록 응답에만 entryTitle/occurredOn/fileUrl이
 * 묶여 온다) 이전 화면(`ReceiptAlbumScreen`/`ReceiptSearchScreen`)이 들고
 * 있던 항목을 route params로 그대로 받는다.
 *
 * 몰입감을 위해 배경을 어둡게(`FILL_INVERSE`) 깔아야 하는데, 공용 `AppBar`는
 * 밝은 배경 전제로 텍스트·아이콘 색이 고정돼 있어 이 화면 하나 때문에
 * 공용 컴포넌트를 건드리지 않고 이 화면 안에서만 흰색 커스텀 헤더를 그린다.
 *
 * 핀치줌·더블탭·팬은 새 네이티브 의존성(react-native-gesture-handler 등)
 * 없이 RN 코어의 `PanResponder`만으로 구현했다 — 이 프로젝트에 그런
 * 제스처 라이브러리가 아직 없어(package.json 확인) 이미지 한 장 보자고
 * 새 네이티브 모듈을 추가하는 건 배보다 배꼽이 크다.
 */
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import Button from '../../components/Input/Button/Button';
import ZoomableImage from '../../components/Data Display/Zoomable Image/ZoomableImage';
import { buildAuthenticatedImageSource } from '../../utils/authenticatedImage';
import { RECEIPT_DETAIL_CTA_LABEL } from '../../constants/receiptScreenText';
import { FILL_INVERSE, FOREGROUND_INVERSE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const CHEVRON_LEFT_ICON = require('../../assets/icons/nav/Chevron Left.png');

type ReceiptDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ReceiptDetailRouteProp = RouteProp<RootStackParamList, 'ReceiptDetail'>;

/** 'YYYY-MM-DD' -> 'YY.MM.DD'(시안 표기, 2자리 연도). */
function toShortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${year.slice(2)}.${month}.${day}`;
}

function ReceiptDetailScreen() {
  const navigation = useNavigation<ReceiptDetailNavigationProp>();
  const route = useRoute<ReceiptDetailRouteProp>();
  const { fileUrl, entryId, entryTitle, occurredOn } = route.params;

  const source = buildAuthenticatedImageSource(fileUrl);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Image source={CHEVRON_LEFT_ICON} style={styles.backIcon} />
        </Pressable>
        <View style={styles.headerTextColumn}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {entryTitle}
          </Text>
          <Text style={styles.headerSubtitle}>{toShortDate(occurredOn)}</Text>
        </View>
      </View>

      <ZoomableImage uri={source.uri} headers={source.headers} />

      <View style={styles.footer}>
        <Button
          label={RECEIPT_DETAIL_CTA_LABEL}
          fullWidth
          onPress={() => navigation.navigate('TransactionDetail', { transactionId: entryId })}
        />
      </View>
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
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: FOREGROUND_INVERSE,
  },
  headerTextColumn: {
    flex: 1,
  },
  headerTitle: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_INVERSE,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_INVERSE,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});

export default ReceiptDetailScreen;
