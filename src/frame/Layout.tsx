import Header from 'src/components/Header';

type p = PropsWithChildren<{ page: string }>;

const Layout = ({ children, page }: p) => {
  return (
    <body>
      <Header />
      <p>{page}</p>
      <main>{children}</main>
      <footer>
        footer
        {page === 'hoge' && 'hoge'}
      </footer>
    </body>
  );
};

export default Layout;
