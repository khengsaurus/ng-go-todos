import { Route } from './enums';

export interface IUser {
  id: string;
  username: string;
  email?: string;
}

export interface ILink {
  route: Route | string;
  label: string;
}
