'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Icon } from '@iconify/react'
import { toast, ToastContainer } from 'react-toastify'

import { getApiUrl, getFetcher, postFetcher } from '@/app/api/globalFetcher'
import { getUserName } from '@/app/api/auth'
import { getLocalISO } from '@/lib/time'
import {
  type InvoiceMasterDto,
  type InvoiceDetailsDto,
  type InvoicePaymentsDto,
  type LayawayRefundDto,
  type TaxIdType,
  type PaymentNameType,
  type ItemMasterType,
  type InvoiceListResponseItem,
  type TaxRateModifiedType,
} from '@/app/(DashboardLayout)/types/apps/invoiceMaster'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Combobox, type ComboboxOption, type ComboboxHandle } from '../shared/Combobox'
import { useUser } from '@/app/context/UserContext'
import { CarVisual } from './CarVisual'

// Default sales-tax rate used for line-item tax calculation when the backend
// does not expose a per-item rate. Adjust if a /api/TaxRate endpoint is wired.
const DEFAULT_TAX_RATE = 8.25

interface OptionalFormFieldProps {
  label: string
  children: ReactNode
  className?: string
  required?: boolean
}

function Field({ label, children, className, required }: OptionalFormFieldProps) {
  return (
    <div className={className}>
      <Label className='mb-1.5 block text-sm font-medium text-ld dark:text-darklink'>
        {label} {required && <span className='text-error'>*</span>}
      </Label>
      {children}
    </div>
  )
}

