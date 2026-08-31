"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { UserRole } from "@/lib/auth-utils";

import LogoutButton from "../shared/LogoutButton";
import { MobileNav } from "./MobileNavbar";

export function Header(user: {
  name: string;
  role: UserRole;
  avatar?: string;
}) {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center md:hidden">
        <MobileNav role={user.role} />
      </div>

      <div className="hidden md:flex flex-1 items-center gap-2">
        <h1 className="text-sm font-semibold capitalize text-foreground tracking-tight">
          {user.role.toLowerCase()} Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button className="relative h-9 w-9 rounded-full outline-none ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:ring-2 hover:ring-muted">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src={user.avatar || ""} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none truncate">
                  {user.name}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-1 py-1">
              <LogoutButton />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
