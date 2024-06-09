import { type MetaData, metaData } from 'src/data/metaData';
import { getResultPath } from 'tools/utils/getResultPath';
import getCssFiles from './Styles';

const styleSheets = getCssFiles();

type p = PropsWithChildren<{ customMetaData?: Partial<MetaData>; page: string }>;

const Layout = ({ children, customMetaData = {}, page = '' }: p) => {
  const resultPath = getResultPath(page);
  const combinedMetaData = {
    ...metaData,
    [resultPath]: metaData[resultPath]
      ? { ...metaData[resultPath], ...customMetaData }
      : { ...customMetaData },
  };
  const { title, description, cssFiles = [], jsFiles = [] } = combinedMetaData[resultPath] || {};
  return (
    <html lang='en'>
      <head>
        <meta charSet='UTF-8' />
        <title>{title}</title>
        <meta name='description' content={description} />
        {styleSheets.map((style) => (
          <link rel='stylesheet' href={style} key={style} />
        ))}
        {cssFiles.map((css) => (
          <link rel='stylesheet' href={css} key={css} />
        ))}
        <script type='module' src='/assets/js/test.js' />
        {jsFiles.map((js) => (
          <script src={js} key={js} defer />
        ))}
      </head>
      <body>
        <header>header!!</header>
        <p>{resultPath}</p>
        <main>{children}</main>
        <footer>
          footer
          {resultPath === 'hoge' && 'hogeeeee'}
        </footer>
      </body>
    </html>
  );
};

export default Layout;
