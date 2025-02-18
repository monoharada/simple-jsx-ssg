type AllowedTags = Pick<JSX.IntrinsicElements, 'div' | 'figure'>;

interface BoxBorderWithHeadingProps {
  children?: JSX.IntrinsicElements;
  heading?: string;
  as?: keyof AllowedTags;
  fontSmall?: boolean;
}

const BoxBorderWithHeading = (props: BoxBorderWithHeadingProps) => {
  const { children, heading = '例えば', as = 'div', fontSmall } = props;
  const Tag = as;
  return (
    <Tag className={`${'box-border-with-heading'}${fontSmall === true ? ' small' : ''}`}>
      <span className='heading'>{heading}</span>
      {children}
    </Tag>
  );
};

export default BoxBorderWithHeading;
