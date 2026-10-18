import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import ZoomableImage from '../../components/Data Display/Zoomable Image/ZoomableImage';
import { useAuthenticatedImage } from '../../hooks/useAuthenticatedImage';
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

  const { uri, status } = useAuthenticatedImage(fileUrl);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.closeButton}>
          <Image source={CLOSE_ICON} style={styles.closeIcon} />
        </Pressable>
      </View>

      {status === 'ready' && uri ? (
        <ZoomableImage uri={uri} />
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={FOREGROUND_INVERSE} />
        </View>
      )}
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
    paddingHorizontal: 20,
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TransactionReceiptDetailScreen;
