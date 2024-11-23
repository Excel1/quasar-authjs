import type { AuthGuardOptions } from './@auth-js-oidc';

import { useAuthService } from './auth.service';

export const useAuthGuard = async (options: AuthGuardOptions): Promise<boolean | string> =>
    useAuthService().runGuard(options);
