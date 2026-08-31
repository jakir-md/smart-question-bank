import * as React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UserRole } from "@/lib/auth-utils";
import { getUserInfo } from "@/services/auth/getUserInfo";
import { SmartSidebar } from "@/components/module/Dashboard/SmartSidebar";
import { Header } from "@/components/module/Dashboard/Header";
import { redirect } from "next/navigation";

/**
 * DashboardLayout - layout for authenticated dashboard views.
 * Ensures the user is logged in, extracts user details, and renders sidebar/header.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactNode> {
  const result = await getUserInfo();

  // if (!result.isAuthenticated || !result.user || !result.user.roles || result.user.roles.length === 0) {
  //   redirect("/login");
  // }

  const activeUser = result.user;
  console.log({ activeUser });
  if (!activeUser) return null;
  const userRole = activeUser!.roles[0] as UserRole;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40 dark:bg-background">
        <SmartSidebar role={userRole} />

        <div className="flex flex-1 flex-col min-w-0">
          <Header
            name={activeUser.displayName}
            role={userRole}
            avatar={activeUser.profileImage}
          />
          <main className="flex-1 p-2 md:p-6 lg:p-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
