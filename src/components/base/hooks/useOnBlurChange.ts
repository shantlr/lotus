import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';

export const useOnBlurChange = (
  value?: string,
  onChange?: (value: string) => void,
  opt?: { blurOnEnter?: boolean; escapeCancel?: boolean }
) => {
  const ref = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState<string | null>(null);
  const [cancel, setCancel] = useState(false);

  useEffect(() => {
    if (!cancel) {
      return;
    }
    if (cancel && localValue) {
      setLocalValue(null);
      return;
    }
    setCancel(false);
    ref.current?.blur();
  }, [cancel, localValue]);

  return {
    ref,
    value: localValue ?? value,
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      setLocalValue(e.target.value);
    },
    onKeyUp:
      opt?.blurOnEnter || opt?.escapeCancel
        ? (e: KeyboardEvent<HTMLInputElement>) => {
            if (opt.blurOnEnter && e.code === 'Enter') {
              ref.current?.blur();
            }
            if (opt.escapeCancel && e.code === 'Escape') {
              setCancel(true);
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
