import React from "react";
export const dynamic = "force-dynamic";

const StudentDashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div>{children}</div>;
};

export default StudentDashboardLayout;
