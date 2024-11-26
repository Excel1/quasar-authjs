import type { OIDCAuthManager } from '@badisi/auth-js/oidc';
import type { AuthGuardOptions } from './models/auth-guard-options.model';
import type { AuthGuardValidator } from './models/auth-guard-validator.model';

export class OIDCAuthGuard {
    #manager: OIDCAuthManager;

    constructor(manager: OIDCAuthManager) {
        this.#manager = manager;
    }

    public async validate(toUrl: string, options?: AuthGuardOptions): Promise<boolean | string> {
        const notAllowedUrl = options?.fallbackUrl ?? this.#manager.getSettings()?.authGuardFallbackUrl;
        const isAuthenticated = await this.#manager.isAuthenticated();
        if (isAuthenticated) {
            const isAllowed = await this.#isAllowed(options?.validator);
            return !isAllowed && notAllowedUrl ? notAllowedUrl : isAllowed;
        } else {
            return notAllowedUrl ?? (await this.#manager.login({ redirectUrl: toUrl }));
        }
    }

    // ---- HELPER(s) ----

    async #isAllowed(validator?: AuthGuardValidator): Promise<boolean | string> {
        if (typeof validator === 'function') {
            const userProfile = await this.#manager.getUserProfile();
            const decodedAccessToken = await this.#manager.getAccessTokenDecoded();
            return await Promise.resolve(validator(userProfile, decodedAccessToken));
        } else if (validator) {
            // TODO: improve logger
            console.error('authGuardValidator must be a function');
            return false;
        }
        return true;
    }
}
