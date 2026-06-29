export interface TaxType {
  id: number
  tbti_ComName: string
  tbti_TaxNumber: string
  tbti_Address: string
  tbti_Phone: string
  userName: string
  setDate: string
}

export interface DailyExpenseType {
  id: number
  expenseHeadId: number
  expenseDate: string
  amount: number
  checkNo: string
  payType: string
  userName: string
  setDate: string | null
  locationDetailsId: number
  expenseHeadName: string
  locationDetailsName: string
}

export interface ExpenseHeadType {
  id: number
  tbeh_HeadName: string
  userName: string
  setDate: string
}

export interface DistributorType {
  id: number
  name: string
  address: string
  userName: string
  setDate: string
}

export interface ApplicationUserType {
  id: string
  userName: string
  firstName: string
  lastName: string
  isActive: boolean
  locationId: number
  locationName: string
  email: string
  roles: string[]
}

export interface RoleType {
  id: string
  name: string
  normalizedName: string
  concurrencyStamp: string | null
}

export interface CompanyInfoType {
  id: number
  tbbiBusinessName: string
  tbbi_Address1: string
  tbbi_Address2: string
  tbbi_City: string
  tbbi_State: string
  tbbi_ZipCode: string
  tbbi_Country: string
  tbbi_Phone: string
  tbbi_Fax: string
  tbbi_Email: string
  tbbi_Logo: string
  userName: string
  setDate: string
}

export interface DepartmentType {
  id: number
  tbid_DepartmentName: string
  tbid_IsActive: boolean
  userName: string
  setDate: string
}

export interface LocationDetailsType {
  id: number
  tbld_LocationName: string
  companyInfoId: number
  tbld_Address1: string
  tbld_Address2: string
  tbld_City: string | null
  tbld_State: string | null
  tbld_ZipCode: string | null
  tbld_Phone: string | null
  tbld_Fax: string | null
  tbld_Email: string | null
  userName: string
  setDate: string
  companyName: string
}

export interface ItemMasterType {
  id: number
  tbim_ItemCategoryId: number
  tbim_Size: string
  tbim_Brand: string
  tbim_Series: string
  tbim_Bolt: string
  tbim_HoleS: string
  tbim_Zone: string
  tbim_Qty: number
  tbim_QtyOp: number
  tbim_Code: number
  tbim_CodeTOT: number
  tbim_DistributorId: number
  tbim_OURP: number
  tbim_LocationId: number
  tbim_ThrashDate: string | null
  userName: string
  setDate: string
  departmentName: string
  distributorName: string
  locationName: string
}

export interface RefundMethodNameType {
  id: number
  tbrmn_RefundMethodName: string
  tbrmn_IsActive: boolean
  userName: string
  setDate: string
}

export interface TaxRateModifiedType {
  id: number
  tbtm_Note: string
  userName: string
  setDate: string
}
