/*
 * Typed API client for the Sales & Inventory Dashboard (§5.1).
 *
 * The dashboard backend is an external ASP.NET Core Web API configured through
 * NEXT_PUBLIC_API_BASE_URL (default https://localhost:44352). All fetch logic
 * lives here — no `fetch` calls in components.
 *
 * Every request attaches `Authorization: Bearer <token>` from localStorage
 * (`NEXT_AUTH_TOKEN`). On a 401 the session is cleared and the user is sent to
 * the login page rather than shown an error card.
 */

import { getApiUrl } from '@/app/api/globalFetcher'
import { clearToken } from '@/app/api/auth'
import type {
  CustomerMix,
  DashboardQuery,
  InventorySummary,
  KpiSection,
  LayawaySummary,
  NameValue,
  OverviewResponse,
  PaymentCollectionItem,
  Period,
  SalesHeatmapCell,
  StockItem,
  TirePositions,
  TopCustomer,
  TopOutstandingInvoice,
  TopProduct,
  YearlySale,
  MonthlySale,
  DailySale,
  RecentInvoice,
} from './types'

const LOGIN_PATH = '/auth/auth1/login'

export interface ApiError extends Error {
  status: number
  serverMessage: string
}

/** Serialisable query params (undefined / null are omitted from the URL). */
export type QueryParams = Record<string, string | number | boolean | null | undefined>

function buildUrl(path: string, params?: QueryParams): string {
  const url = getApiUrl(path)
  const search = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        search.set(key, String(value))
      }
    })
  }
  const qs = search.toString()
  return qs ? `${url}?${qs}` : url
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('NEXT_AUTH_TOKEN')
    if (token) headers.Authorization = `Bearer ${token}`
  }
  return headers
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const text = await res.text()
    if (!text) return ''
    try {
      const parsed = JSON.parse(text)
      return (
        parsed?.msg ||
        parsed?.message ||
        parsed?.detail ||
        parsed?.error?.message ||
        parsed?.error ||
        parsed?.title ||
        (typeof parsed === 'string' ? parsed : '') ||
        ''
      )
    } catch {
      return text
    }
  } catch {
    return ''
  }
}

/** Clears the session and sends the user to the login page. */
function handleUnauthorized(): never {
  clearToken()
  if (typeof window !== 'undefined') {
    // Full navigation so the DashboardLayout auth guard picks it up cleanly.
    window.location.replace(LOGIN_PATH)
  }
  throw Object.assign(new Error('Session expired — please log in again.'), {
    status: 401,
    serverMessage: 'Unauthorized',
  } satisfies ApiError)
}

interface RequestOptions {
  params?: QueryParams
  signal?: AbortSignal
}

async function request<T>(path: string, options?: RequestOptions): Promise<T> {
  const res = await fetch(buildUrl(path, options?.params), {
    method: 'GET',
    headers: buildHeaders(),
    signal: options?.signal,
  })

  if (res.status === 401) {
    handleUnauthorized()
  }
  if (!res.ok) {
    const serverMessage = await readErrorMessage(res)
    const err = Object.assign(
      new Error(
        serverMessage
          ? `Server error ${res.status}: ${serverMessage}`
          : `Failed to load data (HTTP ${res.status}: ${res.statusText})`,
      ),
      { status: res.status, serverMessage } satisfies ApiError,
    )
    throw err
  }

  const text = await res.text()
  return (text ? JSON.parse(text) : {}) as T
}

/* ------------------------------ Endpoint methods ----------------------------- */

/**
 * Builds the single shared query string from §2.1.
 * When `period` is anything other than `custom`, `from`/`to` are never sent.
 */
export function sharedQuery(params: {
  period: Period
  from?: string
  to?: string
  locationId?: number | null
}): QueryParams {
  const q: QueryParams = { period: params.period }
  if (params.period === 'custom') {
    if (params.from) q.from = params.from
    if (params.to) q.to = params.to
  }
  if (params.locationId != null) q.locationId = params.locationId
  return q
}

