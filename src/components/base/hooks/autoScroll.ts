import { RefObject, useLayoutEffect } from 'react';

export const useAutoScrollOnMount = (
  containerRef: RefObject<HTMLElement | undefined>,
  activeSeletor: string
) => {
  useLayoutEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const elem = containerRef.current.querySelector(
      activeSeletor
    ) as HTMLElement;
    if (!elem) {
      return;
    }
    containerRef.current.scroll({
      top: elem.offsetTop - containerRef.current.offsetTop,
    });
  }, [activeSeletor, containerRef]);
};
