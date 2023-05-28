import { isEqual } from 'lodash';

export const diff = <Prev, Next>(
  prev: Prev[],
  next: Next[],
  isSameEntity: (a: Prev, b: Next) => boolean = isEqual,
  hasUpdated?: (a: Prev, b: Next) => boolean
) => {
  const missings: Prev[] = [];
  const updated: { prev: Prev; next: Next }[] = [];
  const news: Next[] = [];
  const unchanged: { prev: Prev; next: Next }[] = [];

  prev.forEach((prevEntity) => {
    const matchingNextEntity = next.find((nextEntity) =>
      isSameEntity(prevEntity, nextEntity)
    );

    if (!matchingNextEntity) {
      missings.push(prevEntity);
    } else if (hasUpdated && hasUpdated(prevEntity, matchingNextEntity)) {
      updated.push({ prev: prevEntity, next: matchingNextEntity });
    } else {
      unchanged.push({ prev: prevEntity, next: matchingNextEntity });
    }
  });

  next.forEach((nextEntity) => {
    const matchingPrevEntity = prev.find((prevEntity) =>
      isSameEntity(prevEntity, nextEntity)
    );

    if (!matchingPrevEntity) {
      news.push(nextEntity);
    }
  });

  return {
    missings,
    updated,
    news,
    unchanged,
  };
};
