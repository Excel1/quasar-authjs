import { boot } from 'quasar/wrappers';
import { initAuth } from '@badisi/auth-vue';

export default boot(async ({ app, router }) => {
  const AuthPlugin = await initAuth({
    authorityUrl: 'https://dev-fijd1e9x.us.auth0.com',
    clientId: 'kRVVEnAWKMpxxpcodl0TqLXfIHgQvmmt',
    scope: 'openid profile email phone offline_access read:current_user',
    internal: {
      extraQueryParams: {
        audience: 'https://dev-fijd1e9x.us.auth0.com/api/v2/' // required by Auth0 to get access_token in JWT format
      }
    },
    mobileScheme: 'demo-app',
    loginRequired: false,
  });
  app.use(AuthPlugin, { router });
});
