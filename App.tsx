import React from 'react';

import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TabletSplitter from './src/Components/TabletSplitter/TabletSplitter';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Provider store={store}>
        <TabletSplitter />
      </Provider>
    </SafeAreaProvider>
  );
}

export default App;
