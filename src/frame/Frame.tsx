import { type MetaData, page_metadata } from 'src/data/page_metadata';
import Head from 'src/frame/Head';
import Layout from 'src/frame/Layout'; // 修正: 'Layout' のインポートパスの大文字小文字を修正

import { getResultPath } from 'tools/utils/getResultPath';

type p = PropsWithChildren<{
  customMetaData?: Partial<MetaData>;
  page?: string;
}>;

const Frame = ({ children, customMetaData = {}, page = '' }: p) => {
  const resultPath = getResultPath(page);
  const combinedMetaData = {
    ...page_metadata,
    [resultPath]: page_metadata[resultPath]
      ? { ...page_metadata[resultPath], ...customMetaData }
      : { ...customMetaData },
  };
  return (
    <html lang='en'>
      <Head {...combinedMetaData[resultPath]} page={resultPath} />
      <Layout page={resultPath}>{children}</Layout>
    </html>
  );
};

export default Frame;
