export interface DashboardStat {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
  color: string;
}

export interface RecentOrder {
  id: string;
  customer: string;
  amount: string;
  status: string;
  date: string;
}

export interface TopProduct {
  name: string;
  sales: number;
  revenue: string;
  initials: string;
}
