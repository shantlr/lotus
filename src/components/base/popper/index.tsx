import classNames from 'classnames';
import {
  ComponentProps,
  ReactElement,
  cloneElement,
  forwardRef,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';

type Options = Parameters<typeof usePopper>['2'];

export const PopperBody = forwardRef<HTMLDivElement, ComponentProps<'div'>>(
  (props, ref) => (
    <div
      ref={ref}
      {...props}
      className={classNames(
        'z-50 shadow-lg shadow-gray-800/30 rounded',
        props.className
      )}
    />
  )
);
PopperBody.displayName = 'PopperBody';

export const Popper = ({
  show,
  popper: popperContent,
  children,
  options,
  onClose,
}: {
  show?: boolean;
  popper: ReactElement;
  children: ReactElement;
  options?: Options;
  onClose?: (v: boolean) => void;
}) => {
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [popperRef, setPopperRef] = useState<HTMLElement | null>(null);

  const opt: Options = { strategy: 'absolute', ...options };
  const popper = usePopper(containerRef, popperRef, opt);

  const container = useMemo(
    () =>
      children &&
      cloneElement(children, {
        ...children.props,
        ref: setContainerRef,
      }),
    [children, setContainerRef]
  );
  const pContent = useMemo(
    () =>
      popperContent &&
      cloneElement(popperContent, {
        ...popper.attributes.popper,
        ...popperContent.props,
        ref: setPopperRef,
        style: {
          ...(popperContent.props.style || null),
          ...popper.styles.popper,
        },
      }),
    [popper.attributes.popper, popper.styles.popper, popperContent]
  );

  useEffect(() => {
    if (!show) {
      return;
    }

    const listener = (e: MouseEvent) => {
      if (e.defaultPrevented) {
        return;
      }

      const target = e.target as HTMLElement;
      if (!containerRef?.contains(target) && !popperRef?.contains(target)) {
        onClose?.(false);
      }
    };

    window.addEventListener('click', listener);
    return () => {
      window.removeEventListener('click', listener);
    };
  }, [containerRef, onClose, popperRef, show]);

  return (
    <>
      {container}
      {show &&
        (opt.strategy === 'absolute'
          ? createPortal(pContent, document.body)
          : pContent)}
    </>
  );
};
