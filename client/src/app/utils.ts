interface IItem {
  id: string | number;
}

export function trackById<T = any>(_: number, item: (IItem & T) | undefined) {
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
