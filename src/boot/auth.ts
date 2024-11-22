import { boot } from 'quasar/wrappers';
import { initAuth } from '@badisi/auth-vue';

export default boot(async ({ app, router }) => {
  const AuthPlugin = await initAuth({
    authorityUrl: 'https://dev-fijd1e9x.us.auth0.com',
    clientId: 'kRVVEnAWKMpxxpcodl0TqLXfIHgQvmmt',
    scope: 'openid profile email phone offline_access',
    mobileScheme: 'demo-app',
    loginRequired: false,
  });
  app.use(AuthPlugin, { router });
});
