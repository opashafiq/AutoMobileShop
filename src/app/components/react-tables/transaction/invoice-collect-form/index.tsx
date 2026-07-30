'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Icon } from '@iconify/react'
import { toast, ToastContainer } from 'react-toastify'

import { getApiUrl, getFetcher, postFetcher } from '@/app/api/globalFetcher'
import { getLocalISO } from '@/lib/time'
import {
  type InvoiceMasterDto,
  type InvoiceDetailsDto,
  type InvoicePaymentsDto,
  type PaymentNameType,
  type InvoiceListResponseItem,
} from '@/app/(DashboardLayout)/types/apps/invoiceMaster'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

import { Combobox, type ComboboxOption } from '../shared/Combobox'

// ---------- helpers ----------
function Field({ label, children, className, required }: { label: string; children: ReactNode; className?: string; required?: boolean }) {
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

/** Round to 2 decimal places. */
const r2 = (n: number) => Math.round(n * 100) / 100

const itemDescription = (d: {
  tbid_DepartmentName?: string; tbid_Size?: string; tbid_Brand?: string
  tbid_Series?: string; tbid_Bolt?: string; tbid_HoleS?: string; tbid_Zone?: string
}) =>
  [d.tbid_DepartmentName, d.tbid_Size, d.tbid_Brand, d.tbid_Series, d.tbid_Bolt, d.tbid_HoleS, d.tbid_Zone]
    .filter((v) => v !== null && v !== undefined && String(v).trim() !== '')
    .join(', ')

function formatShortDate(iso?: string): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
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

// ---------- Empty payment ----------
function emptyPayment(invoiceId: number): InvoicePaymentsDto {
  return {
    id: 0,
    tbip_InvoiceId: invoiceId,
    tbip_PaymentId: 0,
    tbip_PayAmt: 0,
    tbip_Date: getLocalISO(),
    tbip_PaymentType: 'P',
    tbip_LayawayId: null as unknown as number,
    tdip_fromlayaway: 'N',
    tbip_LayawayDate: null as unknown as string,
    paymentName: '',
  }
}

interface InvoiceCollectFormProps {
  invoiceId: string
}

export default function InvoiceCollectForm({ invoiceId }: InvoiceCollectFormProps) {
  const router = useRouter()
  const invId = Number(invoiceId)

  // ---- Fetch invoice data ----
  const { data: invoiceData, isLoading } = useSWR<InvoiceListResponseItem>(
    getApiUrl(`/api/InvoiceMaster/${invoiceId}`),
    getFetcher,
  )

  const { data: paymentNamesData } = useSWR<PaymentNameType[]>(
    getApiUrl('/api/PaymentNames'),
    getFetcher,
  )

  // ---- Local state ----
  const [newPayments, setNewPayments] = useState<InvoicePaymentsDto[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [draftPayment, setDraftPayment] = useState<InvoicePaymentsDto>(emptyPayment(invId))
  const [saving, setSaving] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  const master = invoiceData?.invoiceMasterDto

  // ---- Hydration (set default date for new payments once data loads) ----
  useEffect(() => {
    if (invoiceData && !hydrated) {
      setHydrated(true)
    }
  }, [invoiceData, hydrated])

  // ---- Derived payment totals ----
  const newPaymentsSum = useMemo(() =>
    r2(newPayments.reduce((sum, p) => sum + (Number(p.tbip_PayAmt) || 0), 0)),
  [newPayments])

  const currentPaidAmt = r2((master?.tbim_PaidAmt ?? 0) + newPaymentsSum)
  const currentPendingAmt = r2((master?.pendingAmount ?? 0) - newPaymentsSum)

  // ---- Payment sheet handlers ----
  const openAddPaymentSheet = () => {
    setDraftPayment({ ...emptyPayment(invId), tbip_Date: getLocalISO() })
    setSheetOpen(true)
  }

  const commitPayment = () => {
    if (!draftPayment.tbip_PaymentId) {
      toast.error('Please select a payment method')
      return
    }
    const method = paymentNamesData?.find((p) => p.id === Number(draftPayment.tbip_PaymentId))
    const amt = Number(draftPayment.tbip_PayAmt) || 0

    // Validate: cannot exceed pending amount
    if (newPaymentsSum + amt > (master?.pendingAmount ?? 0)) {
      toast.error(`Total payment (${money(newPaymentsSum + amt)}) exceeds pending amount (${money(master?.pendingAmount ?? 0)}).`)
      return
    }

    const row: InvoicePaymentsDto = {
      ...draftPayment,
      tbip_PayAmt: amt,
      paymentName: method?.tbpn_PaymentName ?? '',
    }
    setNewPayments((prev) => [...prev, row])
    setSheetOpen(false)
  }

  const removePayment = (index: number) => {
    setNewPayments((prev) => prev.filter((_, i) => i !== index))
  }

  // ---- Save payments ----
  const handleCollect = async () => {
    if (newPayments.length === 0) {
      toast.error('Please add at least one payment entry.')
      return
    }
    if (currentPendingAmt < 0) {
      toast.error('Payment amount exceeds the pending amount.')
      return
    }

    setSaving(true)
    try {
      const payload = newPayments.map((p) => ({
        id: 0,
        tbip_InvoiceId: invId,
        tbip_PaymentId: Number(p.tbip_PaymentId),
        tbip_PayAmt: Number(p.tbip_PayAmt) || 0,
        tbip_Date: p.tbip_Date,
        tbip_PaymentType: 'P',
        tbip_LayawayId: null,
        tdip_fromlayaway: 'N',
        tbip_LayawayDate: null,
        paymentName: p.paymentName,
      }))

      await postFetcher(getApiUrl('/api/InvoiceMaster/SavePayments'), payload)
      toast.success('Payment collected successfully')
      router.push('/react-tables/transaction/invoice-collect')
    } catch (err) {
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : 'Failed to save payment',
      )
    } finally {
      setSaving(false)
    }
  }

  const paymentOptions: ComboboxOption[] =
    (paymentNamesData ?? [])
      .filter((p) => p.tbpn_IsActive)
      .map((p) => ({ value: String(p.id), label: p.tbpn_PaymentName }))

  // ---- Loading state ----
  if (isLoading && !hydrated) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Icon icon='svg-spinners:ring-resize' width={32} height={32} className='text-primary' />
      </div>
    )
  }

  if (!master) {
    return (
      <div className='flex h-64 items-center justify-center text-darklink dark:text-bodytext'>
        Invoice not found.
      </div>
    )
  }

  const details: InvoiceDetailsDto[] = invoiceData?.invoiceDetailsDto ?? []

  return (
    <div className='space-y-5'>
      <ToastContainer />

      {/* Header */}
      <Card className='p-4 md:p-5'>
        <div>
          <h4 className='text-lg font-semibold text-ld dark:text-darklink'>
            Collect Payment — Invoice #{master.tbim_InvoiceIdRad}
          </h4>
          <p className='text-sm text-darklink dark:text-bodytext'>
            Record payments against this invoice to clear the pending amount.
          </p>
        </div>
      </Card>

      <div className='grid grid-cols-1 gap-5 xl:grid-cols-3'>
        {/* LEFT: read-only invoice summary */}
        <div className='space-y-5 xl:col-span-2'>
          {/* Customer & Vehicle info (read-only) */}
          <Card className='p-4 md:p-5'>
            <div className='mb-4 flex items-center gap-2'>
              <Icon icon='solar:user-id-linear' width={20} height={20} className='text-primary' />
              <h6 className='font-semibold text-ld dark:text-darklink'>Customer &amp; Vehicle</h6>
            </div>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <Field label='Customer Name'>
                <p className='rounded-md border border-ld bg-gray-50 px-3 py-2 text-sm text-ld dark:bg-dark dark:text-darklink'>
                  {master.tbim_Name || '-'}
                </p>
              </Field>
              <Field label='Phone No'>
                <p className='rounded-md border border-ld bg-gray-50 px-3 py-2 text-sm text-ld dark:bg-dark dark:text-darklink'>
                  {master.tbim_Phone || '-'}
                </p>
              </Field>
              <Field label='Company Name'>
                <p className='rounded-md border border-ld bg-gray-50 px-3 py-2 text-sm text-ld dark:bg-dark dark:text-darklink'>
                  {master.taxCompanyName || '-'}
                </p>
              </Field>
              <Field label='Email Address'>
                <p className='rounded-md border border-ld bg-gray-50 px-3 py-2 text-sm text-ld dark:bg-dark dark:text-darklink'>
                  {master.tbim_EmailAddress || '-'}
                </p>
              </Field>
              <Field label='ID #'>
                <p className='rounded-md border border-ld bg-gray-50 px-3 py-2 text-sm text-ld dark:bg-dark dark:text-darklink'>
                  {master.tbim_IDNo || '-'}
                </p>
              </Field>
              <Field label='Invoice Date'>
                <p className='rounded-md border border-ld bg-gray-50 px-3 py-2 text-sm text-ld dark:bg-dark dark:text-darklink'>
                  {formatShortDate(master.tbim_InvDate)}
                </p>
              </Field>
            </div>
            <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <Field label='Vehicle Make'>
                <p className='rounded-md border border-ld bg-gray-50 px-3 py-2 text-sm text-ld dark:bg-dark dark:text-darklink'>
                  {master.tbim_VehicleMake || '-'}
                </p>
              </Field>
              <Field label='Vehicle Model'>
                <p className='rounded-md border border-ld bg-gray-50 px-3 py-2 text-sm text-ld dark:bg-dark dark:text-darklink'>
                  {master.tbim_Model || '-'}
                </p>
              </Field>
              <Field label='Year'>
                <p className='rounded-md border border-ld bg-gray-50 px-3 py-2 text-sm text-ld dark:bg-dark dark:text-darklink'>
                  {master.tbim_Year || '-'}
                </p>
              </Field>
              <Field label='Odometer'>
                <p className='rounded-md border border-ld bg-gray-50 px-3 py-2 text-sm text-ld dark:bg-dark dark:text-darklink'>
                  {master.tbim_Odometer || '-'}
                </p>
              </Field>
              <Field label='Tread Depth'>
                <p className='rounded-md border border-ld bg-gray-50 px-3 py-2 text-sm text-ld dark:bg-dark dark:text-darklink'>
                  {master.tbim_TreadDepth || '-'}
                </p>
              </Field>
              <Field label='License Plate'>
                <p className='rounded-md border border-ld bg-gray-50 px-3 py-2 text-sm text-ld dark:bg-dark dark:text-darklink'>
                  {master.tbim_License || '-'}
                </p>
              </Field>
            </div>
          </Card>

          {/* Invoice Items (read-only) */}
          <Card className='p-4 md:p-5'>
            <div className='mb-4 flex items-center gap-2'>
              <Icon icon='solar:bill-list-linear' width={20} height={20} className='text-primary' />
              <h6 className='font-semibold text-ld dark:text-darklink'>Invoice Items</h6>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className='h-24 text-center text-darklink dark:text-bodytext'>
                        No items in this invoice.
                      </TableCell>
                    </TableRow>
                  ) : (
                    details.map((d, i) => (
                      <TableRow key={`${d.id}-${i}`} className='border-b border-ld transition-colors duration-200 last:border-b-0'>
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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Financial breakdown */}
            <div className='mt-4 flex justify-end'>
              <div className='w-full max-w-sm space-y-2.5 rounded-lg border border-ld bg-lightprimary/10 p-4 dark:bg-darkinfo/5'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-darklink dark:text-bodytext'>Sub Total</span>
                  <span className='font-semibold text-ld dark:text-darklink'>${money(master.tbim_SubTotal)}</span>
                </div>
                {(master.tbim_Labour || 0) > 0 && (
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-darklink dark:text-bodytext'>Labour</span>
                    <span className='font-semibold text-ld dark:text-darklink'>${money(master.tbim_Labour)}</span>
                  </div>
                )}
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-darklink dark:text-bodytext'>Tax</span>
                  <span className='font-semibold text-ld dark:text-darklink'>${money(master.tbim_SaleTax)}</span>
                </div>
                {(master.tbim_DisPer || 0) > 0 && (
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-darklink dark:text-bodytext'>Discount ({master.tbim_DisPer}%)</span>
                    <span className='font-semibold text-error'>−${money(master.tbim_DisAmt)}</span>
                  </div>
                )}
                {(master.tbim_AdjAmt || 0) !== 0 && (
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-darklink dark:text-bodytext'>Adjustment</span>
                    <span className='font-semibold text-ld dark:text-darklink'>${money(master.tbim_AdjAmt)}</span>
                  </div>
                )}
                <div className='mt-1 flex items-center justify-between rounded-lg bg-primary px-3.5 py-2.5'>
                  <span className='font-semibold text-white'>Total Amount</span>
                  <span className='text-xl font-bold text-white'>${money(master.tbim_Total)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT: payment collection panel */}
        <div className='space-y-5'>
          {/* Payment Status Summary */}
          <Card className='p-4 md:p-5'>
            <div className='mb-4 flex items-center gap-2'>
              <Icon icon='solar:card-money-linear' width={20} height={20} className='text-primary' />
              <h6 className='font-semibold text-ld dark:text-darklink'>Payment Summary</h6>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center justify-between rounded-md bg-lightprimary/30 px-3 py-2.5 dark:bg-darkinfo/10'>
                <span className='text-sm text-darklink dark:text-bodytext'>Total Amount</span>
                <span className='font-semibold text-ld dark:text-darklink'>${money(master.tbim_Total)}</span>
              </div>
              <div className='flex items-center justify-between rounded-md bg-lightsuccess/30 px-3 py-2.5 dark:bg-lightsuccess/10'>
                <span className='text-sm text-darklink dark:text-bodytext'>Paid Amount</span>
                <span className='font-semibold text-success'>${money(master.tbim_PaidAmt)}</span>
              </div>
              <div className='flex items-center justify-between rounded-md bg-warning/10 px-3 py-2.5 dark:bg-warning/5'>
                <span className='text-sm text-darklink dark:text-bodytext'>Pending Amount</span>
                <span className='font-semibold text-warning'>${money(master.pendingAmount)}</span>
              </div>
            </div>
          </Card>

          {/* New Payments Entry */}
          <Card className='p-4 md:p-5'>
            <div className='mb-4 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Icon icon='solar:wallet-money-linear' width={20} height={20} className='text-primary' />
                <h6 className='font-semibold text-ld dark:text-darklink'>New Payments</h6>
              </div>
              <Button size='sm' onClick={openAddPaymentSheet} disabled={currentPendingAmt <= 0}>
                <Icon icon='solar:add-circle-linear' width={18} height={18} />
                Add Payment
              </Button>
            </div>

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
                  {newPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className='h-16 text-center text-sm text-darklink dark:text-bodytext'>
                        No payments added yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    newPayments.map((p, i) => (
                      <TableRow key={`new-${i}`} className='border-b border-ld transition-colors duration-200 hover:bg-lightprimary/30 last:border-b-0'>
                        <TableCell>{p.paymentName || '-'}</TableCell>
                        <TableCell className='text-right font-medium'>${money(p.tbip_PayAmt)}</TableCell>
                        <TableCell>{formatShortDate(p.tbip_Date)}</TableCell>
                        <TableCell className='text-right'>
                          <button
                            type='button'
                            onClick={() => removePayment(i)}
                            className='flex h-7 w-7 items-center justify-center rounded-md text-ld hover:bg-error/10 hover:text-error'
                            title='Remove'
                          >
                            <Icon icon='solar:trash-bin-trash-linear' width={16} height={16} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Live recalculation summary */}
            {newPayments.length > 0 && (
              <div className='mt-4 space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-3 dark:bg-primary/10'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-darklink dark:text-bodytext'>Current Paid Amount</span>
                  <span className='font-semibold text-success'>${money(currentPaidAmt)}</span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-darklink dark:text-bodytext'>Current Pending Amount</span>
                  <span className={`font-semibold ${currentPendingAmt <= 0 ? 'text-success' : 'text-warning'}`}>
                    ${money(currentPendingAmt)}
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Actions */}
          <Card className='p-4 md:p-5'>
            <div className='flex flex-col gap-2'>
              <Button
                onClick={handleCollect}
                disabled={saving || newPayments.length === 0 || currentPendingAmt < 0}
                className='w-full'
              >
                {saving ? (
                  <>
                    <Icon icon='svg-spinners:ring-resize' width={18} height={18} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Icon icon='solar:card-money-linear' width={18} height={18} />
                    Collect Payment{newPayments.length > 0 ? ` ($${money(newPaymentsSum)})` : ''}
                  </>
                )}
              </Button>
              <Button variant='outline' onClick={() => router.push('/react-tables/transaction/invoice-collect')} disabled={saving} className='w-full'>
                <Icon icon='solar:alt-arrow-left-linear' width={18} height={18} />
                Back to List
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* ===== Add Payment Sheet ===== */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side='right' className='w-full overflow-y-auto sm:max-w-md'>
          <SheetHeader className='px-4 pt-4'>
            <SheetTitle>Add Payment</SheetTitle>
            <SheetDescription>
              Record a payment against this invoice. Maximum: ${money(master.pendingAmount)}.
            </SheetDescription>
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
                min={0}
                max={master.pendingAmount}
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
              <Button variant='outline' onClick={() => setSheetOpen(false)}>Cancel</Button>
              <Button onClick={commitPayment}>
                <Icon icon='solar:check-circle-linear' width={18} height={18} />
                Add Payment
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
