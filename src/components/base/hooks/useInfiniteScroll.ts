import { RefObject, useLayoutEffect, useRef } from 'react';

export const useInfiniteScroll = (
  ref: RefObject<HTMLElement>,
  opt: {
    threshold?: number;
    onLoadNext?: () => void;
    onLoadPrev?: () => void;
  }
) => {
  const optRef = useRef(opt);
  optRef.current = opt;

  const threshold = opt?.threshold || 100;
  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    const elem = ref.current;
    const onScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.scrollTop <= threshold) {
        optRef.current?.onLoadPrev?.();
      }

      if (
        target.scrollHeight - (target.scrollTop + target.clientHeight) <=
        threshold
      ) {
        optRef.current?.onLoadNext?.();
      }
    };
    elem.addEventListener('scroll', onScroll);
    return () => {
      elem?.removeEventListener('scroll', onScroll);
    };
  }, [ref, threshold]);
};
