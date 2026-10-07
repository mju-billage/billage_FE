import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FolderScreen from './FolderScreen';

export type FolderTabParamList = {
  FolderList: { folderId?: string; folderName?: string } | undefined;
};

const Stack = createNativeStackNavigator<FolderTabParamList>();

function FolderTabNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FolderList" component={FolderScreen} />
    </Stack.Navigator>
  );
}

export default FolderTabNavigator;
