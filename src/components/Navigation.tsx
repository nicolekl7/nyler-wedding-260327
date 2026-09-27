import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/T&N Logo Web.png";

const ZOLA_URL = "https://www.zola.com/registry/nicoleandtylersregistry/";
const AMAZON_URL = "https://www.amazon.com/wedding/guest-view/10UL21FCFHV3X";

const navLabels = {
  en: {
    home: "Home",
    ourStory: "Our Story",
    registry: "Registry",
    amazon: "Amazon",
    zola: "Zola",
  },
  pl: {
    home: "Start",
    ourStory: "Nasza Historia",
    registry: "Lista Prezentów",
    amazon: "Amazon",
    zola: "Zola",
  },
};

const Navigation = ({ dark = false }: { dark?: boolean }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [registryOpen, setRegistryOpen] = useState(false);
  const { language } = useLanguage();
  const labels = navLabels[language];

  const navItems: { path: string; to?: string; label: string }[] = [
    { path: "/", label: labels.home },
    { path: "/our-story", label: labels.ourStory },
    { path: "/registry", label: labels.registry },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border/50" style={{ WebkitTransform: 'translateZ(0)' }}>
      <div className="flex items-center justify-between px-6 md:px-12 py-4">
        <Link to="/" className="flex items-center">
          <img
            src={logo}
            alt="Tyler &amp; Nicole"
            className={`h-8 md:h-10 w-auto object-contain${dark ? " brightness-0 invert" : ""}`}
          />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-7">
            {navItems.map((item) =>
              item.path === "/registry" ? (
                <div key={item.path} className="relative group flex items-center">
                  <Link
                    to={item.to ?? item.path}
                    className={`nav-link relative inline-flex items-center gap-1 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-px after:bg-foreground after:transition-all after:duration-300 ${
                      location.pathname === item.path
                        ? "text-foreground after:w-full"
                        : "after:w-0 hover:after:w-full"
                    }`}
                  >
                    {item.label}
                    <ChevronDown size={14} className="opacity-60" />
                  </Link>
                  <div className="absolute left-0 top-full pt-3 hidden group-hover:block group-focus-within:block z-50">
                    <div className="bg-background border border-border/50 shadow-md min-w-[140px] py-2">
                      <a
                        href={AMAZON_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nav-link block px-4 py-2 hover:bg-muted"
                      >
                        {labels.amazon}
                      </a>
                      <a
                        href={ZOLA_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nav-link block px-4 py-2 hover:bg-muted"
                      >
                        {labels.zola}
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.to ?? item.path}
                  className={`nav-link relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-px after:bg-foreground after:transition-all after:duration-300 ${
                    location.pathname === item.path
                      ? "text-foreground after:w-full"
                      : "after:w-0 hover:after:w-full"
                  }`}
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-[28rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-background border-b border-border px-6 pb-6 flex flex-col gap-4">
          {navItems.map((item) =>
            item.path === "/registry" ? (
              <div key={item.path} className="flex flex-col">
                <div className="flex items-center justify-between">
                  <Link
                    to={item.to ?? item.path}
                    onClick={() => setOpen(false)}
                    className={`nav-link ${location.pathname === item.path ? "text-foreground" : ""}`}
                  >
                    {item.label}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setRegistryOpen(!registryOpen)}
                    aria-label="Toggle registry links"
                    className="p-1 text-foreground"
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${registryOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    registryOpen ? "max-h-24 opacity-100 mt-3" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="flex flex-col gap-3 pl-4">
                    <a
                      href={AMAZON_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nav-link"
                    >
                      {labels.amazon}
                    </a>
                    <a
                      href={ZOLA_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nav-link"
                    >
                      {labels.zola}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.path}
                to={item.to ?? item.path}
                onClick={() => setOpen(false)}
                className={`nav-link ${location.pathname === item.path ? "text-foreground" : ""}`}
              >
                {item.label}
              </Link>
            ),
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
