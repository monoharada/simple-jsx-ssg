import imageData from 'src/data/image_metadata.json';

type P = {
  /**
   * 使用できる画像は、必ず
   * `src/data/image_metadata.json` に記載されているもののみとなります。
   */
  src: keyof typeof imageData;
  alt: string;
};

const Image = ({ src, alt }: P) => {
  const metadata = imageData[src];
  const isProduction = process.env.BUILD_MODE === 'production';
  const ext = isProduction ? '.avif' : metadata.ext;
  return (
    <div>
      <img
        src={`${src}${ext}`}
        alt={alt}
        loading='lazy'
        decoding='async'
        width={metadata.width}
        height={metadata.height}
      />
    </div>
  );
};

export default Image;
