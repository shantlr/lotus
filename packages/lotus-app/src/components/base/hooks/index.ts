import { useEffect, useLayoutEffect, useState } from 'react';

const useSelectElem = (
  parent: HTMLElement | undefined | null,
  selector?: string
) => {
  const [elem, setElem] = useState(parent);

  useEffect(() => {
    if (!parent) {
      if (elem) {
        setElem(null);
      }
      return;
    }
    if (!selector) {
      if (parent && elem !== parent) {
        setElem(parent);
      }
      return;
    }

    const e = parent.querySelector(selector) as HTMLElement;
    if (e) {
      setElem(e);
    }
    const observer = new MutationObserver((mutation) => {
      const nextE = parent.querySelector(selector) as HTMLElement;
      if (nextE !== e) {
        setElem(nextE);
      }
    });
    observer.observe(parent, {
      childList: true,
    });
    return () => {
      observer.disconnect();
    };
  }, [elem, parent, selector]);
  return elem;
};

export const useObserveWidth = (
  elem: HTMLElement | undefined | null,
  selector?: string
) => {
  const [width, setWidth] = useState(() => elem?.offsetWidth);

  const e = useSelectElem(elem, selector);

  useLayoutEffect(() => {
    if (!elem) {
      return;
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
  }, [e, elem, selector]);

  return width;
};
