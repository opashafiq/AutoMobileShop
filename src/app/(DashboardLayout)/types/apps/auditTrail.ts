// Audit Trail types — matches backend AuditTrail API contract
// GET {API_BASE_URL}/api/AuditTrail?pageNumber=1&pageSize=10
// GET {API_BASE_URL}/api/AuditTrail/EventTypes

export interface AuditTrailItem {
  id: number
  event: string
  eventType: number
  eventTypeName: string
  entityName: string
  entityId: string
  /** JSON string of { Old?, New? } snapshots */
  changes: string | null
  description: string | null
  performedById: string
  performedByName: string
  performedAt: string
  ipAddress: string | null
  userAgent: string | null
  correlationId: string | null
  isSuccess: boolean
  /** JSON string of extra context */
  metadata: string | null
}

export interface AuditTrailPagedResponse {
  items: AuditTrailItem[]
  totalCount: number
  pageNumber: number
  totalPages: number
}

export interface AuditTrailEventType {
  key: number
  value: string
}

/** Filter fields accepted (all optional) by GET /api/AuditTrail */
export interface AuditTrailFilterState {
  event: string
  eventType: string
  entityName: string
  /** userName of the performer (NOT the id — sent as the `performedByName` param) */
  performedByName: string
  ipAddress: string
  startDate: Date | undefined
  endDate: Date | undefined
}
