import {cn} from "@/lib/utils";

const colors: Record<string, string> = {
  WAITING_ADMIN_APPROVAL: "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-200",
  PAYMENT_APPROVED: "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200",
  PAYMENT_REJECTED: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200",
  WAITING_OTP: "bg-purple-100 text-purple-900 dark:bg-purple-900/40 dark:text-purple-200",
  OTP_RECEIVED: "bg-indigo-100 text-indigo-900 dark:bg-indigo-900/40 dark:text-indigo-200",
  COMPLETED: "bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-200",
  AUTO_COMPLETED: "bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-200",
  FAILED: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200",
  CANCELLED: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
};

export function OrderStatusBadge({status}: {status: string}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        colors[status] ?? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
      )}
    >
      {status}
    </span>
  );
}
