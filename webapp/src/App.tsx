import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GroupsPage from "./pages/GroupsPage";
import PeoplePage from "./pages/PeoplePage";
import PersonDetailPage from "./pages/PersonDetailPage";
import AddPersonPage from "./pages/AddPersonPage";
import EditPersonPage from "./pages/EditPersonPage";
import EditGroupPage from "./pages/EditGroupPage";
import DeletedGroupsPage from "./pages/DeletedGroupsPage";
import NotFound from "./pages/NotFound";

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
          <Route path="/groups/:groupId/add" element={<AddPersonPage />} />
          <Route path="/groups/:groupId/edit" element={<EditGroupPage />} />
          <Route path="/people/:personId" element={<PersonDetailPage />} />
          <Route path="/people/:personId/edit" element={<EditPersonPage />} />
          <Route path="/deleted-groups" element={<DeletedGroupsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