export const dashboardApi = {
  // The primary call — thirteen widgets' worth of data in a single response.
  getOverview: (q: DashboardQuery, signal?: AbortSignal) =>
    request<OverviewResponse>('/api/dashboard/overview', {
      params: sharedQuery(q),
      signal,
    }),

  getKpi: (q: DashboardQuery, signal?: AbortSignal) =>
    request<KpiSection>('/api/dashboard/kpi', { params: sharedQuery(q), signal }),

  getYearlySales: (
    params: { years?: number; locationId?: number | null },
    signal?: AbortSignal,
  ) =>
    request<YearlySale[]>('/api/dashboard/sales/yearly', {
      params: { years: params.years ?? 5, locationId: params.locationId ?? undefined },
      signal,
    }),

  getMonthlySales: (
    params: { months?: number; locationId?: number | null },
    signal?: AbortSignal,
  ) =>
    request<MonthlySale[]>('/api/dashboard/sales/monthly', {
      params: { months: params.months ?? 12, locationId: params.locationId ?? undefined },
      signal,
    }),

  getDailySales: (q: DashboardQuery, signal?: AbortSignal) =>
    request<DailySale[]>('/api/dashboard/sales/daily', { params: sharedQuery(q), signal }),

  getSalesHeatmap: (q: DashboardQuery, signal?: AbortSignal) =>
    request<SalesHeatmapCell[]>('/api/dashboard/sales/heatmap', {
      params: sharedQuery(q),
      signal,
    }),

  getPaymentCollection: (q: DashboardQuery, signal?: AbortSignal) =>
    request<PaymentCollectionItem[]>('/api/dashboard/collection/by-payment-method', {
      params: sharedQuery(q),
      signal,
    }),

  getLayawaySummary: (q: DashboardQuery, signal?: AbortSignal) =>
    request<LayawaySummary>('/api/dashboard/layaway/summary', {
      params: sharedQuery(q),
      signal,
    }),

  getTopProductsByValue: (q: DashboardQuery, params: { top?: number } = {}, signal?: AbortSignal) =>
    request<TopProduct[]>('/api/dashboard/products/top-by-value', {
      params: { ...sharedQuery(q), top: params.top ?? 10 },
      signal,
    }),

  getTopProductsByQuantity: (q: DashboardQuery, params: { top?: number } = {}, signal?: AbortSignal) =>
    request<TopProduct[]>('/api/dashboard/products/top-by-quantity', {
      params: { ...sharedQuery(q), top: params.top ?? 10 },
      signal,
    }),

  getSalesByDepartment: (q: DashboardQuery, signal?: AbortSignal) =>
    request<NameValue[]>('/api/dashboard/sales/by-department', {
      params: sharedQuery(q),
      signal,
    }),

  getSalesByBrand: (q: DashboardQuery, params: { top?: number } = {}, signal?: AbortSignal) =>
    request<NameValue[]>('/api/dashboard/sales/by-brand', {
      params: { ...sharedQuery(q), top: params.top ?? 10 },
      signal,
    }),

  getSalesByDistributor: (q: DashboardQuery, params: { top?: number } = {}, signal?: AbortSignal) =>
    request<NameValue[]>('/api/dashboard/sales/by-distributor', {
      params: { ...sharedQuery(q), top: params.top ?? 10 },
      signal,
    }),

  getTopCustomers: (q: DashboardQuery, params: { top?: number } = {}, signal?: AbortSignal) =>
    request<TopCustomer[]>('/api/dashboard/customers/top', {
      params: { ...sharedQuery(q), top: params.top ?? 10 },
      signal,
    }),

  getCustomersMix: (q: DashboardQuery, signal?: AbortSignal) =>
    request<CustomerMix>('/api/dashboard/customers/mix', {
      params: sharedQuery(q),
      signal,
    }),

  getTopVehicleMakes: (q: DashboardQuery, params: { top?: number } = {}, signal?: AbortSignal) =>
    request<NameValue[]>('/api/dashboard/vehicles/top-makes', {
      params: { ...sharedQuery(q), top: params.top ?? 10 },
      signal,
    }),

  getTirePositions: (q: DashboardQuery, signal?: AbortSignal) =>
    request<TirePositions>('/api/dashboard/vehicles/tire-positions', {
      params: sharedQuery(q),
      signal,
    }),

  // Never receives a locationId — always compares all branches.
  getSalesByLocation: (q: DashboardQuery, signal?: AbortSignal) =>
    request<NameValue[]>('/api/dashboard/sales/by-location', {
      params: { period: q.period, from: q.from, to: q.to },
      signal,
    }),

  getTopOutstandingInvoices: (q: DashboardQuery, params: { top?: number } = {}, signal?: AbortSignal) =>
    request<TopOutstandingInvoice[]>('/api/dashboard/invoices/top-outstanding', {
      params: { ...sharedQuery(q), top: params.top ?? 10 },
      signal,
    }),

  getRecentInvoices: (
    params: { top?: number; locationId?: number | null },
    signal?: AbortSignal,
  ) =>
    request<RecentInvoice[]>('/api/dashboard/invoices/recent', {
      params: { top: params.top ?? 10, locationId: params.locationId ?? undefined },
      signal,
    }),

  getInventorySummary: (
    params: { locationId?: number | null; lowStockThreshold?: number },
    signal?: AbortSignal,
  ) =>
    request<InventorySummary>('/api/dashboard/inventory/summary', {
      params: {
        locationId: params.locationId ?? undefined,
        lowStockThreshold: params.lowStockThreshold ?? 4,
      },
      signal,
    }),

  getLowStock: (
    params: { threshold?: number; top?: number; locationId?: number | null },
    signal?: AbortSignal,
  ) =>
    request<StockItem[]>('/api/dashboard/inventory/low-stock', {
      params: {
        threshold: params.threshold ?? 4,
        top: params.top ?? 20,
        locationId: params.locationId ?? undefined,
      },
      signal,
    }),

  getDeadStock: (
    params: { days?: number; top?: number; locationId?: number | null },
    signal?: AbortSignal,
  ) =>
    request<StockItem[]>('/api/dashboard/inventory/dead-stock', {
      params: {
        days: params.days ?? 180,
        top: params.top ?? 20,
        locationId: params.locationId ?? undefined,
      },
      signal,
    }),
}

export default dashboardApi
export type {
  DashboardQuery,
  InventorySummary,
  KpiSection,
  LayawaySummary,
  NameValue,
  OverviewResponse,
  PaymentCollectionItem,
  RecentInvoice,
  SalesHeatmapCell,
  StockItem,
  TirePositions,
  TopCustomer,
  TopOutstandingInvoice,
  TopProduct,
}