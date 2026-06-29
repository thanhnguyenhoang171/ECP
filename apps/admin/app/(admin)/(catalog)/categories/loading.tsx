import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common";

export default function Loading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Skeleton matches PageHeader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="space-y-1">
          <Skeleton className="h-10 w-64" /> {/* Title */}
          <Skeleton className="h-4 w-80" /> {/* Description */}
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" /> {/* Import */}
          <Skeleton className="h-9 w-24 rounded-lg" /> {/* Export */}
          <Skeleton className="h-9 w-32 rounded-lg" /> {/* Add New */}
        </div>
      </div>

      {/* DataCard Skeleton */}
      <Card className="overflow-hidden shadow-sm border-slate-900">
        <CardHeader className="pb-4 bg-slate-50/50 border-b border-slate-900">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <Skeleton className="h-10 w-full rounded-lg" /> {/* Search Input */}
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-24 rounded-lg" /> {/* Filter */}
              <Skeleton className="h-10 w-24 rounded-lg" /> {/* Sort */}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="pl-6 py-4"><Skeleton className="h-4 w-24" /></TableHead>
                  <TableHead className="py-4 text-center"><Skeleton className="h-4 w-16 mx-auto" /></TableHead>
                  <TableHead className="py-4 text-center"><Skeleton className="h-4 w-16 mx-auto" /></TableHead>
                  <TableHead className="py-4 text-center"><Skeleton className="h-4 w-20 mx-auto" /></TableHead>
                  <TableHead className="py-4 text-center"><Skeleton className="h-4 w-20 mx-auto" /></TableHead>
                  <TableHead className="pr-6 py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-b border-slate-50 even:bg-slate-100/40">
                    <TableCell className="pl-6 py-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-5 w-16 mx-auto rounded-full" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-5 w-20 mx-auto rounded-full" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </TableCell>
                    <TableCell className="pr-6 py-4">
                      <div className="flex justify-end gap-1">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="border-t border-slate-900 bg-slate-50/30 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
