'use client';

import React from 'react';
import {
  RefreshCcw,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';

import { 
  Button, 
  Badge, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow, 
  PageHeader, 
  StatsCard,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/common';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DashboardStat, RecentOrder, TopProduct } from '@/features/dashboard/types/dashboard.interface';

import { useBackground } from '@/components/providers/BackgroundProvider';
import { cn } from '@/lib/utils';

interface DashboardViewProps {
  stats: DashboardStat[];
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
}

export default function DashboardView({ stats, recentOrders, topProducts }: DashboardViewProps) {
  const { currentBackground } = useBackground();
  
  return (
    <div className='space-y-6'>
      <PageHeader 
        title="Dashboard"
        description="Welcome back! Here's what's happening today."
        actions={
          <>
            <Button variant='outline' size='sm' className={cn('h-9 gap-2', currentBackground ? "bg-white/10 text-white border-white/20 hover:bg-white/20" : "")}>
              <RefreshCcw size={14} />
              Refresh
            </Button>
            <Badge variant='secondary' className={cn('h-9 px-4 text-sm font-medium', currentBackground ? "bg-white/20 text-white" : "")}>
              Today
            </Badge>
          </>
        }
      />

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {stats.map((stat, i) => (
          <div key={i} className={cn("transition-all duration-300", currentBackground ? "liquid-glass p-0 border-none" : "")}>
            <StatsCard 
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              trend={stat.trend}
              color={stat.color}
              className={cn(currentBackground ? "bg-transparent border-none text-white shadow-none" : "")}
            />
          </div>
        ))}
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className={cn('lg:col-span-4 shadow-sm border-slate-100', currentBackground ? "liquid-glass bg-white/10 border-white/10 text-white shadow-2xl" : "shadow-sm border-slate-100")}>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-lg'>Revenue Chart</CardTitle>
                <CardDescription className={cn('text-xs', currentBackground ? "text-white/60" : "text-muted-foreground")}>
                  24% growth vs last week
                </CardDescription>
              </div>
              <TrendingUp className={cn('h-5 w-5 opacity-50', currentBackground ? "text-white" : "text-primary")} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn('h-[250px] w-full rounded-lg border border-dashed flex flex-col items-center justify-center', currentBackground ? "bg-white/5 border-white/20 text-white/40" : "bg-slate-50/50 text-muted-foreground")}>
              <TrendingUp size={40} className='mb-2 opacity-10' />
              <p className='text-xs font-medium'>Optimizing chart visualization...</p>
            </div>
          </CardContent>
        </Card>

        <Card className={cn('lg:col-span-3 shadow-sm border-slate-100', currentBackground ? "liquid-glass bg-white/10 border-white/10 text-white shadow-2xl" : "shadow-sm border-slate-100")}>
          <CardHeader className='pb-4'>
            <CardTitle className='text-lg'>Top Products</CardTitle>
            <CardDescription className={cn('text-xs', currentBackground ? "text-white/60" : "text-muted-foreground")}>
              Best sellers this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              {topProducts.map((product, i) => (
                <div key={i} className='flex items-center'>
                  <Avatar className={cn('h-8 w-8 border', currentBackground ? "border-white/10" : "border-slate-100")}>
                    <AvatarFallback className={cn('font-bold text-[10px]', currentBackground ? "bg-white/10 text-white" : "bg-primary/10 text-primary")}>
                      {product.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className='ml-3 space-y-0.5'>
                    <p className='text-xs font-bold leading-none'>
                      {product.name}
                    </p>
                    <p className={cn('text-[10px]', currentBackground ? "text-white/60" : "text-muted-foreground")}>
                      {product.sales} sales
                    </p>
                  </div>
                  <div className={cn('ml-auto font-bold text-xs', currentBackground ? "text-white" : "text-green-600")}>
                    {product.revenue}
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant='ghost'
              className={cn('w-full mt-6 text-[10px] uppercase tracking-widest font-bold gap-2 h-8', currentBackground ? "text-white hover:bg-white/10" : "text-primary")}>
              All Products <ChevronRight size={12} />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className={cn('shadow-sm overflow-hidden', currentBackground ? "liquid-glass bg-white/10 border-white/10 text-white shadow-2xl" : "shadow-sm border-slate-100")}>
        <CardHeader className={cn('flex flex-row items-center justify-between pb-2', currentBackground ? "bg-white/5" : "bg-slate-50/30")}>
          <div>
            <CardTitle className='text-lg'>Recent Orders</CardTitle>
            <CardDescription className={cn('text-xs', currentBackground ? "text-white/60" : "text-muted-foreground")}>
              Updated 2 mins ago
            </CardDescription>
          </div>
          <Button variant='outline' size='sm' className={cn('h-8 text-xs', currentBackground ? "bg-white/10 text-white border-white/20" : "")}>
            View All
          </Button>
        </CardHeader>
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader className={currentBackground ? "bg-white/5" : "bg-slate-50/50"}>
                <TableRow className={currentBackground ? "border-white/10" : ""}>
                  <TableHead className={cn('text-[10px] font-bold uppercase py-3', currentBackground ? "text-white/40" : "")}>
                    Order ID
                  </TableHead>
                  <TableHead className={cn('text-[10px] font-bold uppercase py-3', currentBackground ? "text-white/40" : "")}>
                    Customer
                  </TableHead>
                  <TableHead className={cn('text-[10px] font-bold uppercase py-3', currentBackground ? "text-white/40" : "")}>
                    Amount
                  </TableHead>
                  <TableHead className={cn('text-[10px] font-bold uppercase py-3', currentBackground ? "text-white/40" : "")}>
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className={cn('transition-colors', currentBackground ? "hover:bg-white/10 border-white/10" : "hover:bg-slate-50/50")}>
                    <TableCell className={cn('text-xs font-bold py-3 px-4', currentBackground ? "text-white" : "text-primary")}>
                      {order.id}
                    </TableCell>
                    <TableCell className='text-xs py-3'>
                      {order.customer}
                    </TableCell>
                    <TableCell className='text-xs font-medium py-3'>
                      {order.amount}
                    </TableCell>
                    <TableCell className='py-3'>
                      <Badge
                        className={cn('text-[9px] h-5 px-2', currentBackground ? "bg-white/20 text-white border-none" : "")}
                        variant={
                          order.status === 'Completed'
                            ? 'default'
                            : order.status === 'Pending'
                              ? 'outline'
                              : 'secondary'
                        }>
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
