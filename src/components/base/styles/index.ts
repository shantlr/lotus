import { cloneDeep, merge } from 'lodash';

const CORE = {
  highlightAction: {
    bg: 'bg-highlight-300',
    base: 'bg-highlight-300 hover:bg-highlight-400 active:bg-highlight-600 text-white disabled:text-gray-300 disabled:bg-highlight-900',
  },
  defaultAction: {
    base: 'bg-default-600 hover:bg-default-500 active:bg-default-700 text-white disabled:text-gray-300 disabled:bg-default-800',
    ghost: `hover:bg-default-500 hover:text-white`,
  },
  lightAction: {
    base: 'bg-default-300 hover:bg-default-400 active:bg-default-700 disabled:text-gray-300 disabled:bg-default-800',
  },
  dangerAction: {
    base: `text-white bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:bg-red-800`,
  },
};

export const BASE_STYLES = merge(cloneDeep(CORE), {});
