"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { UserRole } from "@/lib/auth-utils";
import { dashboardNav } from "@/lib/navItems.config";
import { SidebarFooter } from "@/components/ui/sidebar";
import LogoutButton from "../shared/LogoutButton";
import { useState } from "react";
import { logoutUser } from "@/services/auth.service";

export function MobileNav({ role }: { role: UserRole }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const navItems = dashboardNav[role];

  const isActiveMenu = (href: string) => {
    if (
      href === "/user/dashboard" ||
      href === "/admin/dashboard" ||
      href === "/hallAdmin/dashboard" ||
      href === "/hallStaff/dashboard"
    ) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      {/* Added flex and flex-col to the main container */}
      <SheetContent side="left" className="w-64 p-0 flex flex-col">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="capitalize">{role} Panel</SheetTitle>
        </SheetHeader>

        {/* Added flex-1 to push the footer down, and overflow-y-auto for scrolling */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = isActiveMenu(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5",
                  isActive && "bg-primary text-primary-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Footer naturally stays at the bottom now */}
        <SidebarFooter className="border-t p-4 flex justify-center mt-auto">
          {collapsed ? (
            <button
              onClick={async () => {
                await logoutUser();
              }}
              className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md transition"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          ) : (
            <LogoutButton />
          )}
        </SidebarFooter>
      </SheetContent>
    </Sheet>
  );
}
