import { Route } from './enums';

export interface IUser {
  email: string;
}

export interface ILink {
  route: Route | string;
  label: string;
}