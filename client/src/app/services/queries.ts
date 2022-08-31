import { gql } from 'apollo-angular';

export const GET_USER = gql`
  query GetUser($email: String!) {
    getUser(email: $email) {
      email
      username
      id
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    getUsers {
      username
      id
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($newUser: NewUser!) {
    createUser(newUser: $newUser) {
      id
    }
  }
`;
