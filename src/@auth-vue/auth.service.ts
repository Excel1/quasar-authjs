import { ref, reactive, computed } from 'vue';
import { AuthUtils, OIDCAuthManager, UserSession } from '@badisi/auth-js/oidc';
import type { Router } from 'vue-router';
import type {
  AccessToken,
  AuthSubscription,
  IdToken,
  LoginArgs,
  LogoutArgs,
  RenewArgs,
  UserProfile,
} from '@badisi/auth-js/oidc';

import type { AuthSettings } from './auth-settings.model';

export class AuthService {
  #authManagerSubs: AuthSubscription[] = reactive([]);
  #manager: OIDCAuthManager;
  #router: Router;

  constructor(manager: OIDCAuthManager, router: Router) {
    this.#manager = manager;
    this.#router = router;
    this.#listenForManagerChanges();
  }

  public destroy(): void {
    this.#authManagerSubs.forEach((sub) => sub.unsubscribe());
  }

  // --- OIDCAuthManager ---

  /**
   * @see {@link OIDCAuthManager.login}
   */
  public async login(args?: LoginArgs): Promise<boolean> {
    return this.#manager.login(args);
  }

  /**
   * @see {@link OIDCAuthManager.logout}
   */
  public async logout(args?: LogoutArgs): Promise<void> {
    return this.#manager.logout(args);
  }

  /**
   * @see {@link OIDCAuthManager.renew}
   */
  public async renew(args?: RenewArgs): Promise<void> {
    return this.#manager.renew(args);
  }

  /**
   * @see {@link OIDCAuthManager.getSettings}
   */
  public getSettings(): AuthSettings {
    return this.#manager.getSettings() as AuthSettings;
  }

  /**
   * @see {@link OIDCAuthManager.isRenewing}
   */
  public isRenewing(): boolean {
    return this.#manager.isRenewing();
  }
  public readonly isRenewingRef = ref<boolean>(false);

  /**
   * @see {@link OIDCAuthManager.isAuthenticated}
   */
  public async isAuthenticated(): Promise<boolean> {
    return this.#manager.isAuthenticated();
  }
  public readonly isAuthenticatedRef = ref<boolean>(false);

  /**
   * @see {@link OIDCAuthManager.getUserProfile}
   */
  public async getUserProfile(): Promise<UserProfile | undefined> {
    return this.#manager.getUserProfile();
  }
  public readonly userProfileRef = ref<UserProfile | undefined>(undefined);

  /**
   * @see {@link OIDCAuthManager.getUserSession}
   */
  public async getUserSession(): Promise<UserSession | undefined> {
    return this.#manager.getUserSession();
  }
  public readonly userSessionRef = ref<UserSession | undefined>(undefined);

  /**
   * @see {@link OIDCAuthManager.getIdToken}
   */
  public async getIdToken(): Promise<string | undefined> {
    return this.#manager.getIdToken();
  }
  public readonly idTokenRef = ref<string | undefined>(undefined);

  /**
   * @see {@link OIDCAuthManager.getIdTokenDecoded}
   */
  public async getIdTokenDecoded(): Promise<IdToken | string | undefined> {
    return this.#manager.getIdTokenDecoded();
  }
  public readonly idTokenDecodedRef = computed(() =>
    this.idTokenRef.value
      ? AuthUtils.decodeJwt<string>(this.idTokenRef.value)
      : undefined
  );

  /**
   * @see {@link OIDCAuthManager.getAccessToken}
   */
  public async getAccessToken(): Promise<string | undefined> {
    return this.#manager.getAccessToken();
  }
  public readonly accessTokenRef = ref<string | undefined>(undefined);

  /**
   * @see {@link OIDCAuthManager.getAccessTokenDecoded}
   */
  public async getAccessTokenDecoded(): Promise<
    AccessToken | string | undefined
  > {
    return this.#manager.getAccessTokenDecoded();
  }
  public readonly accessTokenDecodedRef = computed(() =>
    this.accessTokenRef.value
      ? AuthUtils.decodeJwt<AccessToken>(this.accessTokenRef.value)
      : undefined
  );

  // --- HELPER(s) ----

  #listenForManagerChanges(): void {
    this.#authManagerSubs.push(
      this.#manager.onIdTokenChanged((value) => {
        this.idTokenRef.value = value;
      }),
      this.#manager.onAccessTokenChanged((value) => {
        this.accessTokenRef.value = value;
      }),
      this.#manager.onUserProfileChanged((value) => {
        this.userProfileRef.value = value;
      }),
      this.#manager.onUserSessionChanged((value) => {
        this.userSessionRef.value = value;
      }),
      this.#manager.onAuthenticatedChanged((value) => {
        this.isAuthenticatedRef.value = value;
      }),
      this.#manager.onRenewingChanged((value) => {
        this.isRenewingRef.value = value;
      }),
      this.#manager.onRedirect((value) => {
        /**
         * Make sure to navigate to an absolute path from the base url.
         * So we need to substract the base url from the received url.
         * ex: transform 'http://domain/base/private' to '/private'
         */
        const absoluteUrl = value.href.replace(AuthUtils.getBaseUrl(), '');
        this.#router.push(absoluteUrl);
      })
    );
  }
}
