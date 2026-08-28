import { getUserInfo } from "@/services/auth/getUserInfo";
import { redirect } from "next/navigation";
import { UserRole } from "@/lib/auth-utils";

/**
 * Home page component (/) of the application.
 *
 * If user is not authenticated, redirects to /login.
 * If user is ADMIN, redirects to /admin/dashboard.
 * If user is STUDENT, displays the student home dashboard directly.
 */
export default async function Home(): Promise<React.ReactNode> {
  const result = await getUserInfo();
  console.log("Home page user info:", result);

  if (!result.isAuthenticated || !result.user || !result.user.roles || result.user.roles.length === 0) {
    redirect("/login");
  }

  const userRole = result.user.roles[0] as UserRole;

  if (userRole === "ADMIN") {
    redirect("/admin/dashboard?loggedIn=true");
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-4 text-emerald-600">Welcome to Smart Question Bank</h1>
      <p className="text-slate-600 mb-6">Select a subject card below to dive deep into chapters, topics, and take exams.</p>
      
      {/* Subject Cards Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Physics</h2>
          <p className="text-sm text-slate-500">12 chapters • 48 topics</p>
        </div>
        <div className="border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Chemistry</h2>
          <p className="text-sm text-slate-500">10 chapters • 35 topics</p>
        </div>
        <div className="border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Mathematics</h2>
          <p className="text-sm text-slate-500">15 chapters • 60 topics</p>
        </div>
      </div>
    </div>
  );
}
