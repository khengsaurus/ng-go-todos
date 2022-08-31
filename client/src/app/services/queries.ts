import { gql } from 'apollo-angular';

export const GET_USERS = gql`
  {
    getUsers {
      username
      id
    }
  }
`;
