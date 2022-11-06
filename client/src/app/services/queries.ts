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
      files {
        key
        name
      }
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

export interface IADD_RM_TODO_FILE {
  addRmTodoFile: boolean;
}

export const ADD_RM_TODO_FILE = gql`
  mutation AddRmTodoFile(
    $todoId: String!
    $fileKey: String!
    $fileName: String!
    $rm: Boolean!
  ) {
    addRmTodoFile(
      todoId: $todoId
      fileKey: $fileKey
      fileName: $fileName
      rm: $rm
    )
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

export interface IADD_RM_BOARD_TODO {
  addRmBoardTodo: boolean;
}

export const ADD_RM_BOARD_TODO = gql`
  mutation AddRmBoardTodo(
    $userId: String!
    $todoId: String!
    $boardId: String!
    $rm: Boolean!
  ) {
    addRmBoardTodo(userId: $userId, todoId: $todoId, boardId: $boardId, rm: $rm)
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
