// ─── Message / Customer Tab ──────────────────────────────────────────────────
export interface Message {
  ts: string
  msg: string
  cat: string
  sentiment: string
  botResponse: string
  action: string
  workflowStatus: string
  secFlag: string
  tabName?: string
}

// ─── Escalated Customers ─────────────────────────────────────────────────────
export interface EscalatedCustomer {
  phone: string
  escalatedAt: string
  reason: string
  status: 'Active' | 'Resolved' | string
  unlockedAt: string
  unlockedBy: string
  followUpSent: string
}

// ─── Pre-Qualification Queue ─────────────────────────────────────────────────
export interface PreQual {
  phone: string
  startedAt: string
  sentiment: string
  originalMessage: string
  step: string
  orderNumber: string
  issueType: string
  receivedDate: string
  status: 'Collecting Info' | 'Complete' | 'Cancelled' | string
}

// ─── Security Log ────────────────────────────────────────────────────────────
export interface SecurityEntry {
  ts: string
  phone: string
  originalMessage: string
  actionTaken: string
}

// ─── Dispatch Notifications ──────────────────────────────────────────────────
export interface Dispatch {
  ts: string
  phone: string
  orderNumber: string
  item: string
  trackingNumber: string
  courier: string
  status: string
}

// ─── Fallback Logs ───────────────────────────────────────────────────────────
export interface FallbackLog {
  ts: string
  customerMessage: string
  category: string
  sentiment: string
  botResponse: string
  actionTaken: string
  workflowStatus: string
}

// ─── COD Verification Log ────────────────────────────────────────────────────
export interface CodOrder {
  ts: string
  orderNumber: string
  customerPhone: string
  customerName: string
  orderTotal: string
  items: string
  orderId: string
  verificationSent: string
  customerReply: string
  finalStatus: string
}

// ─── Order Status Queue ──────────────────────────────────────────────────────
export interface OrderStatusQueue {
  ts: string
  phone: string
  orderNumber: string
  status: string
  agentNote: string
  [key: string]: string
}

// ─── Refund Queue ────────────────────────────────────────────────────────────
export interface RefundQueue {
  ts: string
  phone: string
  orderNumber: string
  refundAmount: string
  reason: string
  status: string
  [key: string]: string
}

// ─── Dashboard Overview ──────────────────────────────────────────────────────
export interface OverviewStats {
  messagesToday: number
  messagesAllTime: number
  escalationsToday: number
  escalationsAllTime: number
  activeEscalations: number
  preQualActive: number
  jailbreakToday: number
  jailbreakAllTime: number
  codAwaiting: number
  dispatchedToday: number
  botResolutionRate: number
  avgResponseTimeMin: number
  orderQueueActive: number
  refundQueueActive: number
}

// ─── Activity Feed Item ──────────────────────────────────────────────────────
export type ActivityType = 'message' | 'escalation' | 'cod' | 'dispatch' | 'security' | 'prequal' | 'order' | 'refund'

export interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  subtitle: string
  ts: string
  urgent?: boolean
}

// ─── Sentiment ───────────────────────────────────────────────────────────────
export type Sentiment = 'Angry' | 'Frustrated' | 'Worried' | 'Neutral' | 'Happy'

// ─── Category ────────────────────────────────────────────────────────────────
export type Category =
  | 'Order Status'
  | 'Returns and Exchange'
  | 'Damaged Item'
  | 'Minor Fault'
  | 'Sizing and Products'
  | 'Payment and Billing'
  | 'Cancellation'
  | 'General'
  | 'Unclear'

export interface SheetData {
  messages: Message[]
  escalated: EscalatedCustomer[]
  prequal: PreQual[]
  security: SecurityEntry[]
  dispatch: Dispatch[]
  fallback: FallbackLog[]
  cod: CodOrder[]
  orderQueue: OrderStatusQueue[]
  refundQueue: RefundQueue[]
  tgTabCount: number
}
