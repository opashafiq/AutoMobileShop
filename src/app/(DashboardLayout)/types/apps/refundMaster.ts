// Invoice Refund Master DTOs — matching the .NET backend at /api/InvoiceRefundMaster
// These types are shared between the list datatable and the create/edit form.

export interface InvoiceRefundMasterDto {
  id: number
  tbirm_InvoiceRefundIdRad: number
  tbirm_InvRefundDate: string
  tbirm_RefundType: string // 'F' = Full, 'P' = Partial
  tbirm_InvoiceId: number
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
  tbirm_Item_Delete_after_Invoice_Refund_Create: boolean
  userName: string
  setDate: string
  originalInvoiceName: string
  originalInvoiceDate: string
  tbim_InvoiceIdRad: number
  tbim_Phone: string
}

export interface InvoiceRefundDetailsDto {
  id: number
  tbird_InvoiceRefundId: number
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
  tbird_Qty: number
  tbird_Taxable: boolean
  tbird_UnitPrice: number
  tbird_LineTotal: number
  tbird_TaxAmt: number
  itemDepartmentName: string
  itemDistributorName: string
  itemLocationName: string
  itemDisplay: string
}

export interface InvoiceRefundPaymentsDto {
  id: number
  tbirp_InvoiceRefundId: number
  tbirp_RefundMethodId: number
  tbirp_RefundAmt: number
  tbirp_Date: string
  refundMethodName: string
}

// Refund method name (from /api/RefundMethodNames)
export interface RefundMethodNameType {
  id: number
  tbrmn_RefundMethodName: string
  tbrmn_IsActive: boolean
  userName: string
  setDate: string
}

// Request payload for create refund
export interface CreateRefundRequest {
  invoiceRefundMasterDto: InvoiceRefundMasterDto
  invoiceRefundDetailsDto: InvoiceRefundDetailsDto[]
  invoiceRefundPaymentsDto: InvoiceRefundPaymentsDto[]
}

// Response from list endpoint (server-side paginated)
export interface RefundListResponseItem {
  invoiceRefundMasterDto: InvoiceRefundMasterDto
  invoiceRefundDetailsDto: InvoiceRefundDetailsDto[]
  invoiceRefundPaymentsDto: InvoiceRefundPaymentsDto[]
}

export interface RefundListResponse {
  items: RefundListResponseItem[]
  totalCount: number
  pageNumber: number
  totalPages: number
}

// Draft line item for the refund builder (adds refundQty + taxRate for partial returns).
// LineTotal and TaxAmt are omitted because they are recomputed from refundQty live.
export type DraftRefundDetail = Omit<InvoiceRefundDetailsDto, 'tbird_LineTotal' | 'tbird_TaxAmt'> & {
  refundQty: number
  originalQty: number
  taxRate: number
  tbird_LineTotal: number
  tbird_TaxAmt: number
}

// Response from the edit endpoint
export interface EditRefundResponse {
  message: string
  RefundId: number
}
