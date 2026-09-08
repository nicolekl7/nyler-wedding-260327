import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const STORAGE_KEY = "hasSeenGuestPortalPopup";
const EXCLUDED_PATH_PREFIXES = ["/guest-portal", "/admin", "/comingsoon"];

const copy = {
  en: {
    title: "Welcome!",
    description:
      "Head to the Guest Portal to find your room, travel details, and everything else you need for the weekend.",
    cta: "Go to Guest Portal",
    dismiss: "Maybe later",
  },
  pl: {
    title: "Witamy!",
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
      <DialogContent className="sm:max-w-md text-center sm:text-left">
        <DialogHeader>
          <DialogTitle className="heading-card">{labels.title}</DialogTitle>
          <DialogDescription className="font-body text-muted-foreground">
            {labels.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button onClick={handleVisitPortal} className="w-full sm:w-auto">
            {labels.cta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GuestPortalPopup;
