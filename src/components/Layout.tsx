import { ReactNode } from "react";
import Navigation from "./Navigation";
import Footer from "./Footer";

const Layout = ({ children, dark = false }: { children: ReactNode; dark?: boolean }) => (
  <div className={`min-h-screen flex flex-col bg-background text-foreground${dark ? " dark-page" : ""}`}>
    <Navigation />
    <main className="pt-16 animate-page-enter">{children}</main>
    <Footer />
  </div>
);

export default Layout;
