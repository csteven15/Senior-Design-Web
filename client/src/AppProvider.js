import React from 'react';
import Amplify from 'aws-amplify';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SnackbarProvider } from 'notistack';
import { Button } from '@material-ui/core';
import theme from './theme/theme';
import { store, persistor } from './store';
import config from './config';
import App from './App';

Amplify.configure({
  Auth: {
    mandatorySignIn: false,
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    userPoolWebClientId: config.cognito.APP_CLIENT_ID,
  },
});

const AppProvider = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <MuiThemeProvider theme={theme}>
        <SnackbarProvider
          maxSnack={3}
          action={[
            <Button color='secondary' size='small' key={new Date().getTime() + Math.random()}>
              Dismiss
            </Button>,
          ]}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          hideIconVariant={false}
        >
          <App />
        </SnackbarProvider>
      </MuiThemeProvider>
    </PersistGate>
  </Provider>
);

export default AppProvider;
