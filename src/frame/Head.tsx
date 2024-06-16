import type { PageDetails } from 'src/data/page_metadata';
import siteSetting from 'src/site_setting';

import getCssFiles from 'tools/utils/getCssFiles';

type P = PageDetails & { page: string };

const styleLayer = `@layer ${siteSetting.style.layer};`;
const commonStyleSheets = getCssFiles();
const Head = (props: P) => {
  const siteUrl = `${siteSetting.domain}/${props.page}.html`;
  const { title = '', description = '', cssFiles = [], jsFiles = [] } = props;
  const ogImage = props.ogImage || siteSetting.ogImage;
  const ogType = props.ogType || 'website';
  return (
    <head>
      <meta charSet='utf-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <title>{title}</title>
      <style>{styleLayer}</style>
      {commonStyleSheets.map((style) => (
        <link rel='stylesheet' href={style} key={style} media='screen' />
      ))}
      {cssFiles.map((css) => (
        <link rel='stylesheet' href={css} key={css} media='screen' />
      ))}
      <meta name='description' content={description} />
      <meta property='og:title' content={title} />
      <meta property='og:type' content={ogType} />
      <meta property='og:url' content={siteUrl} />
      <meta property='og:image' content={ogImage.url} />
      <meta property='og:image:alt' content={ogImage.alt} />
      <link rel='icon' href='/favicon.ico' sizes='any' />
      <link rel='icon' href='/icon.svg' type='image/svg+xml' />
      <link rel='apple-touch-icon' href='icon.png' />
      {/* <link rel="manifest" href="site.webmanifest" /> */}
      <meta name='theme-color' content='#fafafa' />
      <script src='/assets/js/entry.js' defer></script>
      {jsFiles.map((js) => (
        <script src={js} key={js} defer />
      ))}
    </head>
  );
};

export default Head;
