export type PageDetails = {
  title?: string;
  description?: string;
  ogImage?: {
    url: string;
    alt: string;
  };
  ogType?: 'website' | 'article' | `book` | 'music' | 'video' | 'profile';
  cssFiles?: string[];
  jsFiles?: string[];
};

export type MetaData = {
  [key: string]: PageDetails;
};

export const page_metadata: MetaData = {
  index: {
    title: 'index',
    description: 'index page',
    cssFiles: ['/assets/styles/hoge.css'],
    jsFiles: ['/assets/scripts/hoge.js'],
  },
  'hoge/index': {
    title: 'Hoge index',
    description: 'hoge index page',
    ogImage: {
      url: 'https://example.com/hoge.jpg',
      alt: 'hoge image',
    },
    ogType: 'article',
  },
};
