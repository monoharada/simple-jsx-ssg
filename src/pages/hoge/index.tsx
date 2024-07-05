import Image from 'src/components/Image';
import type { MetaData } from 'src/data/page_metadata';
import Frame from 'src/frame/Frame';

const valueOutsideComponent = 'Value outside';
const asyncValueOutsideComponentP = Promise.resolve('Async value outside');

const listItems = ['アップル', 'banana', 'cherry'];

const customMetaData: Partial<MetaData> = {
  'hoge/index': {
    cssFiles: ['/assets/css/custom.css'],
    jsFiles: ['/assets/scripts/custom.js'],
  },
};

export default async function Index() {
  const valueViaChildren = 'Value via children';

  return (
    <Frame customMetaData={customMetaData} page={__filename}>
      <h1 id='h1'>My value</h1>

      <ul>
        {listItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div>
        <p>
          テスト
          <br />
          テスト
        </p>
        <p>
          テスト
          <br />
          テスト
        </p>
      </div>

      <button popoverTarget='pop' type='button'>
        Toggle Popup
      </button>
      <div popover id='pop' aria-hidden='true'>
        I'm a Popover! <span className='wave'>👋</span>
      </div>

      <Image src='/assets/image/rafael--kEI0ZZg97PQ-unsplash' alt='hoge' />

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
