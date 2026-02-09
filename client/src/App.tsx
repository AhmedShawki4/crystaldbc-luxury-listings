import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

import RegisterInterestDialog from "./components/RegisterInterestDialog";
import Home from "./pages/Home";
import Listings from "./pages/Listings";

import PropertyDetail from "./pages/PropertyDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import TermsAndConditions from "./pages/TermsAndConditions";
import Investment from "./pages/Investment";
import MyInvestments from "./pages/MyInvestments";
import NotFound from "./pages/NotFound";
import AboutAuth from "./pages/AboutAuth";
import Wishlist from "./pages/Wishlist";
import ProtectedRoute from "./components/ProtectedRoute";
import EntranceAnimation from "./components/EntranceAnimation";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminCMS from "./pages/admin/AdminCMS";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReports from "./pages/admin/AdminReports";
import AdminActivityLogs from "./pages/admin/AdminActivityLogs";
import AdminInvestments from "./pages/admin/AdminInvestments";
import AdminRentals from "./pages/admin/AdminRentals";
import AdminInvestmentBoxes from "./pages/admin/AdminInvestmentBoxes";
import { useCmsSection } from "@/hooks/useCmsSection";
import type { SiteSettingsContent } from "@/types";

const queryClient = new QueryClient();

const InvestmentGate = () => {
  const { data: siteSettings } = useCmsSection<SiteSettingsContent>("siteSettings", {
    rentButtonEnabled: true,
    investmentPageEnabled: true,
    logoUrl: "/crystaldbclogo.png",
  });
  const investmentPageEnabled = siteSettings?.investmentPageEnabled ?? true;

  return investmentPageEnabled ? <Investment /> : <Navigate to="/" replace />;
};

const App = () => {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.body.classList.add("bg-background");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <EntranceAnimation />
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <RegisterInterestDialog />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="listings" element={<Listings />} />

              <Route path="property/:propertyId" element={<PropertyDetail />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="terms" element={<TermsAndConditions />} />
              <Route path="investment" element={<InvestmentGate />} />
              <Route
                path="my-investments"
                element={
                  <ProtectedRoute roles={["user", "investor"]}>
                    <MyInvestments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="wishlist"
                element={
                  <ProtectedRoute roles={["user", "admin", "employee", "property-handler"]}>
                    <Wishlist />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="auth">
              <Route path=":mode" element={<AboutAuth />} />
            </Route>

            <Route
              path="admin"
              element={
                <ProtectedRoute roles={["admin", "employee", "property-handler"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="properties" element={<AdminProperties />} />
              <Route
                path="projects"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminProjects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="cms"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminCMS />
                  </ProtectedRoute>
                }
              />
              <Route
                path="leads"
                element={
                  <ProtectedRoute roles={["admin", "employee"]}>
                    <AdminLeads />
                  </ProtectedRoute>
                }
              />
              <Route
                path="messages"
                element={
                  <ProtectedRoute roles={["admin", "employee"]}>
                    <AdminMessages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="reports"
                element={
                  <ProtectedRoute roles={["admin", "employee"]}>
                    <AdminReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="activity"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminActivityLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="investments"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminInvestments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="investment-boxes"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminInvestmentBoxes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="rentals"
                element={
                  <ProtectedRoute roles={["admin", "employee", "property-handler"]}>
                    <AdminRentals />
                  </ProtectedRoute>
                }
              />
              <Route path="users" element={<ProtectedRoute roles={["admin"]}><AdminUsers /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
