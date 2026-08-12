import Navbar from './Navbar';

const Layout = ({ children }) => (
  <div className="app-shell">
    <Navbar />
    <main className="main-content page-fade-in">{children}</main>
  </div>
);

export default Layout;