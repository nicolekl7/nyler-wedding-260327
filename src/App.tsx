import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import ScrollToTop from "./components/ScrollToTop";
import CatTapRipple from "./components/CatTapRipple";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "./contexts/LanguageContext";
import Index from "./pages/Index";
import IndexV2 from "./pages/IndexV2";
import HomeV2 from "./pages/HomeV2";
import OurStory from "./pages/OurStory";
import OurStoryV2 from "./pages/OurStoryV2";
import TheWeekend from "./pages/TheWeekend";
import AccommodationsV2 from "./pages/AccommodationsV2";
import BookingSuccess from "./pages/BookingSuccess";
import Travel from "./pages/Travel";
import RsvpV2 from "./pages/RsvpV2";
import Payment from "./pages/Payment";
import Admin from "./pages/Admin";
import Shuttle from "./pages/Shuttle";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

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
          <Route path="/" element={<Index />} />
          <Route path="/the-weekend" element={<TheWeekend />} />
          <Route path="/reserve-lodging" element={<AccommodationsV2 />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route path="/travel" element={<Travel />} />
          <Route path="/rsvp-v2" element={<RsvpV2 />} />
          <Route path="/local-guide" element={<Navigate to="/travel" replace />} />
          <Route path="/our-story" element={<OurStory />} />
          <Route path="/about-us" element={<OurStoryV2 />} />
          <Route path="/home-v2" element={<HomeV2 />} />
          <Route path="/home" element={<HomeV2 />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/reservations" element={<Navigate to="/admin?tab=reservations" replace />} />
          <Route path="/admin/shuttle" element={<Navigate to="/admin?tab=travel" replace />} />
          <Route path="/comingsoon" element={<ComingSoon />} />
          <Route path="/shuttle" element={<Navigate to="/comingsoon" replace />} />
          <Route path="/shuttle-form" element={<Shuttle />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Analytics />
    </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
