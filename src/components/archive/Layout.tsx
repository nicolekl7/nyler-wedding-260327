import { ReactNode } from "react";
import Navigation from "./Navigation";
import Footer from "./Footer";

const Layout = ({ children, dark = false, hideFooterImage = false }: { children: ReactNode; dark?: boolean; hideFooterImage?: boolean }) => (
  <div className={`min-h-screen flex flex-col bg-background text-foreground${dark ? " dark-page" : ""}`}>
    <Navigation dark={dark} />
    <main className="pt-16 animate-page-enter">{children}</main>
    <Footer hideImage={hideFooterImage} />
  </div>
);

export default Layout;
