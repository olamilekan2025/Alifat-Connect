"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  MapPin,
  Smartphone,
  CheckCircle2,
  XCircle,
  ChevronDown,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSecurity } from "../../../../hooks/use-security";

export function AuditLogs() {
  const { data, loading, error } = useSecurity();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (loading) {
    return (
      <Card className="rounded-3xl p-8">
        Loading audit logs...
      </Card>
    );
  }

  if (error) {
    return <Card className="rounded-3xl p-8 text-red-500">{error}</Card>;
  }

  if (!data) return null;

  const loginHistory = data.loginHistory || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="rounded-3xl border bg-white shadow-2xl backdrop-blur-xl dark:border-white/20 dark:bg-black">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Audit Logs</CardTitle>

            <p className="mt-2 text-sm text-muted-foreground">
              Recent administrator login attempts and activities.
            </p>
          </div>

          <Badge className="gap-1 bg-indigo-500">
            <FileText className="h-4 w-4" />
            {loginHistory.length} Entries
          </Badge>
        </CardHeader>

        <CardContent className="space-y-3">
          {loginHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No login history available
            </div>
          ) : (
            loginHistory.map((log: any) => (
              <motion.div
                key={log._id || log.id || Math.random()}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl border bg-background/60 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-2 ${
                      log.success 
                        ? "bg-green-100 dark:bg-green-900/30" 
                        : "bg-red-100 dark:bg-red-900/30"
                    }`}>
                      {log.success ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {log.success ? "Successful Login" : "Failed Login Attempt"}
                        </span>
                        <Badge variant={log.success ? "default" : "destructive"} className="text-xs">
                          {log.success ? "Success" : "Failed"}
                        </Badge>
                      </div>

                      <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(log.createdAt)}
                        </div>

                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {log.ip || "Unknown IP"}
                        </div>

                        <div className="flex items-center gap-1">
                          <Smartphone className="h-3 w-3" />
                          {log.device || "Unknown Device"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded(expanded === (log._id || log.id) ? null : (log._id || log.id))}
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expanded === (log._id || log.id) ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </div>

                {expanded === (log._id || log.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-4 border-t text-sm"
                  >
                    <div className="grid gap-2 text-muted-foreground">
                      <div>
                        <span className="font-medium">User Agent:</span>
                        <p className="break-all mt-1">{log.userAgent || "N/A"}</p>
                      </div>
                      <div>
                        <span className="font-medium">Admin ID:</span>
                        <p className="mt-1">{log.adminId || "N/A"}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))
          )}

          {loginHistory.length > 0 && (
            <div className="pt-4 text-center">
              <Button variant="outline" size="sm">
                View Full History
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
