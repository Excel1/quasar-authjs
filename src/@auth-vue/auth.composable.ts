import { inject } from 'vue';
import type { AuthService } from './auth.service';

export function useAuthService(): AuthService {
  const authService = inject<AuthService>('$authService');
  if (!authService) {
    throw new Error('AuthService is not provided');
  }
  return authService;
}
