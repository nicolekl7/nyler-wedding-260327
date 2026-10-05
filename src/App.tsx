import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import ScrollToTop from "./components/ScrollToTop";
import CatTapRipple from "./components/CatTapRipple";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import OurStory from "./pages/OurStory";
import Registry from "./pages/Registry";
import Admin from "./pages/Admin";
import ArchiveIndex from "./archive/pages/Index";
import ArchiveTravel from "./archive/pages/Travel";
import ArchiveTheWeekend from "./archive/pages/TheWeekend";
import ArchiveOurStory from "./archive/pages/OurStory";
import ArchiveOurStoryV2 from "./archive/pages/OurStoryV2";
import ArchiveRsvpV2 from "./archive/pages/RsvpV2";

// Previous guest-facing pages and the guest portal popup are archived under
// src/pages/archive and src/components/archive (not routed).
// /archive serves a frozen copy of the site from when RSVPs were open
// (nav: Home, Travel, Itinerary, Registry, Our Story, RSVP). See src/archive.

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
    <TooltipProvider>
      <Sonner />
      <CatTapRipple />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/our-story" element={<OurStory />} />
          <Route path="/registry" element={<Registry />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/archive" element={<ArchiveIndex />} />
          <Route path="/archive/travel" element={<ArchiveTravel />} />
          <Route path="/archive/the-weekend" element={<ArchiveTheWeekend />} />
          <Route path="/archive/our-story" element={<ArchiveOurStory />} />
          <Route path="/archive/about-us" element={<ArchiveOurStoryV2 />} />
          <Route path="/archive/rsvp-v2" element={<ArchiveRsvpV2 />} />
          <Route path="/archive/*" element={<Navigate to="/archive" replace />} />
          <Route path="/admin/reservations" element={<Navigate to="/admin?tab=reservations" replace />} />
          <Route path="/admin/shuttle" element={<Navigate to="/admin?tab=travel" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Analytics />
    </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
