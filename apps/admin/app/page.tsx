import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
  
  // Fallback UI trong trường hợp redirect chậm
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-sm font-bold text-blue-600 animate-pulse italic">Đang nạp hệ thống Admin...</p>
      </div>
    </div>
  );
}
