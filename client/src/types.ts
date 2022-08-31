import { Route } from './enums';

export interface IResponse<T> {
  data: {
    [key: string]: T;
  };
}

export interface IUser {
  id: string;
  username: string;
  email?: string;
}

export interface ILink {
  route: Route | string;
  label: string;
}
