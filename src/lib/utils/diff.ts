import { isEqual } from 'lodash';

export const diff = <T>(prev: T[], next: T[]) => {
  const deleted: T[] = [];
  const updated: T[] = [];
  const created: T[] = [];

  prev.forEach((p) => {
    if (!next.some((n) => isEqual(p, n))) {
      deleted.push(p);
    }
  });
  next.forEach((n) => {
    if (!prev.some((p) => isEqual(n, p))) {
      created.push(n);
    }
  });

  return {
    deleted,
    updated,
    created,
  };
};
