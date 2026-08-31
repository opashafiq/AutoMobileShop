import type { Metadata } from "next";
import { Suspense } from "react";

import SalesDashboard from "@/app/components/dashboards/sales-analytics/sales-dashboard";
import "@/app/components/dashboards/sales-analytics/sales-dashboard.css";

export const metadata: Metadata = {
  title: "Sales & Inventory Analytics",
  description:
    "Sales, payments, invoices and inventory analytics across all branches — every figure live from the shop API.",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          Loading sales analytics…
        </div>
      }
    >
      <SalesDashboard />
    </Suspense>
  );
}