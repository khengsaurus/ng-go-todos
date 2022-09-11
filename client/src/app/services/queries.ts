import { gql } from 'apollo-angular';
import { ITodo, IUser } from 'src/types';

const fragments = {
  UserRepr: gql`
    fragment UserFields on User {
      id
      email
      username
    }
  `,
  TodoRepr: gql`
    fragment TodoFields on Todo {
      id
      userId
      text
      priority
      tag
      done
    }
  `,
};

export interface IGET_USER {
  getUser: IUser;
}

export const GET_USER = gql`
  query GetUser($email: String!) {
    getUser(email: $email) {
      ...UserFields
    }
  }
  ${fragments.UserRepr}
`;

export interface IGET_USERS {
  getUsers: IUser[];
}

export const GET_USERS = gql`
  query GetUsers {
    getUsers {
      ...UserFields
    }
  }
  ${fragments.UserRepr}
`;

export interface ICREATE_USER {
  createUser: IUser;
}

export const CREATE_USER = gql`
  mutation CreateUser($newUser: NewUser!) {
    createUser(newUser: $newUser) {
      ...UserFields
    }
  }
  ${fragments.UserRepr}
`;

export interface IGET_TODOS {
  getTodos: ITodo[];
}

export const GET_TODOS = gql`
  query GetTodos($userId: String!, $fresh: Boolean!) {
    getTodos(userId: $userId, fresh: $fresh) {
      ...TodoFields
    }
  }
  ${fragments.TodoRepr}
`;

export interface ICREATE_TODO {
  createTodo: ITodo;
}

export const CREATE_TODO = gql`
  mutation createTodo($newTodo: NewTodo!) {
    createTodo(newTodo: $newTodo) {
      ...TodoFields
    }
  }
  ${fragments.TodoRepr}
`;

export interface IUPDATE_TODO {
  updateTodo: string;
}

export const UPDATE_TODO = gql`
  mutation updateTodo($updateTodo: UpdateTodo!) {
    updateTodo(updateTodo: $updateTodo)
  }
`;

export interface IDELETE_TODO {
  deleteTodo: string;
}

export const DELETE_TODO = gql`
  mutation deleteTodo($userId: String!, $todoId: String!) {
    deleteTodo(userId: $userId, todoId: $todoId)
  }
`;
