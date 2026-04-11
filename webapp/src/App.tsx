import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GroupsPage from "./pages/GroupsPage";
import PeoplePage from "./pages/PeoplePage";
import PersonDetailPage from "./pages/PersonDetailPage";
import PersonFormPage from "./pages/PersonFormPage";
import EditGroupPage from "./pages/EditGroupPage";
import DeletedGroupsPage from "./pages/DeletedGroupsPage";
import NotFound from "./pages/NotFound";

// Disable browser scroll restoration so we control scroll position on navigation
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GroupsPage />} />
          <Route path="/groups/:groupId" element={<PeoplePage />} />
          <Route path="/groups/:groupId/add" element={<PersonFormPage />} />
          <Route path="/groups/:groupId/edit" element={<EditGroupPage />} />
          <Route path="/people/:personId" element={<PersonDetailPage />} />
          <Route path="/people/:personId/edit" element={<PersonFormPage />} />
          <Route path="/deleted-groups" element={<DeletedGroupsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
