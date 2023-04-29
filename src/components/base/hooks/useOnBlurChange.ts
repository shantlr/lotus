import { ChangeEvent, KeyboardEvent, useRef, useState } from 'react';

export const useOnBlurChange = (
  value?: string,
  onChange?: (value: string) => void,
  opt?: { blurOnEnter?: boolean }
) => {
  const ref = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState<string | null>(null);

  return {
    ref,
    value: localValue ?? value,
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      setLocalValue(e.target.value);
    },
    onKeyUp: opt?.blurOnEnter
      ? (e: KeyboardEvent<HTMLInputElement>) => {
          if (e.code === 'Enter') {
            if (localValue) {
              ref.current?.blur();
            }
          }
        }
      : undefined,
    onBlur: () => {
      if (localValue !== null) {
        onChange?.(localValue);
        setLocalValue(null);
      }
    },
  };
};
