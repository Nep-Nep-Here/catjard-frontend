import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Navbar, Footer } from '../layout/Layout.jsx';

export default function PublicLayout() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <main className="font-body">
      <Navbar />
      <Outlet />
      <Footer />
    </main>
  );
}
