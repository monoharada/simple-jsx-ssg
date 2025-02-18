const navList = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
];
const Header = () => {
  return (
    <header>
      <svg width='50' height='50' viewBox='0 0 100 100' role='img' aria-label='Company Logo'>
        <circle cx='50' cy='50' r='40' stroke='black' strokeWidth='3' fill='lightgray' />
        <text x='50' y='55' fontSize='20' textAnchor='middle' fill='black'>
          Logo
        </text>
      </svg>
      <nav>
        <ul>
          {navList.map((item) => (
            <li key={item.name}>
              <a href={item.href} style={{ color: 'blue' }}>
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
