/*
 * TypeScript contracts for the Sales & Inventory Dashboard API (Section 4 of the build brief).
 *
 * All responses are `application/json` with camelCase property names. All money fields
 * are decimals. All dates are ISO 8601 strings. Nullable fields are marked `| null`
 * exactly as documented in §4.3 and rendered as "—" everywhere.
 */

/* ---------------------------------- Period ---------------------------------- */

/** Valid values for the shared `?period=` query string. */
export type Period =
  | 'today'
  | 'yesterday'
  | 'wtd'
  | 'mtd'
  | 'lastmonth'
  | 'ytd'
  | 'lastyear'
  | 'last12m'
  | 'custom'

/* ------------------------------------ KPI ------------------------------------ */

export interface KpiValues {
  invoiceCount: number
  subTotal: number
  tax: number
  labour: number
  discount: number
  grossSales: number
  netSales: number
  paidAmount: number
  collected: number
  grossProfit: number
  itemsSold: number
  customerCount: number
  outstanding: number
  averageInvoiceValue: number
  marginPercent: number
}

export interface KpiChangePercent {
  netSales: number | null
  grossSales: number | null
  invoiceCount: number | null
  averageInvoice: number | null
  collected: number | null
  outstanding: number | null
  grossProfit: number | null
  itemsSold: number | null
  customerCount: number | null
  tax: number | null
  labour: number | null
  discount: number | null
}

export interface KpiSection {
  from: string
  to: string
  current: KpiValues
  previous: KpiValues
  changePercent: KpiChangePercent
}

/* ------------------------------- Trend series ------------------------------- */

export interface YearlySale {
  year: number
  netSales: number
  collected: number
  invoiceCount: number
}

export interface MonthlySale {
  year: number
  month: number
  /** Pre-formatted axis label, e.g. "Mar 2026". Use it as-is. */
  label: string
  netSales: number
  collected: number
  invoiceCount: number
}

export interface DailySale {
  date: string
  netSales: number
  invoiceCount: number
}

/* --------------------------------- Top lists -------------------------------- */

export interface TopProduct {
  itemId: number | null
  description: string
  brand: string | null
  size: string | null
  series: string | null
  department: string | null
  quantity: number
  revenue: number
  sharePercent: number
  stockOnHand: number
}

export interface TopCustomer {
  phone: string | null
  name: string
  email: string | null
  invoiceCount: number
  revenue: number
  outstanding: number
  lastPurchase: string | null
}

export interface TopOutstandingInvoice {
  invoiceId: number
  invoiceDate: string
  customerName: string
  phone: string | null
  total: number
  paid: number
  due: number
  ageInDays: number
}

export interface RecentInvoice {
  invoiceId: number
  invoiceDate: string
  customerName: string
  phone: string | null
  total: number
  paid: number
  paymentInfo: string | null
  lineCount: number
}

/* ------------------------------- Name / Value ------------------------------- */

export interface NameValue {
  id: number | null
  name: string
  value: number
  count: number
  sharePercent: number
}

/* --------------------------------- Payments --------------------------------- */

export interface PaymentCollectionItem {
  paymentId: number
  paymentName: string
  amount: number
  transactionCount: number
  sharePercent: number
}

/* --------------------------------- Inventory -------------------------------- */

export interface InventorySummary {
  skuCount: number
  totalUnits: number
  stockValueAtCost: number
  outOfStockCount: number
  lowStockCount: number
}

export interface StockItem {
  itemId: number | null
  description: string
  brand: string | null
  size: string | null
  quantity: number
  unitCost: number
  stockValue: number
  lastSoldOn: string | null
  daysSinceLastSale: number | null
}

/* ------------------------------ Lazy collections ---------------------------- */

export interface SalesHeatmapCell {
  dayOfWeek: number
  dayName: string
  hour: number
  netSales: number
  invoiceCount: number
}

export interface CustomerMix {
  newCustomers: number
  returningCustomers: number
  newCustomerRevenue: number
  returningCustomerRevenue: number
}

export interface TirePositions {
  leftFront: number
  rightFront: number
  leftRear: number
  rightRear: number
}

export interface LayawaySummary {
  openCount: number
  openValue: number
  collectedValue: number
  pendingValue: number
}

/* --------------------------------- Overview --------------------------------- */

/** Primary response — thirteen widgets' worth of data in a single call. */
export interface OverviewResponse {
  kpi: KpiSection
  yearlySales: YearlySale[]
  monthlySales: MonthlySale[]
  dailySales: DailySale[]
  topProducts: TopProduct[]
  topCustomers: TopCustomer[]
  paymentCollection: PaymentCollectionItem[]
  salesByDepartment: NameValue[]
  salesByBrand: NameValue[]
  salesByLocation: NameValue[]
  inventory: InventorySummary
  topOutstanding: TopOutstandingInvoice[]
  recentInvoices: RecentInvoice[]
}

/** The shared query string that drives every widget (§2.1). */
export interface DashboardQuery {
  period?: Period
  from?: string
  to?: string
  locationId?: number
}

export type { StockItem as StockItemType }