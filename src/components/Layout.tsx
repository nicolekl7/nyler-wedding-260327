import { ReactNode } from "react";
import Navigation from "./Navigation";
import Footer from "./Footer";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Navigation />
    <main className="pt-16 animate-page-enter">{children}</main>
    <Footer />
  </div>
);

export default Layout;
