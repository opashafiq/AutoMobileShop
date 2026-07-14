// Invoice Master DTOs — matching the .NET backend at /api/InvoiceMaster
// These types are shared between the list datatable and the create/edit form.

export interface InvoiceMasterDto {
  id: number
  tbim_InvoiceIdRad: number
  tbim_Phone: string
  tbim_InvDate: string
  tbim_Name: string
  tbim_TaxId: number | null
  tbim_VehicleMake: string
  tbim_Model: string
  tbim_Year: string
  tbim_Odometer: string
  tbim_TreadDepth: string
  tbim_License: string
  tbim_SubTotal: number
  tbim_SaleTax: number
  tbim_Labour: number
  tbim_DisPer: number
  tbim_DisAmt: number
  tbim_Total: number
  tbim_PaidAmt: number
  tbim_AdjAmt: number
  tbim_AdjTotal: number
  tbim_PayInfo: string // 'F' = Full, 'P' = Partial, 'L' = Pending
  tbim_Note: string
  tbim_Delinfo: string
  tbim_CompanyName: string
  tbim_CompanyAddress: string
  tbim_Item_Delete_after_Invoice_Create: boolean
  tbim_LaywayNo: number
  tbim_LaywayDate: string
  userName: string
  setDate: string
  tbim_Left_Front: boolean
  tbim_Right_Front: boolean
  tbim_Left_Rear: boolean
  tbim_Right_Rear: boolean
  tbim_EmailAddress: string
  tbim_IDNo: string
  tbim_RefundType: string
  tbim_LocationDetailsId: number
  locationName: string
  taxCompanyName: string
  taxIdentificationNumber: string
  taxAddress: string
  taxPhone: string
  paymentMethodName: string
  refundAmount: number
  layawayRefund: LayawayRefundDto[]
}

export interface InvoiceDetailsDto {
  id: number
  tbid_InvoiceId: number
  tbid_ItemId: number | null
  tbid_ItemCategory: number
  tbid_DepartmentName: string
  tbid_Size: string
  tbid_Brand: string
  tbid_Series: string
  tbid_Bolt: string
  tbid_HoleS: string
  tbid_Zone: string
  tbid_DistributorId: number | null
  tbid_DistributorName: string
  tbid_Qty: number
  tbid_Taxable: boolean
  tbid_UnitPrice: number
  tbid_LineTotal: number
  tbid_TaxAmt: number
  itemDepartmentName: string
  itemDistributorName: string
  itemLocationName: string
  itemDisplay: string
}

export interface InvoicePaymentsDto {
  id: number
  tbip_InvoiceId: number
  tbip_PaymentId: number
  tbip_PayAmt: number
  tbip_Date: string
  tbip_PaymentType: string
  tbip_LayawayId: number
  tdip_fromlayaway: string
  tbip_LayawayDate: string
  paymentName: string
}

export interface LayawayRefundDto {
  id: number
  tbip_InvoiceId: number
  tbip_PaymentId: number
  tbip_PayAmt: number
  tbip_Date: string
  tbip_PaymentType: string
  tbip_LayawayId: number
  tdip_fromlayaway: string
  tbip_LayawayDate: string
  paymentName: string
}

// Reference data types (from supporting endpoints)

export interface TaxIdType {
  id: number
  tbti_ComName: string
  tbti_TaxNumber: string
  tbti_Address: string
  tbti_Phone: string
  userName: string
  setDate: string
}

export interface PaymentNameType {
  id: number
  tbpn_PaymentName: string
  tbpn_IsActive: boolean
  userName: string
  setDate: string
}

export interface TaxRateModifiedType {
  id: number
  tbtm_TaxRate: number
  tbtm_Note: string
  userName: string
  setDate: string
}

// Re-export the item-master type so the invoice module has a single import surface
export type { ItemMasterType } from '@/app/models/interfaces'

// Request payload for create/edit
export interface InvoiceCreateRequest {
  invoiceMasterDto: InvoiceMasterDto
  invoiceDetailsDto: InvoiceDetailsDto[]
  invoicePaymentsDto: InvoicePaymentsDto[]
}

// Response from list endpoint (server-side paginated)
export interface InvoiceListResponseItem {
  invoiceMasterDto: InvoiceMasterDto
  invoiceDetailsDto: InvoiceDetailsDto[]
  invoicePaymentsDto: InvoicePaymentsDto[]
}

export interface InvoiceListResponse {
  items: InvoiceListResponseItem[]
  totalCount: number
  pageNumber: number
  totalPages: number
}
