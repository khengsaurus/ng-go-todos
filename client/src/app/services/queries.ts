import { gql } from 'apollo-angular';
import { ITodo, IUser } from 'src/types';

export interface IGET_USER {
  getUser: IUser;
}

export const GET_USER = gql`
  query GetUser($email: String!) {
    getUser(email: $email) {
      id
      email
      username
    }
  }
`;

export interface IGET_USERS {
  getUsers: IUser[];
}

export const GET_USERS = gql`
  query GetUsers {
    getUsers {
      email
      username
    }
  }
`;

export interface ICREATE_USER {
  createUser: IUser;
}

export const CREATE_USER = gql`
  mutation CreateUser($newUser: NewUser!) {
    createUser(newUser: $newUser) {
      email
      username
    }
  }
`;

export interface IGET_TODOS {
  getTodos: ITodo[];
}

export const GET_TODOS = gql`
  query GetTodos($userId: String!, $fresh: Boolean!) {
    getTodos(userId: $userId, fresh: $fresh) {
      id
      userId
      text
      priority
      tag
      done
    }
  }
`;

export interface ICREATE_TODO {
  createTodo: ITodo;
}

export const CREATE_TODO = gql`
  mutation createTodo($newTodo: NewTodo!) {
    createTodo(newTodo: $newTodo) {
      id
      userId
      text
      priority
      tag
      done
    }
  }
`;

export interface IUPDATE_TODO {
  updateTodo: ITodo;
}

export const UPDATE_TODO = gql`
  mutation updateTodo($updateTodo: UpdateTodo!) {
    updateTodo(updateTodo: $updateTodo) {
      id
      text
      priority
      tag
      done
    }
  }
`;
