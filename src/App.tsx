import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import ScrollToTop from "./components/ScrollToTop";
import CatTapRipple from "./components/CatTapRipple";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";

// Previous guest-facing pages, navigation and the guest portal popup are
// archived under src/pages/archive and src/components/archive (not routed).

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
          <Route path="/admin" element={<Admin />} />
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
