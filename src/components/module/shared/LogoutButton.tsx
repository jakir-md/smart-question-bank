"use client";

import { Button } from "@/components/ui/button";
import { logoutUser } from "@/services/auth.service";

import { LogOut } from "lucide-react";

const LogoutButton = () => {
  const handleLogout = async () => {
    await logoutUser();
  };
  return (
    <Button className="w-full" variant={"destructive"} onClick={handleLogout}>
      <span>
        <LogOut className="h-4 w-4" />
      </span>{" "}
      Logout
    </Button>
  );
};

export default LogoutButton;
