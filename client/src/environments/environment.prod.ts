import { firebase } from './firebaseConfig';

export const environment = {
  firebase,
  production: true,
  gqlApi: `${process.env.NG_APP_SERVER_PROD}/${process.env.NG_APP_GQL_API}`,
  restApi: `${process.env.NG_APP_SERVER_PROD}/${process.env.NG_APP_REST_API}`,
};
