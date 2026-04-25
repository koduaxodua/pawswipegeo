import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/BottomNav";
import { Tutorial } from "@/components/Tutorial";
import { AdminModeProvider, useAdminMode } from "@/contexts/AdminMode";
import { LocaleProvider } from "@/contexts/Locale";
import Index from "./pages/Index";
import Favorites from "./pages/Favorites";
import AddDog from "./pages/AddDog";
import Missions from "./pages/Missions";
import Terms from "./pages/Terms";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function TermsOrAdmin() {
  const { isAdmin } = useAdminMode();
  return isAdmin ? <Admin /> : <Terms />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LocaleProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AdminModeProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/add" element={<AddDog />} />
            <Route path="/missions" element={<Missions />} />
            <Route path="/terms" element={<TermsOrAdmin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
          <Tutorial />
        </AdminModeProvider>
      </BrowserRouter>
    </TooltipProvider>
    </LocaleProvider>
  </QueryClientProvider>
);

export default App;
