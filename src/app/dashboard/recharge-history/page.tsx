"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  History,
  Search,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  Loader2,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

interface BatchHistoryStructure {
  id: string;
  batchReference: string;
  network: "MTN" | "GLO" | "AIRTEL" | "9MOBILE";
  denomination: number;
  quantity: number;
  totalValue: number;
  status: "success" | "pending" | "failed";
  createdAt: string;
  pins?: {
    id: string;
    pin: string;
    serial: string;
    expiryDate: string;
  }[];
}

export default function RechargeCardHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "pending" | "failed">("all");
  const [selectedBatch, setSelectedBatch] = useState<BatchHistoryStructure | null>(null);
  const [generatedBatches, setGeneratedBatches] = useState<BatchHistoryStructure[]>([]);
  
  // Pagination State Variables
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch initial API history records
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/recharge/history");
        const data = await res.json();
        if (data.success) {
          setGeneratedBatches(data.data);
        }
      } catch (err) {
        console.error("Failed to load historical batch footprints:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Reset pagination indexes whenever filter requirements change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Compute filtering matches
  const filteredBatches = generatedBatches.filter((batch) => {
    const matchesSearch =
      batch.batchReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.network.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || batch.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate pages configuration limits 
  const totalPages = Math.max(1, Math.ceil(filteredBatches.length / ITEMS_PER_PAGE));

  // Segment batches into single pages
  const paginatedBatches = filteredBatches.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Auto-select first batch on active page change
  useEffect(() => {
    if (paginatedBatches.length > 0) {
      setSelectedBatch(paginatedBatches[0]);
    } else {
      setSelectedBatch(null);
    }
  }, [currentPage, filteredBatches.length]);

  const getNetworkBadgeStyles = (network: string) => {
    switch (network?.toUpperCase()) {
      case "MTN": return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "AIRTEL": return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      case "GLO": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "9MOBILE": return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
  return (
    <main className="min-h-screen w-full bg-background text-foreground pb-16">

      {/* HEADER SKELETON */}
      <section className="py-10 px-4 sm:px-8 border-b">
        <div className="max-w-7xl mx-auto space-y-3">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-3 w-96" />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT SIDE TABLE SKELETON */}
        <div className="lg:col-span-8 space-y-4">

          {/* FILTER BAR */}
          <div className="flex gap-3 p-3 border rounded-2xl">
            <Skeleton className="h-10 flex-1 rounded-xl" />
            <Skeleton className="h-10 w-40 rounded-xl" />
          </div>

          {/* TABLE CARD */}
          <div className="border rounded-[24px] p-4 space-y-4">

            {/* TABLE HEADER */}
            <div className="grid grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>

            {/* ROWS */}
            <div className="space-y-3 mt-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-6 gap-4 items-center"
                >
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* PAGINATION */}
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-8 rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE DETAIL PANEL */}
        <div className="lg:col-span-4">
          <div className="border rounded-[28px] p-5 space-y-4">

            <div className="flex justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-16" />
            </div>

            <Skeleton className="h-20 w-full rounded-xl" />

            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>

            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  );
}

  return (
    <main className="min-h-screen w-full bg-background text-foreground pb-16">
      <section className="bg-gradient-to-b from-orange-500/10 via-orange-500/0 to-transparent border-b border-border/40 py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-500 uppercase tracking-wider">
              <History className="w-3.5 h-3.5" />
              Audit Telemetry Nodes
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">E-Pin Printing Registry</h1>
            <p className="text-xs text-muted-foreground">Review, track state contexts, and batch download token sheets generated across distribution nodes.</p>
          </div>
          <Button size="sm" variant="outline" className="text-xs font-bold gap-1.5 rounded-xl h-10 bg-card">
            <Download className="w-3.5 h-3.5" /> Export Spreadsheet
          </Button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-muted/20 border border-border/60 p-3 rounded-2xl">
            <div className="relative w-full sm:flex-1 flex items-center">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5" />
              <Input
                placeholder="Search reference index run..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background border-input pl-10 h-10 rounded-xl text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              {(["all", "success", "pending", "failed"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 h-9 rounded-xl text-xs font-bold capitalize transition-all border shrink-0 ${
                    statusFilter === filter
                      ? "border-orange-500 bg-orange-500/5 ring-1 ring-orange-500 text-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <Card className="rounded-[24px] border border-border/80 overflow-hidden shadow-sm bg-card">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent border-b border-border/60">
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground h-11 px-4">Batch References</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground h-11">Provider</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground h-11">Denom.</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground h-11 text-center">Qty</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground h-11">Total Settlement</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground h-11 text-right px-4">State</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-xs text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                        Pulling network transmission streams...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedBatches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-xs text-muted-foreground italic">No recharge history records found.</TableCell>
                  </TableRow>
                ) : (
                  paginatedBatches.map((batch) => {
                    const isCurrentSelection = selectedBatch?.id === batch.id;
                    return (
                      <TableRow
                        key={batch.id}
                        onClick={() => setSelectedBatch(batch)}
                        className={`cursor-pointer transition-colors border-b border-border/40 ${isCurrentSelection ? "bg-orange-500/5 hover:bg-orange-500/5" : "hover:bg-muted/30"}`}
                      >
                        <TableCell className="font-mono font-bold text-foreground py-3.5 px-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs tracking-wide">{batch.batchReference}</span>
                            <span className="text-[10px] text-muted-foreground font-normal">
                              {new Date(batch.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <span className={`px-2 py-0.5 border text-[10px] font-black rounded-md ${getNetworkBadgeStyles(batch.network)}`}>
                            {batch.network}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold text-xs py-3.5">₦{batch.denomination}</TableCell>
                        <TableCell className="font-mono font-bold text-center text-xs py-3.5">{batch.quantity}</TableCell>
                        <TableCell className="font-mono font-bold text-foreground text-xs py-3.5">₦{batch.totalValue.toLocaleString()}.00</TableCell>
                        <TableCell className="text-right py-3.5 px-4">
                          <div className="inline-flex items-center gap-1">
                            {batch.status === "success" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                            {batch.status === "pending" && <Clock className="w-3.5 h-3.5 text-amber-500" />}
                            {batch.status === "failed" && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                            <span className={`text-[11px] font-bold capitalize ${batch.status === "success" ? "text-emerald-500" : batch.status === "pending" ? "text-amber-500" : "text-red-500"}`}>
                              {batch.status}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>

          {/* Pagination Controls UI Wrapper */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-2">
            <div className="text-xs text-muted-foreground">
              Showing{" "}
              {filteredBatches.length === 0
                ? 0
                : (currentPage - 1) * ITEMS_PER_PAGE + 1}
              -
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredBatches.length)}{" "}
              of {filteredBatches.length} records
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="rounded-xl h-8 text-xs"
              >
                Prev
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  size="sm"
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 p-0 rounded-xl text-xs font-bold ${
                    currentPage === page ? "bg-orange-500 text-white hover:bg-orange-600" : ""
                  }`}
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="rounded-xl h-8 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          {selectedBatch ? (
            <Card className="rounded-[28px] border-2 border-border bg-card shadow-lg overflow-hidden sticky top-6">
              <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-orange-500" /> Batch Manifest Drilldown
                </span>
                <span className="font-mono text-[10px] font-black text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded">
                  {selectedBatch.id}
                </span>
              </div>
              <CardContent className="p-5 space-y-6 text-xs">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Log Allocation Identity</span>
                    <span className="font-mono font-bold text-foreground text-sm tracking-wide">{selectedBatch.batchReference}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Distribution Engine</span>
                    <span className={`px-2 py-0.5 border text-[10px] font-black rounded-md ${getNetworkBadgeStyles(selectedBatch.network)}`}>
                      {selectedBatch.network} PLC
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Face Matrix Denomination</span>
                    <span className="font-semibold text-foreground text-sm">₦{selectedBatch.denomination}.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Bulk Token Quantity</span>
                    <span className="font-mono font-bold text-foreground text-sm">{selectedBatch.quantity} Pins</span>
                  </div>

                  {selectedBatch.pins && selectedBatch.pins.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-border">
                      <h3 className="text-[11px] font-bold uppercase text-muted-foreground">Generated PIN Preview</h3>
                      <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {selectedBatch.pins.map((pin, index) => (
                          <div key={pin.id || index} className="rounded-lg border border-border bg-muted/40 p-2.5 text-[11px] font-mono">
                            <div className="flex justify-between items-center">
                              <span className="text-foreground font-black tracking-wider select-all">{pin.pin}</span>
                              <span className="text-muted-foreground font-semibold">₦{selectedBatch.denomination}</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-muted-foreground/80 mt-1.5 border-t border-border/40 pt-1">
                              <span>S/N: {pin.serial}</span>
                              <span>Exp: {pin.expiryDate}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-dashed border-border pt-3 flex justify-between items-baseline">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ledger Settlement Value:</span>
                    <span className="text-xl font-black text-orange-600 dark:text-orange-500 font-mono tracking-tight">
                      ₦{selectedBatch.totalValue.toLocaleString()}.00
                    </span>
                  </div>
                </div>

                {selectedBatch.status === "success" && (
                  <div className="pt-2 border-t border-border space-y-2">
                    <Button onClick={() => window.print()} className="w-full h-11 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2 text-xs">
                      <Printer className="w-4 h-4" /> Print Voucher Tokens Page
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="border-2 border-dashed border-border/80 rounded-[28px] p-8 text-center bg-muted/5 h-64 flex flex-col items-center justify-center text-xs text-muted-foreground">
              <Sparkles className="w-8 h-8 text-muted-foreground/40 mb-3 stroke-[1.5]" /> Select a batch reference line from the left registry stream to mount core data previews and printing manifests.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}