import { getDefaultDashboardRoute, UserRole } from "@/lib/auth-utils";
import { getUserInfo } from "@/services/auth.service";

import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getUserInfo();
  console.log("Home page user info:", user);

  if (!user || !user.role) {
    redirect("/login");
  }

  console.log("login user", user);

  const userRole = user.role as UserRole;

  redirect(`${getDefaultDashboardRoute(userRole)}?loggedIn=true`);

  return null;
}
