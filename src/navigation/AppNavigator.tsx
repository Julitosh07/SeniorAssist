import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { HomeView } from '../views/Home/HomeView';
import { SOSView } from '../views/SOS/SOSView';
import { FlashlightView } from '../views/Flashlight/FlashlightView';
import { MagnifierView } from '../views/Magnifier/MagnifierView';
import { RadioView } from '../views/Radio/RadioView';
import { LearningView } from '../views/Learning/LearningView';
import { SimulatorView } from '../views/Learning/SimulatorView';
import { AlarmsView } from '../views/Alarms/AlarmsView';
import { ContactsView } from '../views/Contacts/ContactsView';
import { SettingsView } from '../views/Settings/SettingsView';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigateGlobal(screen: keyof RootStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    (navigationRef.navigate as any)(screen, params);
  }
}

export function goBackGlobal() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="Home" component={HomeView} />
        <Stack.Screen name="SOS" component={SOSView} />
        <Stack.Screen name="Flashlight" component={FlashlightView} />
        <Stack.Screen name="Magnifier" component={MagnifierView} />
        <Stack.Screen name="Radio" component={RadioView} />
        <Stack.Screen name="Learning" component={LearningView} />
        <Stack.Screen name="Simulator" component={SimulatorView} />
        <Stack.Screen name="Alarms" component={AlarmsView} />
        <Stack.Screen name="Contacts" component={ContactsView} />
        <Stack.Screen name="Settings" component={SettingsView} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
