import type { AccessToken, AuthGuardValidator, UserProfile } from '@badisi/auth-vue';
import { type RouteRecordRaw } from 'vue-router';

const hasRole = (role: string): AuthGuardValidator =>
  (_userProfile?: UserProfile, accessToken?: AccessToken): boolean | string => {
    const roles: string[] = (accessToken as any)?.['http://ngx-auth.com/roles'];
    return roles.includes(role) ? true : 'unauthorized';
  };

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },
  {
    path: '/secure',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/SecurePage.vue') }],
    meta: { authGuard: true },
    // meta: { authGuard: { fallbackUrl: 'unauthorized' } },
    // meta: { authGuard: { validator: () => false } },
    // meta: { authGuard: { validator: hasRole('view-profile') } }
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
