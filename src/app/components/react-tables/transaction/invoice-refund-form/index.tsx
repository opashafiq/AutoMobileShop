'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Icon } from '@iconify/react'
import { toast } from 'react-toastify'

import { getApiUrl, getFetcher, postFetcher } from '@/app/api/globalFetcher'
import { getUserName } from '@/app/api/auth'
import { getLocalISO } from '@/lib/time'
import {
  type InvoiceRefundMasterDto,
  type InvoiceRefundDetailsDto,
  type InvoiceRefundPaymentsDto,
  type RefundMethodNameType,
  type RefundListResponseItem,
  type DraftRefundDetail,
} from '@/app/(DashboardLayout)/types/apps/refundMaster'
import {
  type InvoiceListResponseItem,
  type InvoiceMasterDto,
  type InvoiceDetailsDto,
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

import { Combobox, type ComboboxOption } from '../shared/Combobox'

// Default sales-tax rate fallback (matches the invoice module default)
const DEFAULT_TAX_RATE = 8.25

interface FieldProps {
  label: string
  children: ReactNode
  className?: string
  required?: boolean
}

function Field({ label, children, className, required }: FieldProps) {
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

// Build the human-readable item description used throughout the form.
const itemDescription = (d: { tbird_DepartmentName?: string; tbird_Size?: string; tbird_Brand?: string; tbird_Series?: string; tbird_Bolt?: string; tbird_HoleS?: string; tbird_Zone?: string }) =>
  [d.tbird_DepartmentName, d.tbird_Size, d.tbird_Brand, d.tbird_Series, d.tbird_Bolt, d.tbird_HoleS, d.tbird_Zone]
    .filter((v) => v !== null && v !== undefined && String(v).trim() !== '')
    .join(', ')

const computeLineTotal = (price: number, qty: number) => (Number(price) || 0) * (Number(qty) || 0)
const computeTaxAmt = (lineTotal: number, taxable: boolean, taxRate: number) =>
  taxable ? (lineTotal * (Number(taxRate) || 0)) / 100 : 0

// ---------- Seeds ----------
const emptyRefundMaster = (): InvoiceRefundMasterDto => ({
  id: 0,
  tbirm_InvoiceRefundIdRad: 0,
  tbirm_InvRefundDate: getLocalISO(),
  tbirm_RefundType: 'P',
  tbirm_InvoiceId: 0,
  tbirm_SubTotal: 0,
  tbirm_SaleTax: 0,
  tbirm_Labour: 0,
  tbirm_DisPer: 0,
  tbirm_DisAmt: 0,
  tbirm_Total: 0,
  tbirm_RefundAmt: 0,
  tbirm_AdjAmt: 0,
  tbirm_Note: '',
  tbirm_Delinfo: 'A',
  tbirm_Item_Delete_after_Invoice_Refund_Create: false,
  userName: getUserName() ?? '',
  setDate: getLocalISO(),
  originalInvoiceName: '',
  originalInvoiceDate: '',
  tbim_InvoiceIdRad: 0,
  tbim_Phone: '',
})

// Derive the effective tax rate for an invoice line item (matches invoice-form logic).
const deriveTaxRate = (d: InvoiceDetailsDto): number => {
  if (d.tbid_Taxable && Number(d.tbid_LineTotal) > 0) {
    return (Number(d.tbid_TaxAmt) / Number(d.tbid_LineTotal)) * 100
  }
  return DEFAULT_TAX_RATE
}

// Map an InvoiceDetailsDto → a DraftRefundDetail with refundQty=0 (nothing refunded yet).
const detailFromInvoice = (d: InvoiceDetailsDto): DraftRefundDetail => ({
  id: 0,
  tbird_InvoiceRefundId: 0,
  tbird_ItemId: Number(d.tbid_ItemId) || 0,
  tbird_ItemCategory: Number(d.tbid_ItemCategory) || 0,
  tbird_DepartmentName: d.tbid_DepartmentName ?? '',
  tbird_Size: d.tbid_Size ?? '',
  tbird_Brand: d.tbid_Brand ?? '',
  tbird_Series: d.tbid_Series ?? '',
  tbird_Bolt: d.tbid_Bolt ?? '',
  tbird_HoleS: d.tbid_HoleS ?? '',
  tbird_Zone: d.tbid_Zone ?? '',
  tbird_DistributorId: Number(d.tbid_DistributorId) || 0,
  tbird_DistributorName: d.tbid_DistributorName ?? '',
  tbird_Qty: Number(d.tbid_Qty) || 0,
  tbird_Taxable: d.tbid_Taxable ?? false,
  tbird_UnitPrice: Number(d.tbid_UnitPrice) || 0,
  tbird_LineTotal: 0,
  tbird_TaxAmt: 0,
  itemDepartmentName: d.itemDepartmentName ?? '',
  itemDistributorName: d.itemDistributorName ?? '',
  itemLocationName: d.itemLocationName ?? '',
  itemDisplay: d.itemDisplay ?? '',
  refundQty: 0,
  originalQty: Number(d.tbid_Qty) || 0,
  taxRate: deriveTaxRate(d),
})

// Map back a DraftRefundDetail → a clean InvoiceRefundDetailsDto (what we send to the API).
// Lines with refundQty <= 0 are excluded at save time.
const detailToApi = (d: DraftRefundDetail): InvoiceRefundDetailsDto => ({
  id: d.id,
  tbird_InvoiceRefundId: d.tbird_InvoiceRefundId,
  tbird_ItemId: d.tbird_ItemId,
  tbird_ItemCategory: d.tbird_ItemCategory,
  tbird_DepartmentName: d.tbird_DepartmentName,
  tbird_Size: d.tbird_Size,
  tbird_Brand: d.tbird_Brand,
  tbird_Series: d.tbird_Series,
  tbird_Bolt: d.tbird_Bolt,
  tbird_HoleS: d.tbird_HoleS,
  tbird_Zone: d.tbird_Zone,
  tbird_DistributorId: d.tbird_DistributorId,
  tbird_DistributorName: d.tbird_DistributorName,
  tbird_Qty: Number(d.refundQty) || 0,
  tbird_Taxable: d.tbird_Taxable,
  tbird_UnitPrice: d.tbird_UnitPrice,
  tbird_LineTotal: Number(d.tbird_LineTotal) || 0,
  tbird_TaxAmt: Number(d.tbird_TaxAmt) || 0,
  itemDepartmentName: d.itemDepartmentName,
  itemDistributorName: d.itemDistributorName,
  itemLocationName: d.itemLocationName,
  itemDisplay: d.itemDisplay,
})

export interface InvoiceRefundFormProps {
  mode: 'create' | 'edit'
  refundId?: string
  /** In create mode: the invoice id to refund against (refetched for canonical details). */
  sourceInvoiceId?: string
  /** In create mode: which kind of refund. Items editable, or payment-only. */
  refundMode?: 'item' | 'payment'
  onCancel?: () => void
}

export default function InvoiceRefundForm({ mode, refundId, sourceInvoiceId, refundMode = 'item', onCancel: onCancelProp }: InvoiceRefundFormProps) {
  const handleCancel = onCancelProp ?? (() => router.back())
  const router = useRouter()
  const isEdit = mode === 'edit'

  // ----- Reference data -----
  const { data: refundMethodsData } = useSWR<RefundMethodNameType[]>(getApiUrl('/api/RefundMethodNames'), getFetcher)

  // ----- Create-mode fetch (the source invoice, for canonical details) -----
  const sourceInvoiceUrl = !isEdit && sourceInvoiceId ? getApiUrl(`/api/InvoiceMaster/${sourceInvoiceId}`) : null
  const { data: sourceInvoiceData, isLoading: sourceLoading } = useSWR<InvoiceListResponseItem>(sourceInvoiceUrl, getFetcher)

  // ----- Edit-mode fetch (the existing refund) -----
  const editRefundUrl = isEdit && refundId ? getApiUrl(`/api/InvoiceRefundMaster/${refundId}`) : null
  const { data: editData, isLoading: editLoading, mutate: mutateEdit } = useSWR<RefundListResponseItem>(editRefundUrl, getFetcher)

  // ----- Form state -----
  const [master, setMaster] = useState<InvoiceRefundMasterDto>(emptyRefundMaster)
  const [details, setDetails] = useState<DraftRefundDetail[]>([])
  const [payments, setPayments] = useState<InvoiceRefundPaymentsDto[]>([])
  const [refundModeState, setRefundModeState] = useState<'item' | 'payment'>(refundMode)
  const [remainingRefundable, setRemainingRefundable] = useState<number>(0)
  const [hydrated, setHydrated] = useState(false)
  const [saving, setSaving] = useState(false)

  // Snapshot of the source invoice master (readonly display) — kept separately
  // from the refund master so the source values never get edited.
  const [sourceInvoiceMaster, setSourceInvoiceMaster] = useState<InvoiceMasterDto | null>(null)

  // ----- Payment sheet state -----
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false)
  const [editingPaymentIndex, setEditingPaymentIndex] = useState<number | null>(null)
  const [draftPayment, setDraftPayment] = useState<InvoiceRefundPaymentsDto>(() => emptyPayment())

  // ----- Hydrate from source invoice (create) -----
  useEffect(() => {
    if (!isEdit && sourceInvoiceData && !hydrated) {
      const inv = sourceInvoiceData.invoiceMasterDto
      setSourceInvoiceMaster(inv)
      const total = Number(inv.tbim_Total) || 0
      const alreadyRefunded = Number(inv.refundAmount) || 0
      setRemainingRefundable(Math.max(0, total - alreadyRefunded))

      setMaster({
        ...emptyRefundMaster(),
        // Authoritative identity fields are DB-assigned; leave 0.
        tbirm_InvoiceId: inv.id,
        tbirm_InvRefundDate: getLocalISO(),
        tbirm_RefundType: refundMode === 'item' ? 'P' : 'P',
        tbirm_Labour: refundMode === 'item' ? Number(inv.tbim_Labour) || 0 : 0,
        tbirm_DisPer: refundMode === 'item' ? Number(inv.tbim_DisPer) || 0 : 0,
        tbirm_AdjAmt: refundMode === 'item' ? Number(inv.tbim_AdjAmt) || 0 : 0,
        tbirm_Delinfo: inv.tbim_Delinfo || 'A',
        // explicit per-refund choice — do NOT auto-copy from invoice (decision #9)
        tbirm_Item_Delete_after_Invoice_Refund_Create: false,
        originalInvoiceName: inv.tbim_Name || '',
        originalInvoiceDate: inv.tbim_InvDate || '',
        tbim_InvoiceIdRad: Number(inv.tbim_InvoiceIdRad) || 0,
        tbim_Phone: inv.tbim_Phone || '',
      })

      if (refundMode === 'item') {
        setDetails((sourceInvoiceData.invoiceDetailsDto ?? []).map(detailFromInvoice))
      } else {
        setDetails([])
      }
      setPayments([])
      setRefundModeState(refundMode)
      setHydrated(true)
    }
  }, [isEdit, sourceInvoiceData, hydrated, refundMode])

  // ----- Hydrate from existing refund (edit) -----
  useEffect(() => {
    if (isEdit && editData && !hydrated) {
      const rm = editData.invoiceRefundMasterDto
      const rdetails = editData.invoiceRefundDetailsDto ?? []
      const rpayments = editData.invoiceRefundPaymentsDto ?? []

      const sourceInv: InvoiceMasterDto | null = null // source invoice isn't returned by refund GET; show what we have
      setSourceInvoiceMaster(sourceInv)
      setMaster({ ...rm })
      setRemainingRefundable(0) // not enforced on edit
      // Determine mode from whether there are details.
      setRefundModeState(rdetails.length > 0 ? 'item' : 'payment')

      setDetails(rdetails.map((d) => ({
        id: d.id,
        tbird_InvoiceRefundId: d.tbird_InvoiceRefundId,
        tbird_ItemId: d.tbird_ItemId,
        tbird_ItemCategory: d.tbird_ItemCategory,
        tbird_DepartmentName: d.tbird_DepartmentName,
        tbird_Size: d.tbird_Size,
        tbird_Brand: d.tbird_Brand,
        tbird_Series: d.tbird_Series,
        tbird_Bolt: d.tbird_Bolt,
        tbird_HoleS: d.tbird_HoleS,
        tbird_Zone: d.tbird_Zone,
        tbird_DistributorId: d.tbird_DistributorId,
        tbird_DistributorName: d.tbird_DistributorName,
        tbird_Qty: d.tbird_Qty,
        tbird_Taxable: d.tbird_Taxable,
        tbird_UnitPrice: d.tbird_UnitPrice,
        tbird_LineTotal: d.tbird_LineTotal,
        tbird_TaxAmt: d.tbird_TaxAmt,
        itemDepartmentName: d.itemDepartmentName,
        itemDistributorName: d.itemDistributorName,
        itemLocationName: d.itemLocationName,
        itemDisplay: d.itemDisplay,
        refundQty: d.tbird_Qty,
        originalQty: d.tbird_Qty,
        taxRate: d.tbird_Taxable && Number(d.tbird_LineTotal) > 0
          ? (Number(d.tbird_TaxAmt) / Number(d.tbird_LineTotal)) * 100
          : 0,
      })))
      setPayments(rpayments.map((p) => ({ ...p })))
      setHydrated(true)
    }
  }, [isEdit, editData, hydrated])

  // Recompute line totals whenever refundQty / unitPrice / taxable / taxRate changes.
  const computedDetails = useMemo(() => {
    return details.map((d) => {
      const lineTotal = computeLineTotal(d.tbird_UnitPrice, d.refundQty)
      const taxAmt = computeTaxAmt(lineTotal, d.tbird_Taxable, d.taxRate)
      return { ...d, tbird_LineTotal: lineTotal, tbird_TaxAmt: taxAmt }
    })
  }, [details])

  // ----- Derived refund totals -----
  const totals = useMemo(() => {
    const isItem = refundModeState === 'item'
    const subTotal = isItem
      ? computedDetails.reduce((sum, d) => sum + (Number(d.tbird_LineTotal) || 0), 0)
      : 0
    const saleTax = isItem
      ? computedDetails.reduce((sum, d) => sum + (Number(d.tbird_TaxAmt) || 0), 0)
      : 0
    const total = isItem ? subTotal + saleTax : 0
    const refundAmt = payments.reduce((sum, p) => sum + (Number(p.tbirp_RefundAmt) || 0), 0)
    return { subTotal, saleTax, total, refundAmt }
  }, [computedDetails, payments, refundModeState])

  // ----- Setters -----
  const setMasterField = <K extends keyof InvoiceRefundMasterDto>(key: K, value: InvoiceRefundMasterDto[K]) =>
    setMaster((prev) => ({ ...prev, [key]: value }))

  // ---- Item refundQty handlers ----
  const setRefundQty = (index: number, qty: number) => {
    const q = Math.max(0, Math.floor(Number(qty) || 0))
    setDetails((prev) => {
      const copy = [...prev]
      const row = { ...copy[index] }
      row.refundQty = Math.min(q, row.originalQty)
      copy[index] = row
      return copy
    })
  }
  const setRefundQtyAll = (qty: number) => {
    setDetails((prev) =>
      prev.map((d) => ({ ...d, refundQty: Math.min(qty, d.originalQty) })),
    )
  }
  const setRefundTaxRate = (index: number, rate: number) => {
    setDetails((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], taxRate: Number(rate) || 0 }
      return copy
    })
  }

  // ----- Payment helpers -----
  function emptyPayment(): InvoiceRefundPaymentsDto {
    return {
      id: 0,
      tbirp_InvoiceRefundId: Number(refundId ?? 0),
      tbirp_RefundMethodId: 0,
      tbirp_RefundAmt: 0,
      tbirp_Date: getLocalISO(),
      refundMethodName: '',
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
    if (!draftPayment.tbirp_RefundMethodId) {
      toast.error('Please select a refund method')
      return
    }
    const method = refundMethodsData?.find((p) => p.id === Number(draftPayment.tbirp_RefundMethodId))
    const row: InvoiceRefundPaymentsDto = {
      ...draftPayment,
      tbirp_RefundAmt: Number(draftPayment.tbirp_RefundAmt) || 0,
      refundMethodName: method?.tbrmn_RefundMethodName ?? '',
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

  const refundMethodOptions: ComboboxOption[] = useMemo(
    () => (refundMethodsData ?? [])
      .filter((p) => p.tbrmn_IsActive !== false)
      .map((p) => ({ value: String(p.id), label: p.tbrmn_RefundMethodName })),
    [refundMethodsData],
  )

  // ----- Validation -----
  const isItem = refundModeState === 'item'
  const isBalanced = isItem
    ? Math.abs(totals.refundAmt - totals.total) < 0.01
    : totals.refundAmt > 0
  const hasPayments = payments.length > 0
  const exceedingRemaining = !isEdit && totals.refundAmt > remainingRefundable && Math.abs(totals.refundAmt - remainingRefundable) > 0.01
  const hasRefundedItems = computedDetails.some((d) => Number(d.refundQty) > 0)
  const canSave = isBalanced && hasPayments && !exceedingRemaining && (!isItem || hasRefundedItems)

  // ----- Save -----
  const handleSave = async () => {
    if (!hasPayments) {
      toast.error('Add at least one refund payment before saving.')
      return
    }
    if (isItem && !hasRefundedItems) {
      toast.error('Enter a refund quantity for at least one item.')
      return
    }
    if (isItem && !isBalanced) {
      toast.error(`Refund payments ($${money(totals.refundAmt)}) must equal the refund total ($${money(totals.total)}).`)
      return
    }
    if (exceedingRemaining) {
      toast.error(`Refund amount exceeds the remaining refundable amount ($${money(remainingRefundable)}).`)
      return
    }

    setSaving(true)
    try {
      const userName = getUserName() ?? ''
      const setDate = getLocalISO()
      const detailsApi = isItem
        ? computedDetails.filter((d) => Number(d.refundQty) > 0).map(detailToApi)
        : []

      const payload = {
        invoiceRefundMasterDto: {
          ...master,
          tbirm_SubTotal: totals.subTotal,
          tbirm_SaleTax: totals.saleTax,
          tbirm_Labour: 0,
          tbirm_DisPer: 0,
          tbirm_DisAmt: 0,
          tbirm_AdjAmt: 0,
          tbirm_Total: totals.total,
          tbirm_RefundAmt: totals.refundAmt,
          userName,
          setDate,
        },
        invoiceRefundDetailsDto: detailsApi,
        invoiceRefundPaymentsDto: payments,
      }

      if (isEdit && refundId) {
        await postFetcher(getApiUrl(`/api/InvoiceRefundMaster/EditRefund?id=${refundId}`), payload)
        mutateEdit()
        toast.success('Refund updated successfully')
      } else {
        await postFetcher(getApiUrl('/api/InvoiceRefundMaster/CreateRefund'), payload)
        toast.success('Refund created successfully')
      }
      router.push('/react-tables/transaction/invoice-refund')
    } catch (err) {
      toast.error(isEdit ? 'Failed to update refund' : 'Failed to create refund')
    } finally {
      setSaving(false)
    }
  }

  if ((isEdit && editLoading || !isEdit && sourceLoading) && !hydrated) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Icon icon='svg-spinners:ring-resize' width={32} height={32} className='text-primary' />
      </div>
    )
  }

  const title = isEdit
    ? `Edit Refund #${master.tbirm_InvoiceRefundIdRad || refundId}`
    : isItem
      ? 'Item Refund'
      : 'Payment Refund'

  return (
    <div className='space-y-5'>
      {/* Page header */}
      <Card className='p-4 md:p-5'>
        <div className='flex items-center justify-between'>
          <div>
            <h4 className='text-lg font-semibold text-ld dark:text-darklink'>{title}</h4>
            <p className='text-sm text-darklink dark:text-bodytext'>
              {isEdit
                ? 'Update the refund details below'
                : isItem
                  ? 'Return items and record refund payments for the selected invoice'
                  : 'Record a payment-only refund for the selected invoice'}
            </p>
          </div>
          <div className='flex gap-2'>
            <span className='inline-flex items-center rounded-md bg-lightwarning/40 px-3 py-1.5 text-xs font-medium text-warning dark:bg-lightwarning/10'>
              {isItem ? 'Item Refund' : 'Payment Refund'}
            </span>
          </div>
        </div>
      </Card>

      <div className='grid grid-cols-1 gap-5 xl:grid-cols-3'>
        {/* LEFT: readonly source invoice + refund builder */}
        <div className='space-y-5 xl:col-span-2'>
          {/* Readonly source invoice info */}
          <Card className='p-4 md:p-5'>
            <div className='mb-4 flex items-center gap-2'>
              <Icon icon='solar:bill-list-linear' width={20} height={20} className='text-primary' />
              <h6 className='font-semibold text-ld dark:text-darklink'>Original Invoice</h6>
            </div>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <Field label='Invoice No'>
                <Input value={master.tbim_InvoiceIdRad ? String(master.tbim_InvoiceIdRad) : ''} readOnly className='bg-lightprimary/20' />
              </Field>
              <Field label='Customer Name'>
                <Input value={master.originalInvoiceName} readOnly className='bg-lightprimary/20' />
              </Field>
              <Field label='Invoice Date'>
                <Input value={formatShortDate(master.originalInvoiceDate)} readOnly className='bg-lightprimary/20' />
              </Field>
              <Field label='Phone No'>
                <Input value={master.tbim_Phone} readOnly className='bg-lightprimary/20' />
              </Field>
              {sourceInvoiceMaster && (
                <>
                  <Field label='Vehicle'>
                    <Input
                      value={[sourceInvoiceMaster.tbim_VehicleMake, sourceInvoiceMaster.tbim_Model, sourceInvoiceMaster.tbim_Year].filter(Boolean).join(' ')}
                      readOnly
                      className='bg-lightprimary/20'
                    />
                  </Field>
                  <Field label='Paid Amount'>
                    <Input value={`$${money(sourceInvoiceMaster.tbim_PaidAmt)}`} readOnly className='bg-lightprimary/20' />
                  </Field>
                </>
              )}
            </div>
          </Card>

          {/* Refund items (only for item refund) */}
          {isItem && (
            <Card className='p-4 md:p-5'>
              <div className='mb-4 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Icon icon='solar:cart-check-linear' width={20} height={20} className='text-primary' />
                  <h6 className='font-semibold text-ld dark:text-darklink'>Items to Refund</h6>
                </div>
                <div className='flex gap-2'>
                  <Button size='sm' variant='outline' onClick={() => setRefundQtyAll(0)}>Clear All</Button>
                  <Button size='sm' variant='outline' onClick={() => setRefundQtyAll(999999)}>
                    <Icon icon='solar:check-circle-linear' width={14} height={14} className='mr-1' />
                    Refund All Items
                  </Button>
                </div>
              </div>
              <div className='overflow-x-auto rounded-lg border border-ld'>
                <Table>
                  <TableHeader>
                    <TableRow className='bg-lightprimary/20 dark:bg-darkinfo/10'>
                      <TableHead className='w-20 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400'>Refund Qty</TableHead>
                      <TableHead className='w-16 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400'>Orig Qty</TableHead>
                      <TableHead className='text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400'>Item Description</TableHead>
                      <TableHead className='text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400'>Unit Price</TableHead>
                      <TableHead className='text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400'>Tax Rate</TableHead>
                      <TableHead className='text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400'>Refund Amount</TableHead>
                      <TableHead className='text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400'>Tax Amt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {computedDetails.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className='h-24 text-center text-darklink dark:text-bodytext'>
                            No items available to refund for this invoice.
                        </TableCell>
                      </TableRow>
                    ) : (
                      computedDetails.map((d, i) => (
                        <TableRow key={`${d.tbird_ItemId}-${i}`} className='border-b border-ld transition-colors duration-200 hover:bg-lightprimary/30 last:border-b-0'>
                          <TableCell>
                            <Input
                              type='number'
                              min={0}
                              max={d.originalQty}
                              value={Number(d.refundQty) || 0}
                              onChange={(e) => setRefundQty(i, Number(e.target.value))}
                              className='h-9 w-20'
                              aria-label='Refund quantity'
                            />
                          </TableCell>
                          <TableCell className='font-medium'>{d.originalQty}</TableCell>
                          <TableCell className='max-w-xs truncate' title={itemDescription(d)}>
                            {itemDescription(d) || d.itemDisplay || '-'}
                          </TableCell>
                          <TableCell className='text-right'>${money(d.tbird_UnitPrice)}</TableCell>
                          <TableCell>
                            <div className='flex items-center justify-end'>
                              {d.tbird_Taxable ? (
                                <Input
                                  type='number'
                                  value={Number(d.taxRate) || 0}
                                  onChange={(e) => setRefundTaxRate(i, Number(e.target.value))}
                                  className='h-9 w-20 text-right'
                                  aria-label='Tax rate'
                                />
                              ) : (
                                <span className='text-darklink'>—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className='text-right font-semibold text-ld dark:text-darklink'>${money(d.tbird_LineTotal)}</TableCell>
                          <TableCell className='text-right'>${money(d.tbird_TaxAmt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {isItem && (
                <div className='mt-4 flex items-start gap-2 rounded-md bg-lightprimary/30 p-3 text-xs text-darklink dark:bg-darkinfo/10 dark:text-bodytext'>
                  <Icon icon='solar:info-circle-linear' width={16} height={16} className='shrink-0 text-primary' />
                  <span>
                    Enter the quantity being returned per item. Leave a row at 0 to exclude it from the refund.
                    The refund total below is computed only from the returned quantities.
                  </span>
                </div>
              )}
              {/* Total Return Amount running sum — always visible when items exist */}
              {computedDetails.length > 0 && (
                <div className='mt-4 flex items-center justify-end'>
                  <div className='flex items-center gap-6 rounded-lg bg-primary/10 px-6 py-3 dark:bg-primary/5'>
                    <div className='text-right'>
                      <p className='text-xs text-darklink dark:text-bodytext'>Amount</p>
                      <p className='text-base font-semibold text-ld dark:text-darklink'>${money(totals.subTotal)}</p>
                    </div>
                    <div className='text-right'>
                      <p className='text-xs text-darklink dark:text-bodytext'>Tax</p>
                      <p className='text-base font-semibold text-ld dark:text-darklink'>${money(totals.saleTax)}</p>
                    </div>
                    <div className='border-l border-ld/30 pl-6 text-right'>
                      <p className='text-xs text-darklink dark:text-bodytext'>Total Return Amount</p>
                      <p className='text-lg font-bold text-primary'>${money(totals.subTotal + totals.saleTax)}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* RIGHT: refund settings + payments + actions */}
        <div className='space-y-5'>
          {/* Refund settings */}
          <Card className='p-4 md:p-5'>
            <div className='mb-4 flex items-center gap-2'>
              <Icon icon='solar:settings-line-duotone' width={20} height={20} className='text-primary' />
              <h6 className='font-semibold text-ld dark:text-darklink'>Refund Settings</h6>
            </div>

            <div className='space-y-4'>
              <Field label='Refund Date' required>
                <Input
                  type='date'
                  value={toDateInput(master.tbirm_InvRefundDate)}
                  onChange={(e) => setMasterField('tbirm_InvRefundDate', fromDateInput(e.target.value))}
                />
              </Field>

              <div>
                <Label className='mb-1.5 block text-sm font-medium text-ld dark:text-darklink'>Refund Type</Label>
                <RadioGroup
                  value={master.tbirm_RefundType}
                  onValueChange={(v) => setMasterField('tbirm_RefundType', v)}
                  className='grid grid-cols-2 gap-2'
                >
                  {[{ v: 'F', l: 'Full' }, { v: 'P', l: 'Partial' }].map((o) => (
                    <label
                      key={o.v}
                      className='flex cursor-pointer items-center gap-2 rounded-md border border-ld px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-lightprimary'
                    >
                      <RadioGroupItem value={o.v} id={`rt-${o.v}`} />
                      <span>{o.l}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <Field label='Note'>
                <Textarea
                  rows={3}
                  value={master.tbirm_Note}
                  onChange={(e) => setMasterField('tbirm_Note', e.target.value)}
                  placeholder='Reason for refund (optional)'
                />
              </Field>

              <label className='flex cursor-pointer items-center gap-2 rounded-md border border-ld px-3 py-2 text-sm'>
                <Checkbox
                  checked={master.tbirm_Item_Delete_after_Invoice_Refund_Create}
                  onCheckedChange={(v) => setMasterField('tbirm_Item_Delete_after_Invoice_Refund_Create', v === true)}
                />
                <span className='text-ld dark:text-darklink'>Delete returned items from inventory</span>
              </label>
              {!isEdit && (
                <div className='flex items-center justify-between rounded-md bg-lightsecondary/50 px-3 py-2 dark:bg-darkinfo/10'>
                  <span className='text-sm text-darklink dark:text-bodytext'>Remaining Refundable</span>
                  <span className='font-semibold text-ld dark:text-darklink'>${money(remainingRefundable)}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Payments */}
          <Card className='p-4 md:p-5'>
            <div className='mb-4 flex items-center gap-2'>
              <Icon icon='solar:card-money-linear' width={20} height={20} className='text-primary' />
              <h6 className='font-semibold text-ld dark:text-darklink'>Refund Payments</h6>
            </div>
            <div className='mb-3 flex items-center justify-between rounded-md bg-lightsecondary/50 px-3 py-2 dark:bg-darkinfo/10'>
              <span className='text-sm text-darklink dark:text-bodytext'>Total Refund Paid</span>
              <span className='font-semibold text-warning'>${money(totals.refundAmt)}</span>
            </div>
            <Button size='sm' variant='outline' className='mb-3 w-full' onClick={openAddPaymentSheet}>
              <Icon icon='solar:add-circle-linear' width={18} height={18} />
              Add Refund Payment
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
                        No refund payments.
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((p, i) => (
                      <TableRow key={`${p.id}-${i}`} className='border-b border-ld transition-colors duration-200 hover:bg-lightprimary/30 last:border-b-0'>
                        <TableCell>{p.refundMethodName || '-'}</TableCell>
                        <TableCell className='text-right font-medium'>${money(p.tbirp_RefundAmt)}</TableCell>
                        <TableCell>{formatShortDate(p.tbirp_Date)}</TableCell>
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

          {/* Summary + actions */}
          <Card className='p-4 md:p-5'>
            <div className='space-y-2'>
              {isItem && (
                <>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-darklink dark:text-bodytext'>Sub Total</span>
                    <span className='font-semibold text-ld dark:text-darklink'>${money(totals.subTotal)}</span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-darklink dark:text-bodytext'>Tax</span>
                    <span className='font-semibold text-ld dark:text-darklink'>${money(totals.saleTax)}</span>
                  </div>
                  <div className='border-t border-ld/30 pt-2'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-darklink dark:text-bodytext'>Amount + Tax</span>
                      <span className='font-semibold text-ld dark:text-darklink'>${money(totals.subTotal + totals.saleTax)}</span>
                    </div>
                  </div>
                </>
              )}
              <div className='flex items-center justify-between text-sm'>
                <span className='text-darklink dark:text-bodytext'>Refund Payments</span>
                <span className='font-semibold text-warning'>${money(totals.refundAmt)}</span>
              </div>
              {/* Balance indicator */}
              <div className={`flex items-center justify-between rounded-md px-3 py-2 ${isBalanced ? 'bg-lightsuccess/30 dark:bg-lightsuccess/10' : 'bg-error/10'}`}>
                <span className='text-sm font-medium text-ld dark:text-darklink'>
                  {isItem ? (isBalanced ? 'Payments match total' : 'Payments do not match total') : 'Refund amount'}
                </span>
                <span className={`text-sm font-bold ${isBalanced ? 'text-success' : 'text-error'}`}>
                  {isItem ? `$${money(totals.refundAmt - totals.total)}` : `$${money(totals.refundAmt)}`}
                </span>
              </div>
              {exceedingRemaining && (
                <p className='rounded-md bg-error/10 px-3 py-2 text-xs text-error'>
                  Refund amount exceeds the remaining refundable amount of ${money(remainingRefundable)}.
                </p>
              )}
            </div>
            <div className='mt-4 flex flex-col gap-2'>
              <Button onClick={handleSave} disabled={!canSave || saving}>
                {saving ? (
                  <>
                    <Icon icon='svg-spinners:ring-resize' width={18} height={18} />
                    {isEdit ? 'Saving...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Icon icon='solar:diskette-linear' width={18} height={18} />
                    {isEdit ? 'Update Refund' : 'Save Refund'}
                  </>
                )}
              </Button>
              <Button variant='outline' onClick={handleCancel} disabled={saving}>
                <Icon icon='solar:alt-arrow-left-linear' width={18} height={18} />
                Back
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* ===== Add/Edit Payment Sheet ===== */}
      <Sheet open={paymentSheetOpen} onOpenChange={setPaymentSheetOpen}>
        <SheetContent side='right' className='w-full overflow-y-auto sm:max-w-md'>
          <SheetHeader className='px-4 pt-4'>
            <SheetTitle>{editingPaymentIndex !== null ? 'Edit Refund Payment' : 'Add Refund Payment'}</SheetTitle>
            <SheetDescription>Record how the refund was returned to the customer.</SheetDescription>
          </SheetHeader>
          <div className='space-y-4 px-4 pb-8'>
            <Field label='Refund Method' required>
              <Combobox
                options={refundMethodOptions}
                value={draftPayment.tbirp_RefundMethodId ? String(draftPayment.tbirp_RefundMethodId) : ''}
                onChange={(v) => setDraftPayment((p) => ({ ...p, tbirp_RefundMethodId: Number(v) || 0 }))}
                placeholder='Select refund method'
                searchPlaceholder='Search...'
              />
            </Field>
            <Field label='Amount' required>
              <Input
                type='number'
                value={Number(draftPayment.tbirp_RefundAmt) || 0}
                onChange={(e) => setDraftPayment((p) => ({ ...p, tbirp_RefundAmt: Number(e.target.value) || 0 }))}
              />
            </Field>
            <Field label='Date'>
              <Input
                type='date'
                value={toDateInput(draftPayment.tbirp_Date)}
                onChange={(e) => setDraftPayment((p) => ({ ...p, tbirp_Date: fromDateInput(e.target.value) }))}
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
    </div>
  )
}

// ---------- date helpers ----------
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