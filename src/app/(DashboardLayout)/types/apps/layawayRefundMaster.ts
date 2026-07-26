// Layaway Refund Master DTOs — matching the .NET backend at /api/LayawayRefundMaster
// These types are shared between the list datatable and the create/edit form.
//
// The LayawayRefundMasterDto is deliberately denormalized: it carries a full
// snapshot of the source LayawayMaster (the `layaway_tbim_*` fields) so a refund
// record is self-contained even if the source layaway later changes.

export interface LayawayRefundMasterDto {
  id: number
  tbirm_LayawayRefundIdRad: number
  tbirm_LayawayRefundDate: string
  tbirm_RefundType: string // 'F' = Full, 'P' = Partial
  tbirm_SubTotal: number
  tbirm_SaleTax: number
  tbirm_Labour: number
  tbirm_DisPer: number
  tbirm_DisAmt: number
  tbirm_Total: number
  tbirm_RefundAmt: number
  tbirm_AdjAmt: number
  tbirm_Note: string
  tbirm_Delinfo: string
  tbirm_Item_Delete_after_Layaway_Refund_Create: boolean
  userName: string
  setDate: string
  // --- Denormalized source layaway snapshot ---
  layaway_tbim_InvoiceId: number
  layaway_tbim_InvoiceIdRad: number
  layaway_tbim_Phone: string
  layaway_tbim_InvDate: string
  layaway_tbim_Name: string
  layaway_tbim_TaxId: number | null
  layaway_tbim_VehicleMake: string
  layaway_tbim_Model: string
  layaway_tbim_Year: string
  layaway_tbim_Odometer: string
  layaway_tbim_TreadDepth: string
  layaway_tbim_License: string
  layaway_tbim_SubTotal: number
  layaway_tbim_SaleTax: number
  layaway_tbim_Labour: number
  layaway_tbim_DisPer: number
  layaway_tbim_DisAmt: number
  layaway_tbim_Total: number
  layaway_tbim_PaidAmt: number
  layaway_tbim_AdjAmt: number
  layaway_tbim_AdjTotal: number
  layaway_tbim_PayInfo: string
  layaway_tbim_Note: string
  layaway_tbim_Delinfo: string
  layaway_tbim_CompanyName: string
  layaway_tbim_CompanyAddress: string
  layaway_tbim_Item_Delete_after_Layaway_Create: boolean
  layaway_tbim_Left_Front: boolean
  layaway_tbim_Right_Front: boolean
  layaway_tbim_Left_Rear: boolean
  layaway_tbim_Right_Rear: boolean
  layaway_tbim_EmailAddress: string
  layaway_tbim_IDNo: string
  originalLayawayName: string
  originalLayawayDate: string
  tbim_InvoiceIdRad: number
  tbim_Phone: string
}

export interface LayawayRefundDetailsDto {
  id: number
  tbird_Layaway_RefundId: number
  tbird_ItemId: number
  tbird_ItemCategory: number
  tbird_DepartmentName: string
  tbird_Size: string
  tbird_Brand: string
  tbird_Series: string
  tbird_Bolt: string
  tbird_HoleS: string
  tbird_Zone: string
  tbird_DistributorId: number
  tbird_DistributorName: string
  // Refund quantity being returned (user-entered, ≤ original layaway qty)
  tbird_Qty: number
  // Snapshot of the original layaway line values
  tbird_Layaway_Qty: number
  tbird_Layaway_Qty_LineTotal: number
  tbird_Layaway_Qty_TaxAmt: number
  tbird_Taxable: boolean
  tbird_UnitPrice: number
  // Recomputed on the frontend from refund qty
  tbird_LineTotal: number
  // Effective tax rate (derived from the original layaway line, fallback to default)
  tbird_TaxRate: number
  tbird_TaxAmt: number
  itemDepartmentName: string
  itemDistributorName: string
  itemLocationName: string
  itemDisplay: string
}

export interface LayawayRefundPaymentsDto {
  id: number
  tbirp_Layaway_RefundId: number
  tbirp_RefundMethodId: number
  tbirp_RefundAmt: number
  tbirp_Date: string
  refundMethodName: string
}

// Refund method name (from /api/RefundMethodNames) — re-exported for convenience
export type { RefundMethodNameType } from './refundMaster'

// Request payload for create refund
export interface CreateLayawayRefundRequest {
  layawayRefundMasterDto: LayawayRefundMasterDto
  layawayRefundDetailsDto: LayawayRefundDetailsDto[]
  layawayRefundPaymentsDto: LayawayRefundPaymentsDto[]
}

// Response from list endpoint (server-side paginated)
export interface LayawayRefundListResponseItem {
  layawayRefundMasterDto: LayawayRefundMasterDto
  layawayRefundDetailsDto: LayawayRefundDetailsDto[]
  layawayRefundPaymentsDto: LayawayRefundPaymentsDto[]
}

export interface LayawayRefundListResponse {
  items: LayawayRefundListResponseItem[]
  totalCount: number
  pageNumber: number
  totalPages: number
}

// Draft line item for the refund builder (adds refundQty for partial returns).
// tbird_LineTotal and tbird_TaxAmt are recomputed from refundQty live, so they
// are included here as the computed values rather than the API contract values.
export type DraftLayawayRefundDetail = Omit<LayawayRefundDetailsDto, 'tbird_LineTotal' | 'tbird_TaxAmt'> & {
  refundQty: number
  originalQty: number
  tbird_LineTotal: number
  tbird_TaxAmt: number
}

// Response from the edit endpoint
export interface EditLayawayRefundResponse {
  message: string
  RefundId: number
}