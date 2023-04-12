import { ComponentProps, ReactNode, useState } from 'react';
import { Button } from '../button';
import { usePopper } from 'react-popper';
import { createPortal } from 'react-dom';

export const ButtonPopper = ({
  onClick,
  popperContent,
  ...props
}: {
  popperContent: ReactNode;
} & ComponentProps<typeof Button>) => {
  const [show, setShow] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>();
  const [popperRef, setPopperRef] = useState<HTMLElement | null>();
  const popper = usePopper(container, popperRef, {
    strategy: 'absolute',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 10],
        },
      },
      {
        name: 'preventOverflow',
        options: {
          boundary: document.body,
          padding: 10,
          altAxis: true,
        },
      },
    ],
  });

  return (
    <>
      <Button
        ref={setContainer}
        onClick={(e) => {
          setShow(!show);
          onClick?.(e);
        }}
        {...props}
      ></Button>
      {show &&
        createPortal(
          <div
            className="rounded bg-white p-2 shadow"
            {...popper.attributes.popper}
            style={popper.styles.popper}
            ref={setPopperRef}
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            {popperContent}
          </div>,
          document.body
        )}
    </>
  );
};
