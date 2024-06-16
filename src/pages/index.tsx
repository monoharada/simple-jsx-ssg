import Break from 'src/components/Break';
import Image from 'src/components/Image';
import type { MetaData } from 'src/data/page_metadata';
import Frame from 'src/frame/Frame';

const valueOutsideComponent = 'Value outside';
const asyncValueOutsideComponentP = Promise.resolve('Async value outside');

const listItems = ['apple!!!', 'banana', 'cherry'];

const customMetaData: Partial<MetaData> = {
  index: {
    cssFiles: ['/assets/css/pages/hoge.css'],
    jsFiles: ['/assets/scripts/custom.js'],
  },
};

export default async function Index() {
  const valueViaChildren = 'Value via children!!';

  return (
    <Frame customMetaData={customMetaData} page={__filename}>
      <h1 id='title'>My value!!!!</h1>
      <ul>
        {listItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <simple-greeting>aaa</simple-greeting>
      <section>
        <h2>Foot note</h2>
        <p>
          明日の
          <Break />
          ジョー
        </p>
        <p>
          some text<sup data-footnote='ref_2'>2</sup>another text
          <sup data-footnote='ref_1'>1</sup>.... get back text<sup data-footnote='ref_2'>2</sup>
        </p>
        <ol data-footnote='list'>
          <li>footnote description1 aaa aaa aaa</li>
          <li>footnote description2</li>
        </ol>
      </section>
      <div>
        <p>
          テスト
          <Break />
          テスト
        </p>
        <p>
          テスト
          <Break />
          テスト
        </p>
      </div>

      <button popoverTarget='pop' type='button'>
        Toggle Popup
      </button>
      <div popover id='pop'>
        I'm a Popover! <span className='wave'>👋</span>
      </div>

      <Image src='/assets/image/rafael-garcin-kEI0ZZg97PQ-unsplash' alt='hoge' />

      <MyValues valueViaProps='Value via props'>{valueViaChildren}</MyValues>
    </Frame>
  );
}

type P = PropsWithChildren<{ valueViaProps: string }>;
const MyValues = async ({ valueViaProps, children }: P) => {
  const valueInsideComponent = 'Value inside';
  const asyncValueInsideComponent = await Promise.resolve('Async value inside');
  const asyncValueOutsideComponent = await asyncValueOutsideComponentP;

  return (
    <ul>
      <li>{valueViaProps}</li>
      <li>{valueInsideComponent}</li>
      <li>{valueOutsideComponent}</li>
      <li>{asyncValueInsideComponent}</li>
      <li>{asyncValueOutsideComponent}</li>
      <li>{children}</li>
    </ul>
  );
};
