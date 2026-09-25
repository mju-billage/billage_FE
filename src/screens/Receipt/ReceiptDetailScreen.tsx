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
