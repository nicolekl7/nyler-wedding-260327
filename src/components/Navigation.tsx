import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/T&N Logo Web.png";

const navLabels = {
  en: {
    home: "Schedule",
    travel: "Travel",
    events: "Attire",
    registry: "Registry",
    ourStory: "Our Story",
    rsvp: "CONFIRM TRAVEL",
  },
  pl: {
    home: "Plan",
    travel: "Podróż",
    events: "Strój",
    registry: "Lista prezentów",
    ourStory: "Nasza historia",
    rsvp: "POTWIERDŹ PODRÓŻ",
  },
};

const Navigation = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const labels = navLabels[language];

  const navItems = [
    { path: "/", label: labels.home },
    { path: "/our-story", label: labels.ourStory, hidden: true },
    { path: "/travel", label: labels.travel },
    { path: "/the-weekend", label: labels.events },
    { path: "https://www.zola.com/registry/nicoleandtylersregistry", label: labels.registry, external: true },
    { path: "/about-us", label: labels.ourStory },
    { path: "/shuttle", label: labels.rsvp, cta: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border/50" style={{ WebkitTransform: 'translateZ(0)' }}>
      <div className="flex items-center justify-between px-6 md:px-12 py-4">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Tyler &amp; Nicole" className="h-8 md:h-10 w-auto object-contain" />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.filter((item) => !item.hidden).map((item) =>
            item.external ? (
              <a
                key={item.path}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-px after:bg-foreground after:transition-all after:duration-300 after:w-0 hover:after:w-full"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                className={
                  item.cta
                    ? "font-body text-xs uppercase tracking-[0.2em] border border-foreground rounded-full px-5 py-2 text-foreground hover:bg-foreground hover:text-background transition-colors duration-300"
                    : `nav-link relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-px after:bg-foreground after:transition-all after:duration-300 ${
                        location.pathname === item.path
                          ? "text-foreground after:w-full"
                          : "after:w-0 hover:after:w-full"
                      }`
                }
              >
                {item.label}
              </Link>
            )
          )}

          {/* Language switcher — desktop */}
          <div className="flex items-center gap-1 font-body text-xs tracking-widest">
            <button
              onClick={() => setLanguage("pl")}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-opacity ${language === "pl" ? "opacity-100 font-medium" : "opacity-40 hover:opacity-70"}`}
              aria-label="Switch to Polish"
            >
              <span>🇵🇱</span>
              <span>PL</span>
            </button>
            <span className="text-muted-foreground/50">|</span>
            <button
              onClick={() => setLanguage("en")}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-opacity ${language === "en" ? "opacity-100 font-medium" : "opacity-40 hover:opacity-70"}`}
              aria-label="Switch to English"
            >
              <span>🇺🇸</span>
              <span>EN</span>
            </button>
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
          {navItems.filter((item) => !item.hidden).map((item) =>
            item.external ? (
              <a
                key={item.path}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="nav-link"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`nav-link ${location.pathname === item.path ? "text-foreground" : ""}`}
              >
                {item.label}
              </Link>
            )
          )}

          {/* Language switcher — mobile */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/30 font-body text-xs tracking-widest">
            <button
              onClick={() => { setLanguage("pl"); setOpen(false); }}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-opacity ${language === "pl" ? "opacity-100 font-medium" : "opacity-40"}`}
              aria-label="Switch to Polish"
            >
              <span>🇵🇱</span>
              <span>POLSKI</span>
            </button>
            <span className="text-muted-foreground/50">|</span>
            <button
              onClick={() => { setLanguage("en"); setOpen(false); }}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-opacity ${language === "en" ? "opacity-100 font-medium" : "opacity-40"}`}
              aria-label="Switch to English"
            >
              <span>🇺🇸</span>
              <span>ENGLISH</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
