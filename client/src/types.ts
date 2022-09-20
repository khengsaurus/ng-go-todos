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

export interface ITodo {
  id: string;
  userId: string;
  text: string;
  priority: number;
  tag: string;
  done: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface IBoard {
  id: string;
  userId: string;
  name: string;
  todos: ITodo[];
  createdAt: any;
  updatedAt: any;
}

export interface ILink {
  route: Route | string;
  label: string;
}

export interface ITodos {
  userId: string;
  todos: ITodo[];
}
