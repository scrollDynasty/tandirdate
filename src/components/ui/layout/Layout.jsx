import React from 'react'
import { useLocation } from 'react-router-dom';
import Nav from '../../Navbar';

const Layout = ({children}) => {
  const location = useLocation();

  // Список путей, где Navbar не должен отображаться
  const noNavbarPaths = ["/login"];

  // Проверяем, нужно ли отображать Navbar
  const shouldShowNavbar = !noNavbarPaths.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Nav/>}
      {children}
    </>
  );
}

export default Layout