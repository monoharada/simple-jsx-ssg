import Header from 'src/components/Header';

type p = PropsWithChildren<{ page?: string }>;

const Layout = ({ children, page }: p) => {
  return (
    <body>
      <Header />
      {page && <p>{page}</p>}
      <main>{children}</main>
      <footer>
        <small>footer</small>
      </footer>
    </body>
  );
};

export default Layout;
