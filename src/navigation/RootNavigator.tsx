import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import { useState } from 'react';
import SignupScreen from '../screens/SignupScreen';

export type RootStackParamList = {
  Splash: undefined;
  Signup: undefined;

};

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {

  const [isLoding, setIsLoding] = useState(false)

  if (isLoding) {
    return <SplashScreen />
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Signup"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name='Signup'
          component={SignupScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
