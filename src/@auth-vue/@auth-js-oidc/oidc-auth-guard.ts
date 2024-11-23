import { AuthUtils, type AccessToken, type OIDCAuthManager } from '@badisi/auth-js/oidc';
import type { AuthGuardOptions } from './models/auth-guard-options.model';
import type { AuthGuardValidator } from './models/auth-guard-validator.model';

export class OIDCAuthGuard {
    #manager: OIDCAuthManager;

    constructor(manager: OIDCAuthManager) {
        this.#manager = manager;
    }

    public async validate(options?: AuthGuardOptions): Promise<boolean | string> {
        // TODO: add 'authGuardFallbackUrl' to auth-js type
        const notAllowedUrl = options?.fallbackUrl ?? this.#manager.getSettings()?.['authGuardFallbackUrl'];

        const isAuthenticated = await this.#isAuthenticated();
        if (isAuthenticated) {
            const isAllowed = await this.#isAllowed(options?.validator);
            return !isAllowed && notAllowedUrl ? notAllowedUrl : isAllowed;
        } else {
            return notAllowedUrl ?? (await this.#manager.login({ redirectUrl: options.redirectUrl ?? location.href }));
        }
    }

    // ---- HELPER(s) ----

    async #isAllowed(validator?: AuthGuardValidator): Promise<boolean | string> {
        if (typeof validator === 'function') {
            return new Promise((resolve) => {
                this.#manager.onUserProfileChanged(
                    (userProfile) => {
                        this.#manager.onAccessTokenChanged(
                            async (accessToken) => {
                                const decodedAccessToken = AuthUtils.decodeJwt<AccessToken>(accessToken);
                                resolve(await Promise.resolve(validator(userProfile, decodedAccessToken)));
                            },
                            { once: true }
                        );
                    },
                    { once: true }
                );
            });
        } else if (validator) {
            // TODO: improve logger
            console.error('authGuardValidator must be a function');
            return false;
        }
        return true;
    }

    async #isAuthenticated(): Promise<boolean> {
        return new Promise((resolve) => {
            this.#manager.onAuthenticatedChanged((value) => resolve(value), { once: true });
        });
    }
}
