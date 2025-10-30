import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GSAPExample from "./components/GSAPExample";
import ScrollTracker from "./components/ScrollTracker";
import Header from "@/components/Header";
import WorkWithUs from "./pages/WorkWithUs";
import GlobalReach from "./pages/GlobalReach";
import ProofInThePeople from "./pages/ProofInThePeople";
import CandidMoments from "./pages/CandidMoments";

const queryClient = new QueryClient();

const navigationItems = [
  {
    label: "Homepage",
    href: "/"
  },
  {
    label: "Work With Us",
    href: "/work-with-us",
    submenu: [
      { label: "Solve my hiring headaches", href: "/work-with-us#client" },
      { label: "Find my dream role", href: "/work-with-us#candidate" }
    ]
  },
  {
    label: "Global Reach",
    href: "/global-reach"
  },
  {
    label: "Proof in the People",
    href: "/proof-in-the-people"
  },
  {
    label: "Candid Moments",
    href: "/candid-moments"
  }
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollTracker />
        <Header items={navigationItems} cta={{ label: "JOIN", href: "/contact" }} />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/gsap-demo" element={<GSAPExample />} />
          <Route path="/work-with-us" element={<WorkWithUs />} />
          <Route path="/global-reach" element={<GlobalReach />} />
          <Route path="/proof-in-the-people" element={<ProofInThePeople />} />
          <Route path="/candid-moments" element={<CandidMoments />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
