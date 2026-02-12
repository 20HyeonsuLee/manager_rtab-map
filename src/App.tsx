import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import BuildingsPage from "@/pages/BuildingsPage";
import BuildingDetailPage from "@/pages/BuildingDetailPage";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="indoor-nav-theme">
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<BuildingsPage />} />
              <Route path="/buildings/:id" element={<BuildingDetailPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="bottom-right" />
      </TooltipProvider>
    </ThemeProvider>
  );
}
