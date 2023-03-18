import { ReactNode, useMemo } from 'react';
import { isEqual } from 'lodash';
import classNames from 'classnames';
import Link from 'next/link';

type Option<Value> = {
  key?: string;
  to?: string;
  label: ReactNode;
  value: Value;
};

export function RadioGroup<Value>({
  value,
  options,
  onChange,
}: {
  value?: Value;
  options: Option<Value>[];
  onChange?: (opt: Option<Value>) => void;
}) {
  const activeOpt = useMemo(() => {
    if (value === undefined) {
      return null;
    }
    return options.find((o) => o === value || isEqual(o.value, value));
  }, [options, value]);

  return (
    <div className="inline-flex border rounded">
      {options.map((opt, index) => {
        const res = (
          <div
            className={classNames(
              'px-4 py-1 transition hover:bg-gray-500 cursor-pointer',
              {
                'rounded-l-sm': index === 0,
                'rounded-r-sm': index === options.length - 1,
                'bg-gray-500': opt === activeOpt,
              }
            )}
            key={opt.key ?? index}
            onClick={() => {
              onChange?.(opt);
            }}
          >
            {opt.label}
          </div>
        );
        if (opt.to) {
          return (
            <Link key={opt.key ?? index} href={opt.to}>
              {res}
            </Link>
          );
        }
        return res;
      })}
    </div>
  );
}
