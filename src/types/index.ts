export type Lang = "fr" | "en" | "ar";

export type PatientStatus = "active" | "inactive" | "at_risk";

export type RecoveryReason =
  | "inactive"
  | "treatment_interrupted"
  | "quote_pending"
  | "no_show"
  | "checkup_overdue"
  | "cancellation"
  | "follow_up";

export type Priority = "high" | "medium" | "low";

export type RecoveryStage =
  | "identified"
  | "contacted"
  | "replied"
  | "booked"
  | "visited";

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  whatsapp: boolean;
  status: PatientStatus;
  lastVisit: string | null;
  nextAppointment: string | null;
  totalVisits: number;
  noShows: number;
  lastTreatment: string;
  doctorId: string;
  recoveryReason?: RecoveryReason;
  priority?: Priority;
  recoveryStage?: RecoveryStage;
  suggestedAction?: string;
  aiRecommendation?: string;
  suggestedMessage?: string;
  notes?: string;
  preferredTime?: string;
  estimatedValue?: number;
}

export type AppointmentStatus =
  | "confirmed"
  | "pending"
  | "cancelled"
  | "completed"
  | "no_show";

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  /** ISO date, e.g. 2026-09-10 */
  date: string;
  /** HH:mm */
  time: string;
  durationMin: number;
  treatment: string;
  status: AppointmentStatus;
  notes?: string;
  createdByAi?: boolean;
  recovered?: boolean;
  value?: number;
}

export interface Doctor {
  id: string;
  name: string;
  speciality: string;
  color: "accent" | "ai" | "primary" | "warning";
}

export type MessageAuthor = "patient" | "ai" | "staff";

export interface Message {
  id: string;
  author: MessageAuthor;
  text: string;
  time: string;
  appointmentCard?: { date: string; time: string; doctor: string };
  escalated?: boolean;
}

export type ConversationTag = "appointment" | "follow_up" | "recovery" | "info";

export interface Conversation {
  id: string;
  patientId: string;
  channel: "whatsapp" | "sms";
  aiActive: boolean;
  unread: number;
  tag: ConversationTag;
  needsHuman: boolean;
  updatedAt: string;
  messages: Message[];
}

export interface OpenSlot {
  id: string;
  date: string;
  time: string;
  doctorId: string;
  durationMin: number;
  reason: "cancellation" | "no_show" | "gap";
  matchIds: string[];
  filled: boolean;
  value: number;
}

export interface WaitlistEntry {
  id: string;
  patientId: string;
  wants: string;
  treatment: string;
  createdAt: string;
  flexibility: "high" | "medium" | "low";
}

export type FollowUpState = "scheduled" | "active" | "completed";

export interface FollowUpCampaign {
  id: string;
  name: string;
  trigger: string;
  state: FollowUpState;
  audience: number;
  contacted: number;
  replied: number;
  booked: number;
  steps: { label: string; detail: string; kind: "trigger" | "wait" | "message" | "condition" | "goal" }[];
  nextRun?: string;
}

export interface NoShowRecord {
  id: string;
  patientId: string;
  appointmentDate: string;
  appointmentTime: string;
  treatment: string;
  reason: string;
  previousNoShows: number;
  status: "new" | "contacted" | "rescheduled" | "monitoring";
}

export interface Notification {
  id: string;
  title: string;
  detail?: string;
  time: string;
  kind: "slot" | "match" | "reply" | "human" | "ai";
  read: boolean;
}
