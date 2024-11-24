import { OIDCAuthManager, UserSession } from '@badisi/auth-js/oidc';
import type {
    AccessToken, OIDCAuthSettings, IdToken, LoginArgs, LogoutArgs, RenewArgs, UserProfile,
} from '@badisi/auth-js/oidc';
import type { AuthGuardOptions } from './models/auth-guard-options.model';
import { OIDCAuthGuard } from './oidc-auth-guard';

export abstract class OIDCAuthService<T extends OIDCAuthSettings = OIDCAuthSettings> {
    protected manager: OIDCAuthManager;

    constructor(manager: OIDCAuthManager) {
        this.manager = manager;
    }

    /**
     * @see {@link OIDCAuthManager.login}
     */
    public async login(args?: LoginArgs): Promise<boolean> {
        return this.manager.login(args);
    }

    /**
     * @see {@link OIDCAuthManager.logout}
     */
    public async logout(args?: LogoutArgs): Promise<void> {
        return this.manager.logout(args);
    }

    /**
     * @see {@link OIDCAuthManager.renew}
     */
    public async renew(args?: RenewArgs): Promise<void> {
        return this.manager.renew(args);
    }

    /**
     * @see {@link OIDCAuthManager.isRenewing}
     */
    public isRenewing(): boolean {
        return this.manager.isRenewing();
    }

    /**
     * @see {@link OIDCAuthManager.isAuthenticated}
     */
    public async isAuthenticated(): Promise<boolean> {
        return this.manager.isAuthenticated();
    }

    /**
     * @see {@link OIDCAuthManager.getSettings}
     */
    public getSettings(): T {
        return this.manager.getSettings() as T;
    }

    /**
     * @see {@link OIDCAuthManager.getUserProfile}
     */
    public async getUserProfile(): Promise<UserProfile | undefined> {
        return this.manager.getUserProfile();
    }

    /**
     * @see {@link OIDCAuthManager.getUserSession}
     */
    public async getUserSession(): Promise<UserSession | undefined> {
        return this.manager.getUserSession();
    }

    /**
     * @see {@link OIDCAuthManager.getIdToken}
     */
    public async getIdToken(): Promise<string | undefined> {
        return this.manager.getIdToken();
    }

    /**
     * @see {@link OIDCAuthManager.getIdTokenDecoded}
     */
    public async getIdTokenDecoded(): Promise<IdToken | string | undefined> {
        return this.manager.getIdTokenDecoded();
    }

    /**
     * @see {@link OIDCAuthManager.getAccessToken}
     */
    public async getAccessToken(): Promise<string | undefined> {
        return this.manager.getAccessToken();
    }

    /**
     * @see {@link OIDCAuthManager.getAccessTokenDecoded}
     */
    public async getAccessTokenDecoded(): Promise<AccessToken | string | undefined> {
        return this.manager.getAccessTokenDecoded();
    }

    // TODO: also move to manager
    public async runGuard(toUrl: string, options?: AuthGuardOptions): Promise<string | boolean> {
        const authGuard = new OIDCAuthGuard(this.manager);
        return authGuard.validate(toUrl, options);
    }
}
