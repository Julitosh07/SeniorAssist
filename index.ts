import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent llama a AppRegistry.registerComponent('main', () => App);
// Garantiza compatibilidad universal entre Expo Go, Web y builds nativas de Android.
registerRootComponent(App);
