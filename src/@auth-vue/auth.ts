import { initOidc, type Optional } from '@badisi/auth-js/oidc';
import type { Router } from 'vue-router';
import type { App, Plugin } from 'vue';
import { watchEffect } from 'vue';

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

export const initAuth = async (settings: AuthSettings): Promise<Plugin> => {
  /**
   *  Vue do not wait for a plugin to be installed if the installation is async.
   *  So we have to get the authManager prior of the plugin installation phase, to
   *  make sur any code that will use it later on, will actually get it.
   */
  const authManager = await initOidc({ ...DEFAULT_SETTINGS, ...settings });
  return {
    install: (app: App, { router }: { router: Router }) => {
      // Effectively adding authService to every component instance
      const authService = new AuthService(authManager, router);
      app.provide('$authService', authService);
      app.config.globalProperties.$authService = authService;

      // Add global router guard
      router.beforeEach((to, _from, next) => {
        if (to.matched.some((record) => record.meta.requiresAuth)) {
          watchEffect(async () => {
            if (authService.isAuthenticatedRef.value) {
              next();
            } else {
              await authService.login({ redirectUrl: to.path });
              next(false);
            }
          });
        } else {
          next();
        }
      });
    },
  };
};
