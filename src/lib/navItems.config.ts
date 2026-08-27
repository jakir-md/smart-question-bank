// config/dashboard-nav.ts
import {
  LayoutDashboard,
  Ticket,
  CreditCard,
  Utensils,
  Users,
  BarChart,
  Plus,
  Lock,
  Wallet,
  BellRing,
  Settings,
} from "lucide-react";
import { UserRole } from "./auth-utils";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const dashboardNav: Record<UserRole, NavItem[]> = {
  /* ================= STUDENT ================= */
  STUDENT: [
    { title: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { title: "Buy Coupon", href: "/student/dashboard/buy-coupon", icon: Ticket },
    { title: "My Coupons", href: "/student/dashboard/my-coupon", icon: Ticket },

    {
      title: "My Wallet",
      href: "/student/dashboard/add-wallet-balance",
      icon: CreditCard,
    },
    {
      title: "Payment History",
      href: "/student/dashboard/payments-history",
      icon: CreditCard,
    },

    {
      title: "change password",
      href: "/student/dashboard/change-password",
      icon: Lock,
    },
  ],

  /* ================= HALL ADMIN ================= */
  ADMIN: [
    { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    {
      title: "Add Student Whitelist",
      href: "/admin/dashboard/add-student-whitelist",
      icon: Utensils,
    },
    { title: "Add-Driver", href: "/admin/dashboard/add-driver", icon: Plus },

    {
      title: "User Management",
      href: "/admin/dashboard/user-management",
      icon: Users,
    },
    
    {
      title: "Offline Feast",
      href: "/admin/dashboard/offline-feast",
      icon: CreditCard,
    },
    { title: "Reports", href: "/admin/dashboard/reports", icon: BarChart },
    {
      title: "change password",
      href: "/admin/dashboard/change-password",
      icon: Lock,
    },
    {
      title: "Notice",
      href: "/admin/dashboard/notice",
      icon: BellRing,
    },
  ],

  /* ================= SUPER ADMIN ================= */
  DRIVER: [
    { title: "Dashboard", href: "/driver/dashboard", icon: LayoutDashboard },
    { title: "Add-Hall", href: "/driver/dashboard/add-hall", icon: Plus },
    {
      title: "Add-Hall-Admin",
      href: "/driver/dashboard/add-hall-admin",
      icon: Plus,
    },
    {
      title: "Failed Transactions",
      href: "/driver/dashboard/failed-transactions",
      icon: Wallet,
    },
    {
      title: "Hall Wallets",
      href: "/driver/dashboard/hall-wallets",
      icon: CreditCard,
    },
    {
      title: "Transaction Reports",
      href: "/driver/dashboard/transaction-reports",
      icon: BarChart,
    },

    {
      title: "change password",
      href: "/driver/dashboard/change-password",
      icon: Lock,
    },
  ],
 
};
