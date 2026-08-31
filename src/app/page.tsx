import { getUserInfo } from "@/services/auth/getUserInfo";
import { redirect } from "next/navigation";
import { UserRole } from "@/lib/auth-utils";
import ProfileCompletionModal from "@/components/module/shared/ProfileCompletionModal";

/**
 * Home page component (/) of the application.
 *
 * If user is not authenticated, redirects to /login.
 * If user is ADMIN, redirects to /admin/dashboard.
 * If user is STUDENT, displays the student home dashboard directly.
 * If student is not onboarded, shows ProfileCompletionModal overlay.
 */
export default async function Home(): Promise<React.ReactNode> {
  const result = await getUserInfo();

  if (!result.isAuthenticated || !result.user || !result.user.roles || result.user.roles.length === 0) {
    redirect("/login");
  }

  const activeUser = result.user;
  const userRole = activeUser.roles[0] as UserRole;

  // if (userRole === "ADMIN") {
  //   redirect("/admin/dashboard?loggedIn=true");
  // }

  const showOnboarding = !activeUser.isOnboarded;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-4 text-primary">Welcome to Smart Question Bank</h1>
      <p className="text-on-surface-variant mb-6">
        Select a subject card below to dive deep into chapters, topics, and take exams.
      </p>

      {/* Subject Cards Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-outline-variant/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer bg-surface-container-lowest">
          <h2 className="text-xl font-bold text-on-surface mb-2">Physics</h2>
          <p className="text-sm text-secondary">12 chapters • 48 topics</p>
        </div>
        <div className="border border-outline-variant/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer bg-surface-container-lowest">
          <h2 className="text-xl font-bold text-on-surface mb-2">Chemistry</h2>
          <p className="text-sm text-secondary">10 chapters • 35 topics</p>
        </div>
        <div className="border border-outline-variant/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer bg-surface-container-lowest">
          <h2 className="text-xl font-bold text-on-surface mb-2">Mathematics</h2>
          <p className="text-sm text-secondary">15 chapters • 60 topics</p>
        </div>
      </div>

      {/* Profile Onboarding Modal overlay for student profile completion */}
      <ProfileCompletionModal isOpen={showOnboarding} />
    </div>
  );
}
