import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Premium Digital Products",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[90rem] mx-auto py-12 px-6 lg:px-12 w-full">
        {children}
      </div>
    </div>
  );
}
