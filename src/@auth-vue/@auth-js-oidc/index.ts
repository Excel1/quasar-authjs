import type { OIDCAuthSettings, Optional } from '@badisi/auth-js/oidc';
import type { InjectToken } from './models/inject-token.model';

export type { AuthGuardOptions } from './models/auth-guard-options.model';
export type { AuthGuardValidator } from './models/auth-guard-validator.model';
export type { InjectToken } from './models/inject-token.model';
export type { InjectTokenPattern } from './models/inject-token-pattern.model';

export { OIDCAuthService } from './oidc-auth-service';

// TODO: remove
export { OIDCAuthInterceptor } from './oidc-auth-interceptor';

// TODO: move to auth-js
export const DEFAULT_SETTINGS: Optional<OIDCAuthSettings, 'authorityUrl' | 'clientId'> = {
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

// TODO: move to the actual module
declare module '@badisi/auth-js/oidc' {
    interface OIDCAuthSettings {
        automaticLoginOn401?: boolean;
        automaticInjectToken?: InjectToken;
        authGuardFallbackUrl?: string;
    }
}
