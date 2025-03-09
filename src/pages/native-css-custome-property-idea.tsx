import Card from 'src/components/Card';
import Frame from 'src/frame/Frame';

const cards = [
  {
    title: 'Card Title',
    subtitle: 'A brief subtitle or description',
    description:
      'This is an example of card content. Pico CSS will style this card using its default rules for semantic elements.',
    footer: 'Footer details, such as a timestamp or metadata',
    badge: 'New',
  },
  {
    title: 'Card Title',
    subtitle: 'A brief subtitle or description',
    description:
      'This is an example of card content. Pico CSS will style this card using its default rules for semantic elements.',
    footer: 'Footer details, such as a timestamp or metadata',
  },
  {
    title: 'long long Card Title is next line',
    subtitle: 'A brief subtitle or description',
    description:
      'This is an example of card content. Pico CSS will style this card using its default rules for semantic elements. This is an example of card content. Pico CSS will style this card using its default rules for semantic elements.',
    footer: 'Footer details, such as a timestamp or metadata',
  },
  {
    title: 'Card Title',
    subtitle: 'A brief subtitle or description',
    description:
      'This is an example of card content. Pico CSS will style this card using its default rules for semantic elements.',
    footer: 'Footer details, such as a timestamp or metadata',
  },
  {
    title: 'Card Title',
    subtitle: 'A brief subtitle or description',
    description:
      'This is an example of card content. Pico CSS will style this card using its default rules for semantic elements.',
    footer: 'Footer details, such as a timestamp or metadata',
  },
];

export default async function Index() {
  return (
    <Frame>
      <section>
        <h1>Aenean non eros orci. Vivamus ut diam sem.</h1>
        <p>
          Donec nec egestas nulla. Sed varius placerat felis eu suscipit. Mauris maximus ante in
          consequat luctus. Morbi euismod sagittis efficitur. Aenean non eros orci. Vivamus ut diam
          sem.
        </p>
        <section>
          <h2>Ut sed quam non mauris placerat consequat vitae id risus</h2>
          <p>
            Ut sed quam non mauris placerat consequat vitae id risus. Vestibulum tincidunt nulla ut
            tortor posuere, vitae malesuada tortor molestie. Sed nec interdum dolor. Vestibulum id
            auctor nisi, a efficitur sem. Aliquam sollicitudin efficitur turpis, sollicitudin
            hendrerit ligula semper id. Nunc risus felis, egestas eu tristique eget, convallis in
            velit.
          </p>
        </section>

        <section data-cols='3'>
          <h2 data-col-full>Cards</h2>
          {cards.map((card) => (
            <Card
              key={card.title}
              title={card.title}
              subtitle={card.subtitle}
              description={card.description}
              footer={card.footer}
              badge={card.badge}
            />
          ))}
        </section>

        <section style='--m-t-min: var(--spacing-6);'>
          <h2>
            <mark>Uniq section</mark> Ut sed quam non mauris placerat consequat vitae id risus
          </h2>
          <p>
            Ut sed quam non mauris placerat consequat vitae id risus. Vestibulum tincidunt nulla ut
            tortor posuere, vitae malesuada tortor molestie. Sed nec interdum dolor. Vestibulum id
            auctor nisi, a efficitur sem. Aliquam sollicitudin efficitur turpis, sollicitudin
            hendrerit ligula semper id. Nunc risus felis, egestas eu tristique eget, convallis in
            velit.
          </p>
        </section>
      </section>
    </Frame>
  );
}
