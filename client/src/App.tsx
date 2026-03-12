import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/auth";
import SidebarLayout from "./pages/sidebar";
import Dashboard from "./components/sidebar/dashboard";
import Showcase from "./components/sidebar/showcase";
import Members from "./components/sidebar/members";
import Users from "./components/sidebar/users";
import Gamification from "./components/sidebar/gamification";
import Communities from "./components/sidebar/communities";
import Config from "./components/sidebar/config";
import MembersLayout from "./pages/members";
import { RequireAuth, RequireAdmin } from "./routes/guards";
import CourseView from "./pages/CourseView";
import LessonView from "./pages/LessonView";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= LOGIN ================= */}
        <Route path="/" element={<AuthPage />} />

        {/* ================= ADMIN AREA ================= */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <RequireAdmin>
                <SidebarLayout />
              </RequireAdmin>
            </RequireAuth>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="lives" element={<div>Lives</div>} />
          <Route path="showcase" element={<Showcase />} />
          <Route path="banners" element={<div>Banners</div>} />
          <Route path="integrations" element={<div>Integrations</div>} />
          <Route path="users" element={<Users />} />
          <Route path="communities" element={<Communities />} />
          <Route path="gamification" element={<Gamification />} />
          <Route path="notifications" element={<div>Notifications</div>} />
          <Route path="members" element={<Members />} />
          <Route path="config" element={<Config />} />
        </Route>

        {/* ================= MEMBER AREA ================= */}
        <Route
          path="/member"
          element={
            <RequireAuth>
              <MembersLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Members />} />
          <Route path="curso/:id" element={<CourseView />} />
          <Route path="modulo/:moduleId/aula/:lessonId" element={<LessonView />} />
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;