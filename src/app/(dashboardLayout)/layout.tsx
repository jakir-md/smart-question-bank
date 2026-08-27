import * as React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";

import { UserRole } from "@/lib/auth-utils";

import { getUserInfo } from "@/services/auth.service";
import { SmartSidebar } from "@/components/module/Dashboard/SmartSidebar";
import { Header } from "@/components/module/Dashboard/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Promise.all দিয়ে একসাথে ৩টি এপিআই কল করা হলো (Concurrent Fetching)
  const user = await getUserInfo();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40 dark:bg-background">
        <SmartSidebar role={user.role as UserRole} />

        <div className="flex flex-1 flex-col min-w-0">
          <Header
            name={user.name}
            role={user.role as UserRole}
            avatar={user?.avatarUrl}
          />
          <main className="flex-1 p-2 md:p-6 lg:p-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
