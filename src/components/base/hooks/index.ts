import { useLayoutEffect, useState } from 'react';

export const useObserveWidth = (
  elem: HTMLElement | undefined | null,
  selector?: string
) => {
  const [width, setWidth] = useState(() => elem?.offsetWidth);

  useLayoutEffect(() => {
    let e = elem;
    if (selector) {
      e = e?.querySelector(selector);
    }

    if (!e) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      setWidth(entries[0].borderBoxSize[0]?.inlineSize);
    });

    resizeObserver.observe(e);
    return () => {
      resizeObserver.disconnect();
    };
  }, [elem, selector]);

  return width;
};
