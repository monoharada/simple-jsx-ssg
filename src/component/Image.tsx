import imageData from 'src/data/image-metadata.json';

type P = {
  src: string;
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
