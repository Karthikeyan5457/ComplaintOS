export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface UsersRow {
          id: string
          email: string
          name: string
          password: string
          role: 'USER' | 'STAFF' | 'ADMIN'
          phone: string | null
          avatar: string | null
          isActive: boolean
          departmentId: string | null
          createdAt: string
          updatedAt: string
        }
export interface DepartmentsRow {
          id: string
          name: string
          description: string | null
          isActive: boolean
          headId: string | null
          createdAt: string
          updatedAt: string
        }
export interface CategoriesRow {
          id: string
          name: string
          description: string | null
          icon: string | null
          isActive: boolean
          parentId: string | null
          createdAt: string
          updatedAt: string
        }
export interface ComplaintsRow {
          id: string
          trackingId: string
          title: string
          description: string
          location: string | null
          contactInfo: string | null
          status: 'SUBMITTED' | 'AI_ANALYSIS' | 'CLASSIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED'
          priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          userId: string
          categoryId: string | null
          departmentId: string | null
          assignedToId: string | null
          aiAnalysis: Json | null
          aiCategory: string | null
          aiSubcategory: string | null
          aiPriority: string | null
          aiDepartment: string | null
          aiSummary: string | null
          aiSuggestedResolution: string | null
          aiSentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'VERY_NEGATIVE' | null
          aiConfidence: number | null
          aiAnalyzedAt: string | null
          aiError: string | null
          slaDeadline: string | null
          slaBreached: boolean
          resolutionNotes: string | null
          resolvedAt: string | null
          closedAt: string | null
          createdAt: string
          updatedAt: string
        }
export interface ComplaintHistoryRow {
          id: string
          complaintId: string
          action: string
          oldValue: string | null
          newValue: string | null
          userId: string | null
          note: string | null
          createdAt: string
        }
export interface CommentsRow {
          id: string
          content: string
          isInternal: boolean
          complaintId: string
          userId: string
          createdAt: string
          updatedAt: string
        }
export interface AttachmentsRow {
          id: string
          fileName: string
          originalName: string
          mimeType: string
          size: number
          url: string
          complaintId: string
          createdAt: string
        }
export interface SlaRulesRow {
          id: string
          priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          responseHours: number
          resolutionHours: number
          isActive: boolean
          createdAt: string
          updatedAt: string
        }
export interface NotificationsRow {
          id: string
          title: string
          message: string
          type: string
          isRead: boolean
          userId: string
          complaintId: string | null
          createdAt: string
        }

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UsersRow
        Insert: Partial<UsersRow>
        Update: Partial<UsersRow>
      }
      departments: {
        Row: DepartmentsRow
        Insert: Partial<DepartmentsRow>
        Update: Partial<DepartmentsRow>
      }
      categories: {
        Row: CategoriesRow
        Insert: Partial<CategoriesRow>
        Update: Partial<CategoriesRow>
      }
      complaints: {
        Row: ComplaintsRow
        Insert: Partial<ComplaintsRow>
        Update: Partial<ComplaintsRow>
      }
      complaint_history: {
        Row: ComplaintHistoryRow
        Insert: Partial<ComplaintHistoryRow>
        Update: Partial<ComplaintHistoryRow>
      }
      comments: {
        Row: CommentsRow
        Insert: Partial<CommentsRow>
        Update: Partial<CommentsRow>
      }
      attachments: {
        Row: AttachmentsRow
        Insert: Partial<AttachmentsRow>
        Update: Partial<AttachmentsRow>
      }
      sla_rules: {
        Row: SlaRulesRow
        Insert: Partial<SlaRulesRow>
        Update: Partial<SlaRulesRow>
      }
      notifications: {
        Row: NotificationsRow
        Insert: Partial<NotificationsRow>
        Update: Partial<NotificationsRow>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      role_type: 'USER' | 'STAFF' | 'ADMIN'
      priority_type: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
      complaint_status_type: 'SUBMITTED' | 'AI_ANALYSIS' | 'CLASSIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED'
      sentiment_type: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'VERY_NEGATIVE'
    }
  }
}
