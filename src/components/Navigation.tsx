import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/the-weekend", label: "Events" },
  { path: "/travel", label: "Travel" },
  { path: "/local-guide", label: "Explore" },
  { path: "/rsvp-v2", label: "RSVP", cta: true },
];

const Navigation = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border/50" style={{ WebkitTransform: 'translateZ(0)' }}>
      <div className="flex items-center justify-between px-6 md:px-12 py-4">
        <Link to="/" className="font-serif text-lg tracking-wide text-foreground">
          N &amp; T
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
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
          ))}
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
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-background border-b border-border px-6 pb-6 flex flex-col gap-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={`nav-link ${location.pathname === item.path ? "text-foreground" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