const money = (n: number | null | undefined) =>
  (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Round a monetary value to 2 decimal places to avoid floating-point drift. */
const r2 = (n: number) => Math.round(n * 100) / 100

// Build the human-readable item description used throughout the form.
const itemDescription = (d: { tbid_DepartmentName?: string; tbid_Size?: string; tbid_Brand?: string; tbid_Series?: string; tbid_Bolt?: string; tbid_HoleS?: string; tbid_Zone?: string }) =>
  [d.tbid_DepartmentName, d.tbid_Size, d.tbid_Brand, d.tbid_Series, d.tbid_Bolt, d.tbid_HoleS, d.tbid_Zone]
    .filter((v) => v !== null && v !== undefined && String(v).trim() !== '')
    .join(', ')

// ---------- Departments (used by the Category combobox in the Item sheet) ----------
interface DepartmentType {
  id: number
  tbid_DepartmentName: string
  tbid_IsActive: boolean
}

// ---------- Draft line item (local-only "taxRate" for calc) ----------
interface DraftItem extends Omit<InvoiceDetailsDto, 'tbid_LineTotal' | 'tbid_TaxAmt' | 'tbid_InvoiceId'> {
  taxRate: number
}

const emptyDraftItem = (): DraftItem => ({
  id: 0,
  tbid_ItemId: null,
  tbid_ItemCategory: 0,
  tbid_DepartmentName: '',
  tbid_Size: '',
  tbid_Brand: '',
  tbid_Series: '',
  tbid_Bolt: '',
  tbid_HoleS: '',
  tbid_Zone: '',
  tbid_DistributorId: null,
  tbid_DistributorName: '',
  tbid_Qty: 1,
  tbid_Taxable: false,
  tbid_UnitPrice: 0,
  itemDepartmentName: '',
  itemDistributorName: '',
  itemLocationName: '',
  itemDisplay: '',
  taxRate: DEFAULT_TAX_RATE,
})

const computeLineTotal = (price: number, qty: number) => (Number(price) || 0) * (Number(qty) || 0)
const computeTaxAmt = (lineTotal: number, taxable: boolean, taxRate: number) =>
  taxable ? (lineTotal * (Number(taxRate) || 0)) / 100 : 0

// ---------- Empty master (create) ----------
const emptyMaster = (): InvoiceMasterDto => ({
  id: 0,
  tbim_InvoiceIdRad: 0,
  tbim_Phone: '',
  tbim_InvDate: getLocalISO(),
  tbim_Name: '',
  tbim_TaxId: null,
  tbim_VehicleMake: '',
  tbim_Model: '',
  tbim_Year: '',
  tbim_Odometer: '',
  tbim_TreadDepth: '',
  tbim_License: '',
  tbim_SubTotal: 0,
  tbim_SaleTax: 0,
  tbim_Labour: 0,
  tbim_DisPer: 0,
  tbim_DisAmt: 0,
  tbim_Total: 0,
  tbim_PaidAmt: 0,
  tbim_AdjAmt: 0,
  tbim_AdjTotal: 0,
  tbim_PayInfo: 'F',
  tbim_Note: '',
  tbim_Delinfo: 'A',
  tbim_CompanyName: '',
  tbim_CompanyAddress: '',
  tbim_Item_Delete_after_Invoice_Create: true,
  tbim_LaywayNo: 0,
  tbim_LaywayDate: getLocalISO(),
  userName: getUserName() ?? '',
  setDate: getLocalISO(),
  tbim_Left_Front: false,
  tbim_Right_Front: false,
  tbim_Left_Rear: false,
  tbim_Right_Rear: false,
  tbim_EmailAddress: '',
  tbim_IDNo: '',
  tbim_RefundType: 'N',
  tbim_LocationDetailsId: 0,
  locationName: '',
  taxCompanyName: '',
  taxIdentificationNumber: '',
  taxAddress: '',
  taxPhone: '',
  paymentMethodName: '',
  refundAmount: 0,
  layawayRefund: [],
})

interface InvoiceFormProps {
  mode: 'create' | 'edit'
  invoiceId?: string
  /** When present in create mode, pre-fills master data (customer/vehicle/tax info)
   *  from this source invoice but resets date, totals, details and payments. */
  reorderId?: string
}

export default function InvoiceForm({ mode, invoiceId, reorderId }: InvoiceFormProps) {
  const router = useRouter()
  const isEdit = mode === 'edit'
  const isReorder = !isEdit && !!reorderId
  const { locationId } = useUser()

  // ----- Reference data -----
  const { data: taxIdsData } = useSWR<TaxIdType[]>(getApiUrl('/api/TaxId'), getFetcher)
  const { data: itemsData } = useSWR<ItemMasterType[]>(getApiUrl('/api/ItemMaster'), getFetcher)
  const { data: paymentNamesData } = useSWR<PaymentNameType[]>(getApiUrl('/api/PaymentNames'), getFetcher)
  const { data: taxRateData } = useSWR<TaxRateModifiedType | TaxRateModifiedType[]>(getApiUrl('/api/TaxRateModified'), getFetcher)

  // Extract the effective default tax rate from the API, falling back to 8.25.
  // The endpoint may return a single object or an array.
  const effectiveTaxRate = useMemo(() => {
    const raw = taxRateData
    if (!raw) return DEFAULT_TAX_RATE
    if (Array.isArray(raw)) return raw[0]?.tbtm_TaxRate ?? DEFAULT_TAX_RATE
    return (raw as TaxRateModifiedType).tbtm_TaxRate ?? DEFAULT_TAX_RATE
  }, [taxRateData])
  const { data: departmentsData } = useSWR<DepartmentType[]>(getApiUrl('/api/Departments'), getFetcher)

  // ----- Edit-mode fetching -----
  const editUrl = isEdit && invoiceId ? getApiUrl(`/api/InvoiceMaster/${invoiceId}`) : null
  const { data: editData, isLoading: editLoading, mutate: mutateEdit } = useSWR<InvoiceListResponseItem>(editUrl, getFetcher)

  // ----- Reorder fetch (create from existing invoice, master data only) -----
  const reorderUrl = isReorder && reorderId ? getApiUrl(`/api/InvoiceMaster/${reorderId}`) : null
  const { data: reorderData, isLoading: reorderLoading } = useSWR<InvoiceListResponseItem>(reorderUrl, getFetcher)

  // ----- Form state -----
  const [master, setMaster] = useState<InvoiceMasterDto>(emptyMaster)
  const [details, setDetails] = useState<InvoiceDetailsDto[]>([])
  const [payments, setPayments] = useState<InvoicePaymentsDto[]>([])
  const [layawayRefunds, setLayawayRefunds] = useState<LayawayRefundDto[]>([])
  const [hydrated, setHydrated] = useState(false)

  // ----- Child-entry sheet state -----
  const [itemSheetOpen, setItemSheetOpen] = useState(false)
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  const [draftItem, setDraftItem] = useState<DraftItem>(emptyDraftItem)
  const [itemCategory, setItemCategory] = useState('all') // 'all' | department id string

  // Rapid-add state: Combobox imperative handle, flash banner, cancel-→-done.
  const itemComboboxRef = useRef<ComboboxHandle | null>(null)
  const [itemFlash, setItemFlash] = useState<{ key: number; name: string; verb: string } | null>(null)
  const [itemsAddedInSession, setItemsAddedInSession] = useState(0)
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // String state for the Adjustment input — allows typing "-" (the intermediate
  // keystroke for negative numbers) without a controlled number field coercing it
  // to 0 via `Number("-") || 0`.
  const [adjInput, setAdjInput] = useState('')

  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false)
  const [editingPaymentIndex, setEditingPaymentIndex] = useState<number | null>(null)
  const [draftPayment, setDraftPayment] = useState<InvoicePaymentsDto>(() => emptyPayment())

  const [saving, setSaving] = useState(false)

  // ----- Hydrate form from edit data -----
  useEffect(() => {
    if (isEdit && editData && !hydrated) {
      const m = editData.invoiceMasterDto
      setMaster({ ...m })
      setAdjInput(String(m.tbim_AdjAmt ?? 0)) // sync Adjustment string state
      setDetails(editData.invoiceDetailsDto ?? [])
      setPayments(editData.invoicePaymentsDto ?? [])
      setLayawayRefunds(m.layawayRefund ?? [])
      setHydrated(true)
    }
    if (!isEdit && !hydrated) {
      setHydrated(true)
    }
  }, [isEdit, editData, hydrated])

  // Hydrate form from reorder data (create from existing invoice, master only)
  useEffect(() => {
    if (isReorder && reorderData && !hydrated) {
      const m = reorderData.invoiceMasterDto
      setMaster({
        ...m,
        id: 0,
        tbim_InvoiceIdRad: 0,
        tbim_InvDate: getLocalISO(),
        tbim_LaywayDate: getLocalISO(),
        setDate: getLocalISO(),
        tbim_SubTotal: 0,
        tbim_SaleTax: 0,
        tbim_DisAmt: 0,
        tbim_Total: 0,
        tbim_PaidAmt: 0,
        tbim_AdjAmt: 0,
        tbim_AdjTotal: 0,
        layawayRefund: [],
      })
      setAdjInput('0')
      setDetails([])
      setPayments([])
      setLayawayRefunds([])
      setHydrated(true)
    }
  }, [isReorder, reorderData, hydrated])

  // Cleanup the flash-notification timer on unmount so there is no stale
  // timeout after the component is gone.
  useEffect(() => () => {
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
  }, [])

  // ----- Derived totals -----
  const totals = useMemo(() => {
    const subTotal = r2(details.reduce((sum, d) => sum + (Number(d.tbid_LineTotal) || 0), 0))
    const saleTax = r2(details.reduce((sum, d) => sum + (Number(d.tbid_TaxAmt) || 0), 0))
    const disPer = Number(master.tbim_DisPer) || 0
    const disAmt = r2((subTotal * disPer) / 100)
    const labour = Number(master.tbim_Labour) || 0
    const adjAmt = Number(master.tbim_AdjAmt) || 0
    const total = r2(adjAmt + subTotal + saleTax + labour - disAmt)
    const totalPaid = r2(payments.reduce((sum, p) => sum + (Number(p.tbip_PayAmt) || 0), 0))
    const layawayTotal = r2(layawayRefunds.reduce((sum, r) => sum + (Number(r.tbip_PayAmt) || 0), 0))
    return { subTotal, saleTax, disAmt, labour, adjAmt, total, totalPaid, layawayTotal }
  }, [details, payments, layawayRefunds, master.tbim_DisPer, master.tbim_Labour, master.tbim_AdjAmt])

  // ----- Setters -----
  const setMasterField = <K extends keyof InvoiceMasterDto>(key: K, value: InvoiceMasterDto[K]) =>
    setMaster((prev) => ({ ...prev, [key]: value }))

  const setWheel = (wheel: 'lf' | 'rf' | 'lr' | 'rr', value: boolean) => {
    const map = {
      lf: 'tbim_Left_Front' as const,
      rf: 'tbim_Right_Front' as const,
      lr: 'tbim_Left_Rear' as const,
      rr: 'tbim_Right_Rear' as const,
    }
    setMasterField(map[wheel], value)
  }

  // ----- Tax ID change -> auto-fill company info -----
  const handleTaxIdChange = async (taxIdValue: string) => {
    if (!taxIdValue) {
      setMasterField('tbim_TaxId', null)
      setMasterField('taxCompanyName', '')
      setMasterField('taxAddress', '')
      setMasterField('taxPhone', '')
      return
    }
    const id = Number(taxIdValue)
    setMasterField('tbim_TaxId', id)
    try {
      const res = await fetch(getApiUrl(`/api/TaxId/${id}`), {
        headers: {
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('NEXT_AUTH_TOKEN') ?? '' : ''}`,
        },
      }).then((r) => r.json())
      setMasterField('taxCompanyName', res?.tbti_ComName ?? '')
      setMasterField('taxAddress', res?.tbti_Address ?? '')
      setMasterField('taxPhone', res?.tbti_Phone ?? '')
      setMasterField('taxIdentificationNumber', res?.tbti_TaxNumber ?? '')
    } catch {
      toast.error('Failed to load Tax ID details')
    }
  }

  // ----- Item selection in the sheet -> fetch item price -----
  const handleItemSelect = async (itemId: string) => {
    if (!itemId) {
      setDraftItem((prev) => ({ ...prev, tbid_ItemId: null, tbid_UnitPrice: 0, tbid_DepartmentName: '' }))
      return
    }
    const id = Number(itemId)
    const item = itemsData?.find((i) => i.id === id)
    if (item) {
      // Pre-fill from the list data we already have
      setDraftItem((prev) => ({
        ...prev,
        tbid_ItemId: id,
        tbid_ItemCategory: item.tbim_ItemCategoryId,
        tbid_DepartmentName: item.departmentName ?? '',
        tbid_Size: item.tbim_Size ?? '',
        tbid_Brand: item.tbim_Brand ?? '',
        tbid_Series: item.tbim_Series ?? '',
        tbid_Bolt: item.tbim_Bolt ?? '',
        tbid_HoleS: item.tbim_HoleS ?? '',
        tbid_Zone: item.tbim_Zone ?? '',
        tbid_DistributorId: item.tbim_DistributorId,
        tbid_DistributorName: item.distributorName ?? '',
      }))
      // Fetch the canonical price (tbim_Code per BRS)
      try {
        const detail = await fetch(getApiUrl(`/api/ItemMaster/${id}`), {
          headers: {
            Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('NEXT_AUTH_TOKEN') ?? '' : ''}`,
          },
        }).then((r) => r.json())
        setDraftItem((prev) => ({ ...prev, tbid_UnitPrice: Number(detail?.tbim_Code) || 0 }))
      } catch {
        /* keep 0; user can type a price */
      }
    }
  }

  // ----- Item add/update/remove -----
  const openAddItemSheet = () => {
    setEditingItemIndex(null)
    setDraftItem({ ...emptyDraftItem(), taxRate: effectiveTaxRate })
    setItemCategory('all')
    setItemsAddedInSession(0)
    setItemFlash(null)
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
    setItemSheetOpen(true)
  }
  const handleItemSheetOpenChange = (open: boolean) => {
    setItemSheetOpen(open)
    if (!open) {
      setItemsAddedInSession(0)
      setItemFlash(null)
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
    }
  }
  const openEditItemSheet = (index: number) => {
    const d = details[index]
    setEditingItemIndex(index)
    setDraftItem({
      ...d,
      taxRate: d.tbid_Taxable && d.tbid_LineTotal ? (d.tbid_TaxAmt / d.tbid_LineTotal) * 100 : effectiveTaxRate,
    })
    setItemSheetOpen(true)
  }
  const commitItem = () => {
    if (!draftItem.tbid_ItemId) {
      toast.error('Please select an item')
      return
    }
    const lineTotal = computeLineTotal(draftItem.tbid_UnitPrice, draftItem.tbid_Qty)
    const taxAmt = computeTaxAmt(lineTotal, draftItem.tbid_Taxable, draftItem.taxRate)
    const row: InvoiceDetailsDto = {
      id: draftItem.id,
      tbid_InvoiceId: Number(invoiceId ?? 0),
      tbid_ItemId: draftItem.tbid_ItemId,
      tbid_ItemCategory: draftItem.tbid_ItemCategory,
      tbid_DepartmentName: draftItem.tbid_DepartmentName,
      tbid_Size: draftItem.tbid_Size,
      tbid_Brand: draftItem.tbid_Brand,
      tbid_Series: draftItem.tbid_Series,
      tbid_Bolt: draftItem.tbid_Bolt,
      tbid_HoleS: draftItem.tbid_HoleS,
      tbid_Zone: draftItem.tbid_Zone,
      tbid_DistributorId: draftItem.tbid_DistributorId,
      tbid_DistributorName: draftItem.tbid_DistributorName,
      tbid_Qty: Number(draftItem.tbid_Qty) || 0,
      tbid_Taxable: draftItem.tbid_Taxable,
      tbid_UnitPrice: Number(draftItem.tbid_UnitPrice) || 0,
      tbid_LineTotal: lineTotal,
      tbid_TaxAmt: taxAmt,
      itemDepartmentName: draftItem.itemDepartmentName,
      itemDistributorName: draftItem.itemDistributorName,
      itemLocationName: draftItem.itemLocationName,
      itemDisplay: draftItem.itemDisplay,
    }

    if (editingItemIndex !== null) {
      // Editing an existing row: update and close (standard flow).
      setDetails((prev) => {
        const copy = [...prev]
        copy[editingItemIndex] = row
        return copy
      })
      setEditingItemIndex(null)
      setItemSheetOpen(false)
      return
    }

    // ---- Add flow: keep the sheet open for rapid entry ----

    setDetails((prev) => [...prev, row])

    // Flash a subtle success banner at the top of the panel.
    const addedName = itemDescription(draftItem) || draftItem.tbid_DepartmentName || 'Item'
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
    setItemFlash({ key: (itemFlash?.key ?? 0) + 1, name: addedName, verb: 'added' })
    flashTimerRef.current = setTimeout(() => setItemFlash(null), 2500)
    setItemsAddedInSession((n) => n + 1)

    // Reset the entry fields and refocus the item search box so the operator
    // can immediately start typing the next item without clicking again.
    // Keep qty=1 (the sensible default for the next line item) — only the
    // item/price selection is cleared.
    setDraftItem({ ...emptyDraftItem(), tbid_Qty: 1 })
    setTimeout(() => itemComboboxRef.current?.focus(), 0)
  }
  const removeItem = (index: number) => {
    setDetails((prev) => prev.filter((_, i) => i !== index))
  }

  // ----- Payment helpers -----
  function emptyPayment(): InvoicePaymentsDto {
    return {
      id: 0,
      tbip_InvoiceId: Number(invoiceId ?? 0),
      tbip_PaymentId: 0,
      tbip_PayAmt: 0,
      tbip_Date: getLocalISO(),
      tbip_PaymentType: 'F',
      tbip_LayawayId: 0,
      tdip_fromlayaway: 'N',
      tbip_LayawayDate: getLocalISO(),
      paymentName: '',
    }
  }
  const openAddPaymentSheet = () => {
    setEditingPaymentIndex(null)
    setDraftPayment(emptyPayment())
    setPaymentSheetOpen(true)
  }
  const openEditPaymentSheet = (index: number) => {
    setEditingPaymentIndex(index)
    setDraftPayment({ ...payments[index] })
    setPaymentSheetOpen(true)
  }
  const commitPayment = () => {
    if (!draftPayment.tbip_PaymentId) {
      toast.error('Please select a payment method')
      return
    }
    const method = paymentNamesData?.find((p) => p.id === Number(draftPayment.tbip_PaymentId))
    const row: InvoicePaymentsDto = {
      ...draftPayment,
      tbip_PayAmt: Number(draftPayment.tbip_PayAmt) || 0,
      paymentName: method?.tbpn_PaymentName ?? '',
    }
    setPayments((prev) => {
      if (editingPaymentIndex !== null) {
        const copy = [...prev]
        copy[editingPaymentIndex] = row
        return copy
      }
      return [...prev, row]
    })
    setPaymentSheetOpen(false)
  }
  const removePayment = (index: number) => setPayments((prev) => prev.filter((_, i) => i !== index))


  // ----- Save -----
  const handleSave = async () => {
    if (!master.tbim_Name.trim()) {
      toast.error('Customer Name is required')
      return
    }
    if (!master.tbim_Phone.trim()) {
      toast.error('Phone Number is required')
      return
    }
    // Sanity checks: payment vs amount
    if (totals.totalPaid > totals.total) {
      toast.error('Paid amount cannot exceed the total amount.')
      return
    }
    if (master.tbim_PayInfo === 'F' && totals.totalPaid !== totals.total) {
      toast.error('For Full Payment, the total paid must equal the total amount.')
      return
    }
    setSaving(true)
    try {
      const userName = getUserName() ?? ''
      const setDate = getLocalISO()
      const payload = {
        invoiceMasterDto: {
          ...master,
          tbim_LocationDetailsId: locationId,
          tbim_SubTotal: totals.subTotal,
          tbim_SaleTax: totals.saleTax,
          tbim_DisAmt: totals.disAmt,
          tbim_Total: totals.total,
          tbim_PaidAmt: totals.totalPaid,
          tbim_AdjTotal: totals.total,
          tbim_RefundType: master.tbim_RefundType || 'N',
          refundAmount: totals.layawayTotal,
          layawayRefund: layawayRefunds,
          userName,
          setDate,
        },
        invoiceDetailsDto: details.map((d) =>
          d.id === 0 ? { ...d, id: 0 } : d
        ),
        invoicePaymentsDto: payments,
      }
      if (isEdit && invoiceId) {
        // Note: EditInvoice uses POST, not PUT — the .NET controller
        // decorates this action with [HttpPost] despite the "Edit" naming.
        await postFetcher(getApiUrl(`/api/InvoiceMaster/EditInvoice?id=${invoiceId}`), payload)
        // Invalidate the SWR cache for this invoice so the next time the
        // edit form mounts, it fetches fresh data instead of stale cache.
        mutateEdit()
        toast.success('Invoice updated successfully')
      } else {
        await postFetcher(getApiUrl('/api/InvoiceMaster/CreateInvoice'), payload)
        toast.success('Invoice created successfully')
      }
      router.push('/react-tables/transaction/invoice')
    } catch (err) {
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : isEdit
            ? 'Failed to update invoice'
            : 'Failed to create invoice',
      )
    } finally {
      setSaving(false)
    }
  }

  const taxIdOptions: ComboboxOption[] =
    (taxIdsData ?? []).map((t) => ({
      value: String(t.id),
      label: t.tbti_TaxNumber ? `${t.tbti_TaxNumber} — ${t.tbti_ComName ?? ''}`.trim() : `#${t.id}`,
    }))

  // Category combobox: "All" + the active departments
  const categoryOptions: ComboboxOption[] = useMemo(
    () => [
      { value: 'all', label: 'All' },
      ...(departmentsData ?? [])
        .filter((d) => d.tbid_IsActive)
        .map((d) => ({ value: String(d.id), label: d.tbid_DepartmentName })),
    ],
    [departmentsData],
  )

  // Items filtered by the selected category
  const itemOptions: ComboboxOption[] = useMemo(() => {
    const list = itemsData ?? []
    const filtered = itemCategory === 'all'
      ? list
      : list.filter((i) => i.tbim_ItemCategoryId === Number(itemCategory))
    return filtered.map((i) => ({
      value: String(i.id),
      label: [i.departmentName, i.tbim_Size, i.tbim_Brand, i.tbim_Series, i.tbim_Bolt, i.tbim_HoleS, i.tbim_Zone]
        .filter((v) => v !== null && v !== undefined && String(v).trim() !== '')
        .join(', '),
    }))
  }, [itemsData, itemCategory])

  // Clear the selected item when the category filter changes so the
  // Combobox doesn't show a stale item that isn't in the new category.
  const handleCategoryChange = (value: string) => {
    setItemCategory(value)
    setDraftItem((prev) => ({ ...prev, tbid_ItemId: null, tbid_UnitPrice: 0, tbid_DepartmentName: '' }))
  }

  const paymentOptions: ComboboxOption[] =
    (paymentNamesData ?? [])
      .filter((p) => p.tbpn_IsActive)
      .map((p) => ({ value: String(p.id), label: p.tbpn_PaymentName }))

  if ((isEdit && editLoading || isReorder && reorderLoading) && !hydrdratedReady(hydrated)) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Icon icon='svg-spinners:ring-resize' width={32} height={32} className='text-primary' />
      </div>
    )
  }

  // Close buttons for the bottom toolbar
  return (
    <div className='space-y-5'>
      <ToastContainer />
      {/* Page header */}
      <Card className='p-4 md:p-5'>
        <div>
          <h4 className='text-lg font-semibold text-ld dark:text-darklink'>
            {isEdit ? `Edit Invoice #${master.tbim_InvoiceIdRad || invoiceId}` : 'Create New Invoice'}
          </h4>
          <p className='text-sm text-darklink dark:text-bodytext'>
            {isEdit
              ? 'Update the invoice details below'
              : 'Log the work on the left, then settle payment on the right'}
          </p>
        </div>
      </Card>

      <div className='grid grid-cols-1 gap-5 xl:grid-cols-3'>
        {/* LEFT: customer & vehicle + car visual */}
        <div className='space-y-5 xl:col-span-2'>
          <Card className='p-4 md:p-5'>
            <div className='mb-4 flex items-center gap-2'>
              <Icon icon='solar:user-id-linear' width={20} height={20} className='text-primary' />
              <h6 className='font-semibold text-ld dark:text-darklink'>Customer &amp; Vehicle</h6>
            </div>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-[auto_1fr]'>
              <div className='rounded-lg bg-lightprimary/40 p-4 dark:bg-darkinfo/20'>
                <CarVisual
                  lf={master.tbim_Left_Front}
                  rf={master.tbim_Right_Front}
                  lr={master.tbim_Left_Rear}
                  rr={master.tbim_Right_Rear}
                  onChange={setWheel}
                />
              </div>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <Field label='Phone No' required>
                  <Input
                    value={master.tbim_Phone}
                    onChange={(e) => setMasterField('tbim_Phone', e.target.value)}
                    placeholder='e.g. 4102064139'
                  />
                </Field>
                <Field label='Date'>
                  <Input
                    type='date'
                    value={toDateInput(master.tbim_InvDate)}
                    onChange={(e) => setMasterField('tbim_InvDate', fromDateInput(e.target.value))}
                  />
                </Field>
                <Field label='Customer Name' required>
                  <Input
                    value={master.tbim_Name}
                    onChange={(e) => setMasterField('tbim_Name', e.target.value)}
                  />
                </Field>
                <Field label='Tax ID'>
                  <Combobox
                    options={taxIdOptions}
                    value={master.tbim_TaxId ? String(master.tbim_TaxId) : ''}
                    onChange={handleTaxIdChange}
                    placeholder='Select Tax ID'
                    searchPlaceholder='Search tax number...'
                  />
                </Field>
                <Field label='Company Name'>
                  <Input
                    value={master.taxCompanyName}
                    onChange={(e) => setMasterField('taxCompanyName', e.target.value)}
                    placeholder='Auto-filled from Tax ID'
                  />
                </Field>
                <Field label='Address'>
                  <Input
                    value={master.taxAddress}
                    onChange={(e) => setMasterField('taxAddress', e.target.value)}
                    placeholder='Auto-filled from Tax ID'
                  />
                </Field>
                <Field label='Email Address'>
                  <Input
                    type='email'
                    value={master.tbim_EmailAddress}
                    onChange={(e) => setMasterField('tbim_EmailAddress', e.target.value)}
                  />
                </Field>
                <Field label='ID #'>
                  <Input
                    value={master.tbim_IDNo}
                    onChange={(e) => setMasterField('tbim_IDNo', e.target.value)}
                  />
                </Field>
              </div>
            </div>

            {/* Vehicle details */}
            <div className='mt-5 border-t border-ld pt-5'>
              <h6 className='mb-3 text-sm font-semibold text-ld dark:text-darklink'>Vehicle Details</h6>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                <Field label='Vehicle Make'>
                  <Input value={master.tbim_VehicleMake} onChange={(e) => setMasterField('tbim_VehicleMake', e.target.value)} />
                </Field>
                <Field label='Vehicle Model'>
                  <Input value={master.tbim_Model} onChange={(e) => setMasterField('tbim_Model', e.target.value)} />
                </Field>
                <Field label='Year'>
                  <Input value={master.tbim_Year} onChange={(e) => setMasterField('tbim_Year', e.target.value)} />
                </Field>
                <Field label='Odometer'>
                  <Input value={master.tbim_Odometer} onChange={(e) => setMasterField('tbim_Odometer', e.target.value)} />
                </Field>
                <Field label='Tread Depth'>
                  <Input value={master.tbim_TreadDepth} onChange={(e) => setMasterField('tbim_TreadDepth', e.target.value)} />
                </Field>
                <Field label='License Plate'>
                  <Input value={master.tbim_License} onChange={(e) => setMasterField('tbim_License', e.target.value)} />
                </Field>
                <Field label='Note' className='sm:col-span-2 lg:col-span-3'>
                  <Textarea
                    rows={3}
                    value={master.tbim_Note}
                    onChange={(e) => setMasterField('tbim_Note', e.target.value)}
                    placeholder='Internal notes (multiline)...'
                  />
                </Field>
              </div>
            </div>
          </Card>

          {/* Line items table */}
          <Card className='p-4 md:p-5'>
            <div className='mb-4 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Icon icon='solar:bill-list-linear' width={20} height={20} className='text-primary' />
                <h6 className='font-semibold text-ld dark:text-darklink'>Invoice Items</h6>
              </div>
              <Button size='sm' onClick={openAddItemSheet}>
                <Icon icon='solar:add-circle-linear' width={18} height={18} />
                Add Item
              </Button>
            </div>
            <div className='overflow-x-auto rounded-lg border border-ld'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-lightprimary/20 dark:bg-darkinfo/10'>
                    <TableHead className='w-16 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400'>Taxable</TableHead>
                    <TableHead className='w-16 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400'>Qty</TableHead>
                    <TableHead className='text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400'>Item Description</TableHead>
                    <TableHead className='text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400'>Unit Price</TableHead>
                    <TableHead className='text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400'>Amount</TableHead>
                    <TableHead className='text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400'>Tax Amt</TableHead>
                    <TableHead className='w-16 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400'>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className='h-24 text-center text-darklink dark:text-bodytext'>
                        No items added. Click &quot;Add Item&quot; to start.
                      </TableCell>
                    </TableRow>
                  ) : (
                    details.map((d, i) => (
                      <TableRow key={`${d.id}-${i}`} className='border-b border-ld transition-colors duration-200 hover:bg-lightprimary/30 last:border-b-0'>
                        <TableCell>
                          {d.tbid_Taxable ? (
                            <Icon icon='solar:check-circle-linear' width={18} height={18} className='text-success' />
                          ) : (
                            <span className='text-darklink'>—</span>
                          )}
                        </TableCell>
                        <TableCell className='font-medium'>{d.tbid_Qty}</TableCell>
                        <TableCell className='max-w-xs truncate' title={itemDescription(d)}>
                          {itemDescription(d) || '-'}
                        </TableCell>
                        <TableCell className='text-right'>${money(d.tbid_UnitPrice)}</TableCell>
                        <TableCell className='text-right font-semibold text-ld dark:text-darklink'>${money(d.tbid_LineTotal)}</TableCell>
                        <TableCell className='text-right'>${money(d.tbid_TaxAmt)}</TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-1'>
                            <button
                              type='button'
                              onClick={() => openEditItemSheet(i)}
                              className='flex h-7 w-7 items-center justify-center rounded-md text-ld hover:bg-lightprimary hover:text-primary'
                              title='Edit'
                            >
                              <Icon icon='solar:pen-2-linear' width={16} height={16} />
                            </button>
                            <button
                              type='button'
                              onClick={() => removeItem(i)}
                              className='flex h-7 w-7 items-center justify-center rounded-md text-ld hover:bg-error/10 hover:text-error'
                              title='Remove'
                            >
                              <Icon icon='solar:trash-bin-trash-linear' width={16} height={16} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* ---- Calculation breakdown (right-aligned, directly under the items) ---- */}
            {/* Kept under the table — not in a right sidebar — so the operator's eyes stay
                on the left while verifying how subtotal / tax / discount / labour / adjustment
                combine into the final Total. */}
            <div className='mt-4 flex justify-end'>
              <div className='w-full max-w-sm space-y-2.5 rounded-lg border border-ld bg-lightprimary/10 p-4 dark:bg-darkinfo/5'>
                {/* Sub Total */}
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-darklink dark:text-bodytext'>Sub Total</span>
                  <span className='font-semibold text-ld dark:text-darklink'>${money(totals.subTotal)}</span>
                </div>

                {/* Labour input */}
                <div className='flex items-center justify-between gap-3 text-sm'>
                  <span className='text-darklink dark:text-bodytext'>Labour</span>
                  <div className='w-32'>
                    <Input
                      type='number'
                      value={Number(master.tbim_Labour) || 0}
                      onChange={(e) => setMasterField('tbim_Labour', Number(e.target.value) || 0)}
                      className='h-8 text-right'
                      aria-label='Labour amount'
                    />
                  </div>
                </div>

                {/* Tax (line-item tax, plainly labeled) */}
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-darklink dark:text-bodytext'>Tax</span>
                  <span className='font-semibold text-ld dark:text-darklink'>${money(totals.saleTax)}</span>
                </div>

                {/* Discount — cohesive row with % input + live computed amount */}
                <div className='flex items-center justify-between gap-3 text-sm'>
                  <span className='text-darklink dark:text-bodytext'>Discount</span>
                  <div className='flex items-center gap-1.5'>
                    <div className='relative w-24'>
                      <Input
                        type='number'
                        min={0}
                        value={Number(master.tbim_DisPer) || 0}
                        onChange={(e) => setMasterField('tbim_DisPer', Number(e.target.value) || 0)}
                        className='h-8 pr-7'
                        aria-label='Discount percentage'
                      />
                      <span className='pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-darklink dark:text-bodytext'>%</span>
                    </div>
                    <Icon icon='solar:alt-arrow-right-linear' width={14} height={14} className='shrink-0 text-darklink dark:text-bodytext' />
                    <span className='inline-flex min-w-[76px] items-center justify-end rounded-md bg-error/10 px-2 py-1.5 text-xs font-semibold text-error'>
                      {totals.disAmt > 0 ? '-' : ''}${money(totals.disAmt)}
                    </span>
                  </div>
                </div>

                {/* Adjustment input */}
                <div className='flex items-center justify-between gap-3 text-sm'>
                  <span className='text-darklink dark:text-bodytext'>Adjustment</span>
                  <div className='w-32'>
                    <Input
                      type='number'
                      value={adjInput}
                      onChange={(e) => {
                        setAdjInput(e.target.value)
                        setMasterField('tbim_AdjAmt', e.target.value === '' || e.target.value === '-' ? 0 : Number(e.target.value))
                      }}
                      onBlur={() => {
                        // On blur, ensure the display is synced to the canonical numeric value
                        // (handles cases like typing "-" then clicking away)
                        setAdjInput(String(master.tbim_AdjAmt))
                      }}
                      className='h-8 text-right'
                      aria-label='Adjustment amount'
                    />
                  </div>
                </div>

                {/* Total — large & prominent */}
                <div className='mt-1 flex items-center justify-between rounded-lg bg-primary px-3.5 py-2.5'>
                  <span className='font-semibold text-white'>Total Amount</span>
                  <span className='text-xl font-bold text-white'>${money(totals.total)}</span>
                </div>
                <p className='text-right text-[11px] text-darklink dark:text-bodytext'>
                  Adj + SubTotal + Tax + Labour − Discount
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT: payments + layaway + actions (the payment/settlement workflow) */}
        <div className='space-y-5'>

          {/* Payment type + payments */}
          <Card className='p-4 md:p-5'>
            <div className='mb-4 flex items-center gap-2'>
              <Icon icon='solar:card-money-linear' width={20} height={20} className='text-primary' />
              <h6 className='font-semibold text-ld dark:text-darklink'>Payments</h6>
            </div>

            <div className='mb-3'>
              <Label className='mb-1.5 block text-sm font-medium text-ld dark:text-darklink'>
                Payment Type
              </Label>
              <RadioGroup
                value={master.tbim_PayInfo}
                onValueChange={(v) => setMasterField('tbim_PayInfo', v)}
                className='grid grid-cols-3 gap-2'
              >
                {[{ v: 'F', l: 'Full' }, { v: 'P', l: 'Partial' }, { v: 'L', l: 'Pending' }].map((o) => (
                  <label
                    key={o.v}
                    className='flex cursor-pointer items-center gap-2 rounded-md border border-ld px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-lightprimary'
                  >
                    <RadioGroupItem value={o.v} id={`pay-${o.v}`} />
                    <span>{o.l}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className='mb-3 flex items-center justify-between rounded-md bg-lightsecondary/50 px-3 py-2 dark:bg-darkinfo/10'>
              <span className='text-sm text-darklink dark:text-bodytext'>Total Paid</span>
              <span className='font-semibold text-ld dark:text-darklink'>${money(totals.totalPaid)}</span>
            </div>

            <Button size='sm' variant='outline' className='mb-3 w-full' onClick={openAddPaymentSheet}>
              <Icon icon='solar:add-circle-linear' width={18} height={18} />
              Add Payment
            </Button>

            <div className='overflow-x-auto rounded-lg border border-ld'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-lightprimary/20 dark:bg-darkinfo/10'>
                    <TableHead className='text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400'>Method</TableHead>
                    <TableHead className='text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400'>Amount</TableHead>
                    <TableHead className='text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400'>Date</TableHead>
                    <TableHead className='w-16 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400'>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className='h-16 text-center text-sm text-darklink dark:text-bodytext'>
                        No payments.
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((p, i) => (
                      <TableRow key={`${p.id}-${i}`} className='border-b border-ld transition-colors duration-200 hover:bg-lightprimary/30 last:border-b-0'>
                        <TableCell>{p.paymentName || '-'}</TableCell>
                        <TableCell className='text-right font-medium'>${money(p.tbip_PayAmt)}</TableCell>
                        <TableCell>{formatShortDate(p.tbip_Date)}</TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-1'>
                            <button type='button' onClick={() => openEditPaymentSheet(i)} className='flex h-7 w-7 items-center justify-center rounded-md text-ld hover:bg-lightprimary hover:text-primary' title='Edit'>
                              <Icon icon='solar:pen-2-linear' width={16} height={16} />
                            </button>
                            <button type='button' onClick={() => removePayment(i)} className='flex h-7 w-7 items-center justify-center rounded-md text-ld hover:bg-error/10 hover:text-error' title='Remove'>
                              <Icon icon='solar:trash-bin-trash-linear' width={16} height={16} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Layaway refund — view-only, shown only when editing (refund entries
              originate from a layaway; not applicable when creating a new invoice) */}
          {isEdit && (
          <Card className='p-4 md:p-5'>
            <div className='mb-4 flex items-center gap-2'>
              <Icon icon='solar:undo-left-round-linear' width={20} height={20} className='text-primary' />
              <h6 className='font-semibold text-ld dark:text-darklink'>Payment Refund from Layaway</h6>
            </div>
            <div className='mb-3 flex items-center justify-between rounded-md bg-lightsuccess/40 px-3 py-2 dark:bg-lightsuccess/10'>
              <span className='text-sm text-darklink dark:text-bodytext'>Layaway Refund Total</span>
              <span className='font-semibold text-success'>${money(totals.layawayTotal)}</span>
            </div>
            <div className='overflow-x-auto rounded-lg border border-ld'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-lightprimary/20 dark:bg-darkinfo/10'>
                    <TableHead className='text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400'>Method</TableHead>
                    <TableHead className='text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400'>Amount</TableHead>
                    <TableHead className='text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400'>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {layawayRefunds.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className='h-16 text-center text-sm text-darklink dark:text-bodytext'>
                        No layaway refunds.
                      </TableCell>
                    </TableRow>
                  ) : (
                    layawayRefunds.map((r, i) => (
                      <TableRow key={`${r.id}-${i}`} className='border-b border-ld transition-colors duration-200 hover:bg-lightprimary/30 last:border-b-0'>
                        <TableCell>{r.paymentName || '-'}</TableCell>
                        <TableCell className='text-right font-medium'>${money(r.tbip_PayAmt)}</TableCell>
                        <TableCell>{formatShortDate(r.tbip_Date)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
          )}

          {/* ---- Settlement summary + actions ---- */}
          <Card className='p-4 md:p-5'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-darklink dark:text-bodytext'>Total Due</span>
                <span className='font-semibold text-ld dark:text-darklink'>${money(totals.total)}</span>
              </div>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-darklink dark:text-bodytext'>Total Paid</span>
                <span className='font-semibold text-success'>${money(totals.totalPaid)}</span>
              </div>
              {isEdit && (
              <div className='flex items-center justify-between text-sm'>
                <span className='text-darklink dark:text-bodytext'>Layaway Refund</span>
                <span className='font-semibold text-success'>${money(totals.layawayTotal)}</span>
              </div>
              )}
              <div className='flex items-center justify-between rounded-md bg-primary/10 px-3 py-2'>
                <span className='text-sm font-medium text-primary'>Balance</span>
                <span className='text-sm font-bold text-primary'>
                  ${money(totals.total - totals.totalPaid)}
                </span>
              </div>
            </div>
            <div className='mt-4 flex flex-col gap-2'>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Icon icon='svg-spinners:ring-resize' width={18} height={18} />
                    {isEdit ? 'Saving...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Icon icon='solar:diskette-linear' width={18} height={18} />
                    {isEdit ? 'Update Invoice' : 'Save Invoice'}
                  </>
                )}
              </Button>
              <Button variant='outline' onClick={() => router.back()} disabled={saving}>
                <Icon icon='solar:alt-arrow-left-linear' width={18} height={18} />
                Back
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* ===== Add/Edit Item Sheet ===== */}
      <Sheet open={itemSheetOpen} onOpenChange={handleItemSheetOpenChange}>
        <SheetContent side='right' className='w-full overflow-y-auto sm:max-w-xl'>
          <SheetHeader className='px-4 pt-4'>
            <SheetTitle>{editingItemIndex !== null ? 'Edit Item' : 'Add Item'}</SheetTitle>
            <SheetDescription>Select an item from inventory, then set quantity and tax.</SheetDescription>
          </SheetHeader>
          <div className='space-y-4 px-4 pb-8'>
            {/* Success flash banner — auto-dismissed after each add */}
            {itemFlash && (
              <div
                key={itemFlash.key}
                className='flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm font-medium text-success animate-in fade-in-0 slide-in-from-top-2 duration-300'
                role='status'
                aria-live='polite'
              >
                <Icon icon='solar:check-circle-linear' width={16} height={16} className='shrink-0' />
                <span className='truncate'>{itemFlash.name} {itemFlash.verb} successfully</span>
              </div>
            )}
            <Field label='Category'>
              <Combobox
                options={categoryOptions}
                value={itemCategory}
                onChange={handleCategoryChange}
                placeholder='Select category'
                searchPlaceholder='Search categories...'
              />
            </Field>
            <Field label='Item' required>
              <Combobox
                ref={itemComboboxRef}
                options={itemOptions}
                value={draftItem.tbid_ItemId ? String(draftItem.tbid_ItemId) : ''}
                onChange={handleItemSelect}
                placeholder='Select an item'
                searchPlaceholder='Search items...'
              />
            </Field>
            <div className='grid grid-cols-2 gap-4'>
              <Field label='Unit Price'>
                <Input
                  type='number'
                  value={Number(draftItem.tbid_UnitPrice) || 0}
                  onChange={(e) => setDraftItem((p) => ({ ...p, tbid_UnitPrice: Number(e.target.value) || 0 }))}
                />
              </Field>
              <Field label='Qty' required>
                <Input
                  type='number'
                  min={1}
                  value={Number(draftItem.tbid_Qty) || 0}
                  onChange={(e) => setDraftItem((p) => ({ ...p, tbid_Qty: Number(e.target.value) || 0 }))}
                />
              </Field>
            </div>
            <div className='flex items-center gap-3'>
              <Checkbox
                id='taxable'
                checked={draftItem.tbid_Taxable}
                onCheckedChange={(v) => setDraftItem((p) => ({ ...p, tbid_Taxable: v === true }))}
              />
              <Label htmlFor='taxable' className='text-sm font-medium text-ld dark:text-darklink'>
                Taxable
              </Label>
            </div>
            {draftItem.tbid_Taxable && (
              <Field label='Tax Rate (%)'>
                <Input
                  type='number'
                  value={Number(draftItem.taxRate) || 0}
                  onChange={(e) => setDraftItem((p) => ({ ...p, taxRate: Number(e.target.value) || 0 }))}
                />
              </Field>
            )}
            <div className='grid grid-cols-2 gap-4 rounded-lg bg-lightprimary/30 p-3 dark:bg-darkinfo/10'>
              <div>
                <p className='text-xs text-darklink dark:text-bodytext'>Tax Amount</p>
                <p className='text-base font-semibold text-ld dark:text-darklink'>
                  ${money(computeTaxAmt(computeLineTotal(draftItem.tbid_UnitPrice, draftItem.tbid_Qty), draftItem.tbid_Taxable, draftItem.taxRate))}
                </p>
              </div>
              <div>
                <p className='text-xs text-darklink dark:text-bodytext'>Total Amount</p>
                <p className='text-base font-semibold text-primary'>
                  ${money(computeLineTotal(draftItem.tbid_UnitPrice, draftItem.tbid_Qty) + computeTaxAmt(computeLineTotal(draftItem.tbid_UnitPrice, draftItem.tbid_Qty), draftItem.tbid_Taxable, draftItem.taxRate))}
                </p>
              </div>
            </div>
            <div className='flex justify-end gap-2 pt-2'>
              <Button variant='outline' onClick={() => handleItemSheetOpenChange(false)}>
                {itemsAddedInSession > 0 ? 'Close' : 'Cancel'}
              </Button>
              <Button onClick={commitItem}>
                <Icon icon='solar:check-circle-linear' width={18} height={18} />
                {editingItemIndex !== null ? 'Update Item' : 'Add to Invoice'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ===== Add/Edit Payment Sheet ===== */}
      <Sheet open={paymentSheetOpen} onOpenChange={setPaymentSheetOpen}>
        <SheetContent side='right' className='w-full overflow-y-auto sm:max-w-md'>
          <SheetHeader className='px-4 pt-4'>
            <SheetTitle>{editingPaymentIndex !== null ? 'Edit Payment' : 'Add Payment'}</SheetTitle>
            <SheetDescription>Record a payment against this invoice.</SheetDescription>
          </SheetHeader>
          <div className='space-y-4 px-4 pb-8'>
            <Field label='Payment Method' required>
              <Combobox
                options={paymentOptions}
                value={draftPayment.tbip_PaymentId ? String(draftPayment.tbip_PaymentId) : ''}
                onChange={(v) => setDraftPayment((p) => ({ ...p, tbip_PaymentId: Number(v) || 0 }))}
                placeholder='Select payment method'
                searchPlaceholder='Search...'
              />
            </Field>
            <Field label='Amount' required>
              <Input
                type='number'
                value={Number(draftPayment.tbip_PayAmt) || 0}
                onChange={(e) => setDraftPayment((p) => ({ ...p, tbip_PayAmt: Number(e.target.value) || 0 }))}
              />
            </Field>
            <Field label='Date'>
              <Input
                type='date'
                value={toDateInput(draftPayment.tbip_Date)}
                onChange={(e) => setDraftPayment((p) => ({ ...p, tbip_Date: fromDateInput(e.target.value) }))}
              />
            </Field>
            <div className='flex justify-end gap-2 pt-2'>
              <Button variant='outline' onClick={() => setPaymentSheetOpen(false)}>Cancel</Button>
              <Button onClick={commitPayment}>
                <Icon icon='solar:check-circle-linear' width={18} height={18} />
                {editingPaymentIndex !== null ? 'Update Payment' : 'Add Payment'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Layaway Refund is view-only — the Add/Edit Sheet has been removed */}
    </div>
  )
}

// ---------- date helpers ----------
function toDateTimeLocal(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
function fromDateTimeLocal(value: string): string {
  if (!value) return getLocalISO()
  return new Date(value).toISOString()
}
function toDateInput(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function fromDateInput(value: string): string {
  if (!value) return getLocalISO()
  return new Date(value).toISOString()
}
function formatShortDate(iso?: string): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

// Helper to gate the edit loading spinner until hydration completes.
function hydrdratedReady(hydrated: boolean): boolean {
  return hydrated
}