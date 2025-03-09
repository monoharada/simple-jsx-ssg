type AllowedTags = Pick<JSX.IntrinsicElements, 'h2' | 'h3' | 'h4'>;
interface CardProps {
  title: string;
  subtitle: string;
  description: string;
  footer: string;
  badge?: string;
  headingLevel?: keyof AllowedTags;
}

const Card = ({ title, subtitle, description, footer, badge, headingLevel = 'h3' }: CardProps) => {
  const HeadingTag = headingLevel as keyof AllowedTags;

  return (
    <article {...(badge ? { 'data-badge': badge } : {})}>
      <header>
        <HeadingTag>{title}</HeadingTag>
        <p>{subtitle}</p>
      </header>
      <p>{description}</p>
      <footer>
        <small>{footer}</small>
      </footer>
    </article>
  );
};

export default Card;
