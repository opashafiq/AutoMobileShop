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
  companyName: string
}
