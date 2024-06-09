export type MetaData = {
  [key: string]: {
    title?: string;
    description?: string;
    cssFiles?: string[];
    jsFiles?: string[];
  };
};

export const metaData: MetaData = {
  index: {
    title: 'index',
    description: 'index page',
    cssFiles: ['/assets/styles/hoge.css'],
    jsFiles: ['/assets/scripts/hoge.js'],
  },
  'hoge/index': {
    title: 'Hoge index',
    description: 'hoge index page',
  },
};
