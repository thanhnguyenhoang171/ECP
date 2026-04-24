export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Tổng quan</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="text-sm font-medium text-slate-500">Statistic {i}</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">0</div>
          </div>
        ))}
      </div>
    </div>
  );
}
