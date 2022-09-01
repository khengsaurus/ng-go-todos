import { gql } from 'apollo-angular';

export const GET_USER = gql`
  query GetUser($email: String!) {
    getUser(email: $email) {
      email
      username
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    getUsers {
      email
      username
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($newUser: NewUser!) {
    createUser(newUser: $newUser) {
      email
      username
    }
  }
`;
