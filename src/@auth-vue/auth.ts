import { initOidc, type Optional } from '@badisi/auth-js/oidc';
import type { Router } from 'vue-router';
import type { App, Plugin } from 'vue';

import type { AuthSettings } from './auth-settings.model';
import { AuthService } from './auth.service';

const DEFAULT_SETTINGS: Optional<AuthSettings, 'authorityUrl' | 'clientId'> = {
  automaticLoginOn401: true,
  automaticInjectToken: {
    include: (url: string): boolean => {
      const res = new URL(url, 'http://default-base');
      return (
        res.hostname.startsWith('api') ||
        res.pathname.startsWith('/api') ||
        false
      );
    },
  },
};

export const initAuth = async (settings: AuthSettings): Promise<Plugin> => ({
  install: async (app: App, { router }) => {
    const authManager = await initOidc({ ...DEFAULT_SETTINGS, ...settings });
    app.config.globalProperties.$authService = new AuthService(
      authManager,
      router
    );
  },
});
