import clsx from 'clsx';
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
      className={clsx(
        'z-50 shadow-lg shadow-gray-800/30 rounded',
        props.className
      )}
      onClick={(e) => {
        // else, parent popper may close because of nested popper
        e.stopPropagation();
        props.onClick?.(e);
      }}
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
  onClose?: (v: false) => void;
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

    const clickListener = (e: MouseEvent) => {
      if (e.defaultPrevented) {
        return;
      }
      const target = e.target as HTMLElement;
      if (!containerRef?.contains(target) && !popperRef?.contains(target)) {
        onClose?.(false);
      }
    };

    const keyListener = (e: KeyboardEvent) => {
      if (e.defaultPrevented) {
        return;
      }
      if (e.code === 'Escape') {
        onClose?.(false);
        e.preventDefault();
      }
    };

    window.addEventListener('click', clickListener);
    window.addEventListener('keyup', keyListener);
    return () => {
      window.removeEventListener('click', clickListener);
      window.removeEventListener('keyup', keyListener);
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
