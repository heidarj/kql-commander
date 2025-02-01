import React from 'react';
import ReactDOM from 'react-dom/client';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import './index.css';
import App from './App';
import { msalConfig } from './AuthHelper';

const root = ReactDOM.createRoot(document.getElementById('root'));

const msalInstance = new PublicClientApplication(msalConfig);
await msalInstance.initialize();

// Default to using the first account if no account is active on page load
if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
  // Account selection logic is app dependent. Adjust as needed for different use cases.
  msalInstance.setActiveAccount(msalInstance.getActiveAccount()[0]);
}

// Listen for sign-in event and set active account
msalInstance.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
      const account = event.payload.account;
      msalInstance.setActiveAccount(account);
  }
});

root.render(
  <React.StrictMode>
    <FluentProvider theme={webLightTheme}>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </FluentProvider>
  </React.StrictMode>
);
