import { AuthService } from './auth.service';

declare module 'vue' {
  export interface ComponentCustomProperties {
    $authService: AuthService;
  }
}

declare module 'vue-router' {
  export interface RouteMeta {
    requiresAuth?: boolean;
  }
}

export {
  Log,
  AuthUtils,
  UserSession,
  DesktopNavigation,
} from '@badisi/auth-js/oidc';
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
  AuthSettings,
  InjectToken,
  InjectTokenPattern,
} from './auth-settings.model';
// export type { AuthGuardValidator, AuthGuardData } from './auth.guard';

// export { AuthInterceptor } from './auth.interceptor';
export { AuthService } from './auth.service';
// export { AuthGuard } from './auth.guard';
export { useAuthService } from './auth.composable';
export { initAuth } from './auth';
