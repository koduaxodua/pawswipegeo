import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/BottomNav";
import { TopLeftBrand } from "@/components/TopLeftBrand";
import { TopRightLogo } from "@/components/TopRightLogo";
import { Tutorial } from "@/components/Tutorial";
import { CookieConsent } from "@/components/CookieConsent";
import { LocaleProvider } from "@/contexts/Locale";
import Index from "./pages/Index";
import Favorites from "./pages/Favorites";
import AddDog from "./pages/AddDog";
import Missions from "./pages/Missions";
import Terms from "./pages/Terms";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import PrivacyKa from "./pages/PrivacyKa";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LocaleProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/add" element={<AddDog />} />
            <Route path="/missions" element={<Missions />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/ka/privacy" element={<PrivacyKa />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
          <TopLeftBrand />
          <TopRightLogo />
          <Tutorial />
          <CookieConsent />
      </BrowserRouter>
    </TooltipProvider>
    </LocaleProvider>
  </QueryClientProvider>
);

export default App;
