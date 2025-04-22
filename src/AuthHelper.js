/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { LogLevel, InteractionRequiredAuthError } from '@azure/msal-browser';

/**
 * Configuration object to be passed to MSAL instance on creation. 
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md 
 */

export const msalConfig = {
    auth: {
        clientId: 'cf0e4551-0703-49ac-bbf2-d866a75a2c48', // This is the ONLY mandatory field that you need to supply.
        authority: 'https://login.microsoftonline.com/hosting.is', // Replace the placeholder with your tenant subdomain 
        redirectUri: window.location.origin, // Points to window.location.origin. You must register this URI on Microsoft Entra admin center/App Registration.
        postLogoutRedirectUri: '/', // Indicates the page to navigate after logout.
        navigateToLoginRequestUrl: false, // If "true", will navigate back to the original request location before processing the auth code response.
    },
    cache: {
        cacheLocation: 'localStorage', // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                    default:
                        return;
                }
            },
        },
    },
};

/**
 * Default login scopes for interactive sign-in (OIDC scopes only).
 */
export const loginRequest = {
    scopes: ["openid", "profile"],
};

/**
 * Scopes for Log Analytics API.
 */
export const logAnalyticsRequest = {
    scopes: ["https://api.loganalytics.io/Data.Read"],
};

/**
 * Scopes for Azure Resource Management (Graph) API.
 */
export const graphRequest = {
    scopes: ["https://management.azure.com/user_impersonation"],
};

/**
 * An optional silentRequest object can be used to achieve silent SSO
 * between applications by providing a "login_hint" property.
 */
// export const silentRequest = {
//     scopes: ["openid", "profile"],
//     loginHint: "example@domain.net"
// };

/**
 * Attempts to acquire token silently, falls back to interactive redirect if needed.
 */
export async function acquireTokenWithFallback(instance, request) {
    try {
        return await instance.acquireTokenSilent(request);
    } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
            // Interactive login required for consent or MFA
            return instance.acquireTokenRedirect(request);
        }
        throw error;
    }
}