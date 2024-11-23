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

export type {
    AuthGuardOptions,
    AuthGuardValidator
} from './@auth-js-oidc';

export {
    Log,
    AuthUtils,
    UserSession,
    DesktopNavigation
} from '@badisi/auth-js/oidc';

export type {
    AuthSettings,
    InjectToken,
    InjectTokenPattern
} from './auth.models';

export { useAuthService, AuthService } from './auth.service';
export { useAuthGuard } from './auth.guard';
export { initAuth } from './auth';
