import { gql } from 'apollo-angular';
import { IBoard, ITodo, IUser } from 'src/types';

const fragments = {
  UserRepr: gql`
    fragment UserFields on User {
      id
      email
      username
      boardIds
    }
  `,
  TodoRepr: gql`
    fragment TodoFields on Todo {
      id
      userId
      text
      priority
      tag
      markdown
      done
      boardId
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
        markdown
        done
        boardId
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

/* ------------------------- TODOS ------------------------- */

export interface IGET_TODOS {
  getTodos: {
    cache: boolean;
    todos: ITodo[];
  };
}

export const GET_TODOS = gql`
  query GetTodos($userId: String!, $fresh: Boolean!) {
    getTodos(userId: $userId, fresh: $fresh) {
      cache
      todos {
        ...TodoFields
      }
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
  updateTodo: boolean;
}

export const UPDATE_TODO = gql`
  mutation updateTodo($updateTodo: UpdateTodo!) {
    updateTodo(updateTodo: $updateTodo)
  }
`;

export interface IDELETE_TODO {
  deleteTodo: boolean;
}

export const DELETE_TODO = gql`
  mutation deleteTodo($userId: String!, $todoId: String!) {
    deleteTodo(userId: $userId, todoId: $todoId)
  }
`;

/* ------------------------- FILES ------------------------- */

// TODO: remove

export interface IUPLOAD_FILE {
  getSignedPutUrl: string;
}

export const UPLOAD_FILE = gql`
  query GetSignedPutURL(
    $userId: String!
    $todoId: String!
    $fileName: String!
  ) {
    getSignedPutUrl(userId: $userId, todoId: $todoId, fileName: $fileName)
  }
`;

/* ------------------------- BOARDS ------------------------- */

export interface IGET_BOARDS {
  getBoards: {
    boards: IBoard[];
    cache: boolean;
  };
}

export const GET_BOARDS = gql`
  query GetBoards($userId: String!, $fresh: Boolean!) {
    getBoards(userId: $userId, fresh: $fresh) {
      cache
      boards {
        ...BoardFields
      }
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
  updateBoard: boolean;
}

export const UPDATE_BOARD = gql`
  mutation updateBoard($updateBoard: UpdateBoard!) {
    updateBoard(updateBoard: $updateBoard)
  }
`;

export interface IDELETE_BOARD {
  deleteBoard: boolean;
}

export const DELETE_BOARD = gql`
  mutation deleteBoard($userId: String!, $boardId: String!) {
    deleteBoard(userId: $userId, boardId: $boardId)
  }
`;

export interface IMOVE_BOARDS {
  moveBoards: boolean;
}

export const MOVE_BOARDS = gql`
  mutation moveBoards($userId: String!, $boardIds: [String!]!) {
    moveBoards(userId: $userId, boardIds: $boardIds)
  }
`;

/* ---------------------- TODO - BOARDS ---------------------- */

export interface IADD_TODO_TO_BOARD {
  addTodoToBoard: boolean;
}

export const ADD_TODO_TO_BOARD = gql`
  mutation AddTodoToBoard(
    $userId: String!
    $todoId: String!
    $boardId: String!
  ) {
    addTodoToBoard(userId: $userId, todoId: $todoId, boardId: $boardId)
  }
`;

export interface IREMOVE_TODO_FROM_BOARD {
  removeTodoFromBoard: boolean;
}

export const REMOVE_TODO_FROM_BOARD = gql`
  mutation RemoveTodoFromBoard(
    $userId: String!
    $todoId: String!
    $boardId: String!
  ) {
    removeTodoFromBoard(userId: $userId, todoId: $todoId, boardId: $boardId)
  }
`;

export interface IMOVE_TODOS {
  moveTodos: boolean;
}

export const MOVE_TODOS = gql`
  mutation MoveTodos(
    $userId: String!
    $boardId: String!
    $todoIds: [String!]!
  ) {
    moveTodos(userId: $userId, boardId: $boardId, todoIds: $todoIds)
  }
`;

export interface ISHIFT_TODO_BETWEEN_BOARDS {
  shiftTodoBetweenBoards: boolean;
}

export const SHIFT_TODO_BETWEEN_BOARDS = gql`
  mutation ShiftTodoBetweenBoards(
    $userId: String!
    $todoId: String!
    $fromBoard: String!
    $toBoard: String!
    $toIndex: Int!
  ) {
    shiftTodoBetweenBoards(
      userId: $userId
      todoId: $todoId
      fromBoard: $fromBoard
      toBoard: $toBoard
      toIndex: $toIndex
    )
  }
`;
