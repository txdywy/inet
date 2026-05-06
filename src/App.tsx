import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { UpdatesPage } from "./pages/UpdatesPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { ProtocolsPage } from "./pages/ProtocolsPage";
import { ProtocolDetailPage } from "./pages/ProtocolDetailPage";
import { TagsPage } from "./pages/TagsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/updates" element={<UpdatesPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
          <Route path="/protocols" element={<ProtocolsPage />} />
          <Route path="/protocols/:slug" element={<ProtocolDetailPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
