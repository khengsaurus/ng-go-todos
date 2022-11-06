import { Route } from './enums';

export type Nullable<T> = T | null;

export interface ITypedObject<T = any> {
  [key: string]: T;
}

export interface IResponse<T> {
  data: {
    [key: string]: T;
  };
}

export interface IUser {
  id: string;
  username: string;
  boardIds: string[];
  email?: string;
}

export interface IFile {
  key: string;
  name: string;
}

export interface ITodo {
  id: string;
  userId: string;
  text: string;
  priority: number;
  tag: string;
  markdown: boolean;
  done: boolean;
  boardId: string;
  createdAt: any;
  updatedAt: any;
  files: IFile[];
}

export interface IBoard {
  id: string;
  userId: string;
  name: string;
  todos: ITodo[];
  createdAt: any;
  updatedAt: any;
  todoIds?: string[]; // for sorting on server-side
}

export interface ILink {
  route: Route | string;
  label: string;
}

export interface ITodos {
  userId: string;
  todos: ITodo[];
}
