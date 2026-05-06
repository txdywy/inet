import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { UpdatesPage } from "./pages/UpdatesPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { ProtocolsPage } from "./pages/ProtocolsPage";
import { ProtocolDetailPage } from "./pages/ProtocolDetailPage";
import { TagsPage } from "./pages/TagsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function SPARedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const redirect = sessionStorage.getItem("spa-redirect");
    if (redirect && location.pathname === "/") {
      sessionStorage.removeItem("spa-redirect");
      navigate("/" + redirect, { replace: true });
    }
  }, [navigate, location]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <SPARedirect />
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
