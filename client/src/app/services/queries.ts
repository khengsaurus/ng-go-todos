import { gql } from 'apollo-angular';
import { IBoard, ITodo, IUser } from 'src/types';

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
  BoardRepr: gql`
    fragment BoardFields on Board {
      id
      userId
      name
      todos {
        id
        userId
        text
        priority
        tag
        done
      }
    }
  `,
};

/* ------------------------- USERS ------------------------- */

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

export interface IADD_TODO_TO_BOARD {
  addTodoToBoard: String;
}

export const ADD_TODO_TO_BOARD = gql`
  mutation AddTodoToBoard($todoId: String!, $boardId: String!) {
    addTodoToBoard(todoId: $todoId, boardId: $boardId)
  }
`;

/* ------------------------- TODOS ------------------------- */

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

/* ------------------------- BOARDS ------------------------- */

export interface IGET_BOARDS {
  getBoards: IBoard[];
}

export const GET_BOARDS = gql`
  query GetBoards($userId: String!, $fresh: Boolean!) {
    getBoards(userId: $userId, fresh: $fresh) {
      ...BoardFields
    }
  }
  ${fragments.BoardRepr}
`;

export interface ICREATE_BOARD {
  createBoard: IBoard;
}

export const CREATE_BOARD = gql`
  mutation createBoard($newBoard: NewBoard!) {
    createBoard(newBoard: $newBoard) {
      ...BoardFields
    }
  }
  ${fragments.BoardRepr}
`;

export interface IUPDATE_BOARD {
  updateBoard: string;
}

export const UPDATE_BOARD = gql`
  mutation updateBoard($updateBoard: UpdateBoard!) {
    updateBoard(updateBoard: $updateBoard)
  }
`;

export interface IDELETE_BOARD {
  deleteBoard: string;
}

export const DELETE_BOARD = gql`
  mutation deleteBoard($userId: String!, $boardId: String!) {
    deleteBoard(userId: $userId, boardId: $boardId)
  }
`;
