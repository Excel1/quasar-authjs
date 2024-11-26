import type { AuthGuardOptions } from './@auth-js-oidc';
import { AuthService } from './auth.service';

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $authService: AuthService;
    }
}

declare module 'vue-router' {
    export interface RouteMeta {
        authGuard?: boolean | AuthGuardOptions;
    }
}

export type {
    UserProfile,
    AccessToken,
    IdToken,
    MobileWindowParams,
    LoginArgs,
    LogoutArgs,
    RenewArgs,
    SigninMobileArgs,
    SignoutMobileArgs,
} from '@badisi/auth-js/oidc';

// TODO: should be moved to @badisi/auth-js/oidc
export type {
    InjectToken,
    InjectTokenPattern,
    AuthGuardOptions,
    AuthGuardValidator
} from './@auth-js-oidc';

export {
    Log,
    AuthUtils,
    UserSession,
    DesktopNavigation
} from '@badisi/auth-js/oidc';

export { useAuthService, AuthService } from './auth.service';
export { useAuthGuard } from './auth.guard';
export { initAuth } from './auth';
