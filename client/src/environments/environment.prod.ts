import { firebase } from './configuration';

export const environment = {
  firebase,
  production: true,
  gqlApi: 'http://localhost:8080/gql_api',
  restApi: 'http://localhost:8080/rest_api',
};
