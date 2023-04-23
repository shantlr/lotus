import { ComponentProps, ReactNode, useState } from 'react';
import { Button } from '../button';
import { Popper, PopperBody } from '../popper';

export const ButtonPopper = ({
  onClick,
  popperContent,
  ...props
}: {
  popperContent: ReactNode;
} & ComponentProps<typeof Button>) => {
  const [show, setShow] = useState(false);

  return (
    <Popper
      show={show}
      onClose={setShow}
      options={{
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
      }}
      popper={
        <PopperBody
          className="bg-white p-2"
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          {popperContent}
        </PopperBody>
      }
    >
      <Button
        onClick={(e) => {
          setShow(!show);
          onClick?.(e);
        }}
        {...props}
      />
    </Popper>
  );
};
