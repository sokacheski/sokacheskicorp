import { NavLink, Outlet } from "react-router-dom";
import type { ReactNode } from "react";

import {
  LayoutDashboard,
  Radio,
  Flame,
  Image,
  Plug,
  Users,
  MessageCircle,
  Gamepad2,
  Bell,
  ExternalLink,
  Settings,
  LogOut,
} from "lucide-react";

export default function SidebarLayout() {
  return (
    <div className="flex h-screen bg-[#0B0F1A] text-white">
      {/* Sidebar */}
      <aside className="w-72 bg-[#141A26] border-r border-gray-800 flex flex-col">
        {/* Logo Area */}
        <div className="px-6 py-8 border-b border-gray-800">
          <div className="text-center select-none">
            <h1 className="text-2xl font-bold tracking-wider text-white">
              SOKACHESKI
            </h1>
            <span className="text-[10px] tracking-[0.3em] text-gray-500">
              CORPORATION
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <SidebarLink to="/dashboard" icon={<LayoutDashboard size={18} />}>
            Dashboard
          </SidebarLink>

          <SidebarLink to="/lives" icon={<Radio size={18} />}>
            Lives
          </SidebarLink>

          <SidebarLink to="/showcase" icon={<Flame size={18} />}>
            Showcase
          </SidebarLink>

          <SidebarLink to="/banners" icon={<Image size={18} />}>
            Banners
          </SidebarLink>

          <SidebarLink to="/integrations" icon={<Plug size={18} />}>
            Integrations
          </SidebarLink>

          <SidebarLink to="/users" icon={<Users size={18} />}>
            Users
          </SidebarLink>

          <SidebarLink to="/communities" icon={<MessageCircle size={18} />}>
            Communities
          </SidebarLink>

          <SidebarLink to="/gamification" icon={<Gamepad2 size={18} />}>
            Gamification
          </SidebarLink>

          <SidebarLink to="/notifications" icon={<Bell size={18} />}>
            Notifications
          </SidebarLink>

          <SidebarLink to="/members" icon={<ExternalLink size={18} />}>
            Members Area
          </SidebarLink>

          <SidebarLink to="/config" icon={<Settings size={18} />}>
            Settings
          </SidebarLink>
        </nav>

        {/* Logout Button */}
        <div className="px-4 py-6 border-t border-gray-800">
          <NavLink
            to="/logout"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
          >
            <LogOut size={18} className="group-hover:text-red-400" />
            Logout
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#0B0F1A]">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

/* ================= COMPONENT ================= */

interface SidebarLinkProps {
  to: string;
  icon: ReactNode;
  children: ReactNode;
}

function SidebarLink({ to, icon, children }: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 group
        ${
          isActive
            ? "bg-blue-600/10 text-blue-400 border-l-2 border-blue-500"
            : "text-gray-400 hover:text-gray-300 hover:bg-[#1A212F]"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`transition-colors ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-400'}`}>
            {icon}
          </span>
          <span className="flex-1">{children}</span>
          {isActive && (
            <span className="w-1 h-1 rounded-full bg-blue-500" />
          )}
        </>
      )}
    </NavLink>
  );
}