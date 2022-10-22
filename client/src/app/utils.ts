import { Nullable } from 'src/types';

interface IItem {
  id: string | number;
}

export function trackById<T = any>(_: number, item: Nullable<IItem & T>) {
  return item?.id;
}

export function scrollEle(id: string, x = 0, y = 0) {
  const ele = document.getElementById(id);
  if (ele) {
    ele.focus();
    ele.scrollTo(x, y);
  }
}

export function haltEvent(e: Event) {
  e.stopPropagation();
  e.preventDefault();
}
