import { cloneDeep, merge } from 'lodash';

const CORE = {
  highlightAction: {
    base: 'bg-highlight-500 hover:bg-highlight-400 active:bg-highlight-600 disabled:bg-highlight-900',
  },
  defaultAction: {
    base: 'bg-default-600 hover:bg-default-500 active:bg-default-700 disabled:bg-default-800',
  },
  dangerAction: {
    base: `text-white bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:bg-red-800`,
  },
};

export const BASE_STYLES = merge(cloneDeep(CORE), {});
