import NextProtectedRoute from "@/components/layout/NextProtectedRoute";
import NextAdminLayout from "@/components/layout/NextAdminLayout";

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextProtectedRoute>
      <NextAdminLayout>
        {children}
      </NextAdminLayout>
    </NextProtectedRoute>
  );
}
