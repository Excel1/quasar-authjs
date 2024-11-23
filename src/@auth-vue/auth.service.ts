import { AuthUtils, OIDCAuthManager, UserSession } from '@badisi/auth-js/oidc';
import { OIDCAuthService } from './@auth-js-oidc';
import { ref, computed, inject } from 'vue';
import type { Router } from 'vue-router';
import type { AccessToken, AuthSubscription, UserProfile } from '@badisi/auth-js/oidc';

import type { AuthSettings } from './auth.models';

export const useAuthService = (): AuthService => {
    const authService = inject<AuthService>('$authService');
    if (!authService) {
        throw new Error('AuthService is not provided');
    }
    return authService;
};

export class AuthService extends OIDCAuthService<AuthSettings> {
    #authManagerSubs: AuthSubscription[] = [];
    #router: Router;

    constructor(manager: OIDCAuthManager, router: Router) {
        super(manager);
        this.#router = router;
        this.#listenForManagerChanges();
    }

    public destroy(): void {
        this.#authManagerSubs.forEach((sub) => sub.unsubscribe());
    }

    /**
     * @see {@link OIDCAuthManager.isRenewing}
     */
    public readonly isRenewingRef = ref<boolean | undefined>();

    /**
     * @see {@link OIDCAuthManager.isAuthenticated}
     */
    public readonly isAuthenticatedRef = ref<boolean | undefined>();

    /**
     * @see {@link OIDCAuthManager.getUserProfile}
     */
    public readonly userProfileRef = ref<UserProfile | undefined>();

    /**
     * @see {@link OIDCAuthManager.getUserSession}
     */
    public readonly userSessionRef = ref<UserSession | undefined>();

    /**
     * @see {@link OIDCAuthManager.getIdToken}
     */
    public readonly idTokenRef = ref<string | undefined>();

    /**
     * @see {@link OIDCAuthManager.getIdTokenDecoded}
     */
    public readonly idTokenDecodedRef = computed(() =>
        this.idTokenRef.value ? AuthUtils.decodeJwt<string>(this.idTokenRef.value) : undefined
    );

    /**
     * @see {@link OIDCAuthManager.getAccessToken}
     */
    public readonly accessTokenRef = ref<string | undefined>();

    /**
     * @see {@link OIDCAuthManager.getAccessTokenDecoded}
     */
    public readonly accessTokenDecodedRef = computed(() =>
        this.accessTokenRef.value ? AuthUtils.decodeJwt<AccessToken>(this.accessTokenRef.value) : undefined
    );

    // --- HELPER(s) ----

    #listenForManagerChanges(): void {
        this.#authManagerSubs.push(
            this.getManager().onIdTokenChanged((value) => {
                this.idTokenRef.value = value;
            }),
            this.getManager().onAccessTokenChanged((value) => {
                this.accessTokenRef.value = value;
            }),
            this.getManager().onUserProfileChanged((value) => {
                this.userProfileRef.value = value;
            }),
            this.getManager().onUserSessionChanged((value) => {
                this.userSessionRef.value = value;
            }),
            this.getManager().onAuthenticatedChanged((value) => {
                this.isAuthenticatedRef.value = value;
            }),
            this.getManager().onRenewingChanged((value) => {
                this.isRenewingRef.value = value;
            }),
            this.getManager().onRedirect((value) => {
                /**
                 * Make sure to navigate to a relative path from the base url.
                 * => we need to substract the base url from the received url.
                 * ex: transform 'http://domain/base/private?param' to '/private?param'
                 */
                const relativeUrl = value.href.replace(AuthUtils.getBaseUrl(), '');
                this.#router.isReady().then(() => this.#router.push(relativeUrl));
            })
        );
    }
}
