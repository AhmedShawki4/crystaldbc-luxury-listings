import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import RegisterInterestDialog from "./components/RegisterInterestDialog";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import ForRent from "./pages/ForRent";
import PropertyDetail from "./pages/PropertyDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Investment from "./pages/Investment";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/Auth";
import Wishlist from "./pages/Wishlist";
import ProtectedRoute from "./components/ProtectedRoute";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RegisterInterestDialog />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="listings" element={<Listings />} />
            <Route path="for-rent" element={<ForRent />} />
            <Route path="property/:propertyId" element={<PropertyDetail />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="investment" element={<Investment />} />
            <Route
              path="wishlist"
              element={
                <ProtectedRoute roles={["user", "admin", "employee"]}>
                  <Wishlist />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="auth">
            <Route path="login" element={<AuthPage mode="login" />} />
            <Route path="register" element={<AuthPage mode="register" />} />
          </Route>

          <Route
            path="admin"
            element={
              <ProtectedRoute roles={["admin", "employee"]}>
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
            <Route path="leads" element={<AdminLeads />} />
            <Route path="messages" element={<AdminMessages />} />
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
            <Route path="users" element={<ProtectedRoute roles={["admin"]}><AdminUsers /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
