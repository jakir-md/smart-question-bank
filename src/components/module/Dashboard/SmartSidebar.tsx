"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogOut, Menu } from "lucide-react";

import {
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

import { UserRole } from "@/lib/auth-utils";
import { dashboardNav, type NavItem } from "@/lib/navItems.config";
import LogoutButton from "../shared/LogoutButton";
import { logoutAction } from "@/services/auth/auth.service";

export function SmartSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const navItems = dashboardNav[role];

  const [collapsed, setCollapsed] = useState(false);

  const isActiveMenu = (href: string) => {
    const dashboardRoutes = [
      "/student/dashboard",
      "/admin/dashboard",

      "/driver/dashboard",
    ];

    if (dashboardRoutes.includes(href)) {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <>
      {/* ================= Desktop Sidebar ================= */}
      <div
        className={cn(
          "sticky top-0 z-40 hidden md:flex flex-col h-screen transition-all duration-300 ease-in-out border-r bg-background",
          collapsed ? "w-20" : "w-56",
        )}
      >
        {/* Header */}
        <SidebarHeader
          className={cn(
            "flex h-16 items-center border-b px-4 transition-all duration-300",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "p-2 rounded-md hover:bg-muted hover:text-foreground transition-colors",
              collapsed && "mx-auto",
            )}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="h-5 w-5" />
          </button>
        </SidebarHeader>

        {/* Menu */}
        <SidebarContent className="flex-1 overflow-y-auto overflow-x-hidden">
          <nav className="p-3 space-y-1">
            {navItems.map((item: NavItem) => {
              const isActive = isActiveMenu(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary lg:text-primary-foreground border sm:border-primary"
                      : " hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center",
                  )}
                  title={collapsed ? item.title : ""}
                >
                  <item.icon className="h-5 w-5 shrink-0" />

                  {!collapsed && <span className="truncate">{item.title}</span>}
                </Link>
              );
            })}
          </nav>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="border-t p-4 flex justify-center bg-muted/20">
          {collapsed ? (
            <LogoutButton />
          ) : (
            <div className="w-full">
              <LogoutButton />
            </div>
          )}
        </SidebarFooter>
      </div>
    </>
  );
}
