import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

const STORAGE_KEY = "hasSeenGuestPortalPopup";
const EXCLUDED_PATH_PREFIXES = ["/guest-portal", "/admin", "/comingsoon"];

const copy = {
  en: {
    title: "Guest Portal",
    description:
      "Head to the Guest Portal to find your room, travel details, and everything else you need for the weekend.",
    cta: "Go to Guest Portal",
    dismiss: "Maybe later",
  },
  pl: {
    title: "Portal Gościa",
    description:
      "Odwiedź Portal Gościa, aby znaleźć swój pokój, szczegóły podróży i wszystko, czego potrzebujesz na ten weekend.",
    cta: "Przejdź do Portalu Gościa",
    dismiss: "Może później",
  },
};

const GuestPortalPopup = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const labels = copy[language];

  useEffect(() => {
    if (EXCLUDED_PATH_PREFIXES.some((prefix) => location.pathname.startsWith(prefix))) return;

    let alreadySeen = true;
    try {
      alreadySeen = localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      /* ignore */
    }
    if (alreadySeen) return;

    const timer = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      try {
        localStorage.setItem(STORAGE_KEY, "true");
      } catch {
        /* ignore */
      }
    }
  };

  const handleVisitPortal = () => {
    handleOpenChange(false);
    navigate("/guest-portal");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">{labels.title}</DialogTitle>
          <DialogDescription className="font-body text-muted-foreground text-left">
            {labels.description}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-3">
          <button
            type="button"
            onClick={handleVisitPortal}
            className="w-full py-4 bg-primary text-primary-foreground label-xs hover:opacity-90 transition-opacity"
          >
            {labels.cta}
          </button>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="w-full text-center label-xs text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            {labels.dismiss}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GuestPortalPopup;
