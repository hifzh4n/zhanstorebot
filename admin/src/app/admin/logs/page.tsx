"use client";

import {Card} from "@/components/ui/card";
import {useAdminLogs} from "@/hooks/use-admin-logs";
import {formatDate} from "@/lib/utils";

export default function LogsPage() {
  const {logs, loading, error} = useAdminLogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin Logs</h1>
        <p className="text-sm text-[var(--muted)]">Recent admin actions and system decisions.</p>
      </div>
      <Card className="overflow-hidden p-0">
        {loading ? (
          <p className="p-5 text-sm text-[var(--muted)]">Loading logs...</p>
        ) : error ? (
          <p className="p-5 text-sm text-red-600 dark:text-red-300">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-[#eef3f6] text-left text-[#263244] dark:bg-[#1f2937] dark:text-[#e7eaee]">
                <tr>
                  <th className="p-3">Action</th>
                  <th className="p-3">Message</th>
                  <th className="p-3">Order</th>
                  <th className="p-3">Admin</th>
                  <th className="p-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={`${log.logId}-${index}`} className="border-t border-[var(--border)]">
                    <td className="p-3 font-medium">{log.action}</td>
                    <td className="p-3 text-[var(--muted)]">{log.message}</td>
                    <td className="p-3">{log.orderId ?? "-"}</td>
                    <td className="p-3">{log.adminEmail}</td>
                    <td className="p-3">{formatDate(log.createdAt)}</td>
                  </tr>
                ))}
                {!logs.length ? (
                  <tr>
                    <td className="p-6 text-center text-[var(--muted)]" colSpan={5}>No logs found.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
