import {initOidc, OIDCAuthManager, OIDCAuthSettings} from "@badisi/auth-js/oidc";
import {api} from "boot/axios";
import axios from "axios";
import {Platform} from "quasar";

// ToDo: OIDC INIT, LOGIN, LOGOUT, REFRESH TOKEN, INTERCEPTOR

let authManager: OIDCAuthManager | null = null;
export default {
  async initOIDC() {
    try {
      // ToDo: Error: initOidc is not a function
      authManager = await initOidc(getOIDCSettings())
    } catch (error) {
      throw new Error('Can´t create Account: ' + error);
    }
  },
  async login() {
    try {
      await authManager?.login()
    } catch (error) {
      throw new Error('Can´t get Account: ' + error);
    }
  },
  async logout() {
    try {
      await authManager?.logout()
    } catch (error) {
      throw new Error('Can´t get Account: ' + error);
    }
  },
  // Typically this would hold in store or lib itself
  isAuthenicated() {
    return authManager?.isAuthenticated()
  }
};

function getOIDCSettings(): OIDCAuthSettings {
  // ToDo: set signin redirect callback url to surround quasar bugs:
  /*
  userManager.signinRedirectCallback(window.location.href.replace('/#/', '/')); android
  userManager.signinRedirectCallback(window.location.href.replace('#/', '/')); ios
   */
  if (Platform.is.android) {
    return {
      authorityUrl: '',
      clientId: '',
      mobileScheme: 'android',
    }
  } else if (Platform.is.ios) {
    return {
      authorityUrl: '',
      clientId: '',
      mobileScheme: 'ios',
    }
  } else {
    return {
      authorityUrl: '',
      clientId: '',
    }
  }
}

function registerTokenInterceptor() {
  api.interceptors.request.use(async (config) => {

    const status = await Network.getStatus();
    console.log('Network status:', status.connected);
    if (!status.connected) {
      return Promise.reject(new axios.Cancel('No internet connection'));
    }

    console.log('Request interceptor:', config);

    if (authManager?.isAuthenticated()) {
      config.headers.Authorization = `Bearer ${user.access_token}`;
    }
    if (!authManager?.isAuthenticated()) {
      await this.initOIDC();
      config.headers.Authorization = `Bearer ${user?.access_token}`;
    }
    return config;
  });
}

// ToDo: if needed. Set Refresh Token interval

/*
Reason for the function:
Give the possibility to stay logged in, even if the oidc provider isnt reachable - thats why the refresh token is used


function setTokenInterval() {
  refreshTokenInterval = setInterval(refreshAccessToken, 1000000);
}

async function refreshAccessToken() {
  if (currentUser) {
    try {
      currentUser = await userManager?.signinSilent();
      if (currentUser && !currentUser.expired) {
        console.log('Access token refreshed');
        lastLoginTime = String(Date.now());
      } else {
        console.log('Access token refresh failed');
      }
    } catch (error) {
      console.error('Error refreshing access token:', error);
      if (error instanceof Error && error.message === 'Stale token') {
        console.log('Stale token, signing out');
        await logoutDeviceSpecific();
      }

      // 28 days
      if (lastLoginTime && Date.now() - Number(lastLoginTime) > 2419200000) {
        console.log('Token expired, signing out');
        await logoutDeviceSpecific();
      }
    }

    if (lastLoginTime && Date.now() - Number(lastLoginTime) > 2419200000) {
      console.log('Token expired, signing out');
      await logoutDeviceSpecific();
    }
  }
}
 */

