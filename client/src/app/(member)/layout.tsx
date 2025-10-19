import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Member Dashboard | Epoch",
  description: "Manage your projects and tasks",
};

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
