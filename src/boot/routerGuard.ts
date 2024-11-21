import {boot} from "quasar/wrappers";
import authService from "src/services/auth.service";

// ToDo: This file runs on startup and is used to protect routes
// ToDo: produces error - is not a function
export default boot(({ router }) => {
  authService.initOIDC().then(() => {
    console.log('OIDC client initialized');
  }).catch((error) => {
    console.error('Failed to initialize OIDC client:', error);
  });

  // App Listener Capacitor
  // ...

  // Set up router guard
  router.beforeEach(async (to, from, next) => {
    if (to.matched.some(record => record.meta?.requiresAuth)) {
      if (authService.isAuthenticated()) {
        next();
      } else {
        next('/');
      }
    } else {
      next();
    }
  });
});

/*
OLD CODE
If oidc not reachable it uses the refresh token (isOfflineAuthenticated) to authenticate the user.


  router.beforeEach(async (to, from, next) => {

    // clear url from keycloak params
    if (authStore.isOfflineAuthenticated && to.fullPath.includes('/login')) {
      next('/');
    }

    if (to.matched.some(record => record.meta?.requiresAuth)) {
      if (authStore.isOfflineAuthenticated) {
        next();
      } else {
        next('/home');
      }
    } else {
      next();
    }
  });



*/
