import { initOidc, type OIDCAuthSettings } from '@badisi/auth-js/oidc';
import { DEFAULT_SETTINGS, OIDCAuthInterceptor } from './@auth-js-oidc';
import type { Router } from 'vue-router';
import type { App, Plugin } from 'vue';

import { AuthService } from './auth.service';
import { useAuthGuard } from './auth.guard';

export interface AuthSettings extends OIDCAuthSettings { };

export const initAuth = async (settings: AuthSettings): Promise<Plugin> => {
    /**
     *  Vue do not wait for a plugin to be installed if the installation is async.
     *  So we have to get the authManager prior of the plugin installation phase, to
     *  make sur any code that will use it later on, will actually get it.
     */
    const authManager = await initOidc({ ...DEFAULT_SETTINGS, ...settings });
    return {
        install: (app: App, { router }: { router: Router; }) => {
            // Effectively adding authService to every component instance
            const authService = new AuthService(authManager, router);
            app.provide('$authService', authService);
            app.config.globalProperties.$authService = authService;

            // TODO: add to auth-js manager directly
            // Add interceptor
            new OIDCAuthInterceptor(authManager);

            // Add global router guard
            router.beforeEach(async (to, _from, next) => {
                if (to.meta.authGuard) {
                    next(await useAuthGuard(
                        to.fullPath,
                        typeof to.meta.authGuard === 'object' ? to.meta.authGuard : undefined
                    ) as unknown);
                } else {
                    next();
                }
            });
        },
    };
};
