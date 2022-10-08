import { Nullable } from 'src/types';

interface IItem {
  id: string | number;
}

export function trackById<T = any>(_: number, item: Nullable<IItem & T>) {
  return item?.id;
}
