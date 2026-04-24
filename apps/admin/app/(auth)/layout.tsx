export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">ECP ADMIN</h1>
          <p className="text-slate-500 mt-2">Hệ thống quản trị thương mại điện tử</p>
        </div>
        {children}
      </div>
    </div>
  );
}
