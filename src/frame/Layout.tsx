type p = PropsWithChildren<{ page: string }>;

const Layout = ({ children, page }: p) => {
  return (
    <body>
      <header>header!!</header>
      <p>{page}</p>
      <main>{children}</main>
      <footer>
        footer
        {page === 'hoge' && 'hogeeeee'}
      </footer>
    </body>
  );
};

export default Layout;
