import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import CatTapRipple from "./components/CatTapRipple";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import IndexV2 from "./pages/IndexV2";
import OurStory from "./pages/OurStory";
import TheWeekend from "./pages/TheWeekend";
import AccommodationsV2 from "./pages/AccommodationsV2";
import BookingSuccess from "./pages/BookingSuccess";
import Travel from "./pages/Travel";
import RsvpV2 from "./pages/RsvpV2";
import LocalGuide from "./pages/LocalGuide";
import OurStory from "./pages/OurStory";
import Payment from "./pages/Payment";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <Route path="/local-guide" element={<LocalGuide />} />
          <Route path="/our-story" element={<OurStory />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
