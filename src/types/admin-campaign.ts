export enum CampaignChannelEnum {
  WHATSAPP = 'WHATSAPP',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
}

export enum CampaignStatusEnum {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PROCESSING = 'PROCESSING',
  SENDING = 'SENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export enum CampaignAudienceEnum {
  ALL_CUSTOMERS = 'ALL_CUSTOMERS',
  ACTIVE_CUSTOMERS = 'ACTIVE_CUSTOMERS',
  INACTIVE_CUSTOMERS = 'INACTIVE_CUSTOMERS',
  PET_OWNERS_DOG = 'PET_OWNERS_DOG',
  PET_OWNERS_CAT = 'PET_OWNERS_CAT',
  HIGH_SPENDERS = 'HIGH_SPENDERS',
  CUSTOM_LIST = 'CUSTOM_LIST',
}

export enum AdminCampaignSortEnum {
  CREATED_AT_DESC = 'CREATED_AT_DESC',
  CREATED_AT_ASC = 'CREATED_AT_ASC',
  SCHEDULED_AT_DESC = 'SCHEDULED_AT_DESC',
  NAME_ASC = 'NAME_ASC',
}

export interface CampaignLog {
  id: string;
  campaignId: string;
  recipientId?: string | null;
  recipient: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'READ';
  error?: string | null;
  sentAt?: string | Date | null;
  deliveredAt?: string | Date | null;
  createdAt: string | Date;
}

export interface Campaign {
  id: string;
  name: string;
  channel: CampaignChannelEnum;
  message: string;
  subject?: string | null;
  templateId?: string | null;
  status: CampaignStatusEnum;
  audienceType: CampaignAudienceEnum;
  audienceFilter?: Record<string, any> | null;
  scheduledAt?: string | Date | null;
  sentAt?: string | Date | null;
  completedAt?: string | Date | null;
  totalTarget: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  pendingCount: number;
  deletedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
  logs?: CampaignLog[];
}

export interface AdminCampaignsQuery {
  page?: number;
  limit?: number;
  channel?: CampaignChannelEnum;
  status?: CampaignStatusEnum;
  audienceType?: CampaignAudienceEnum;
  search?: string;
  sort?: AdminCampaignSortEnum;
}

export interface AdminCampaignSummary {
  totalCampaigns: number;
  draftCount: number;
  scheduledCount: number;
  processingCount: number;
  completedCount: number;
  cancelledCount: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface AdminCampaignsResponse {
  success: boolean;
  data: {
    campaigns: Campaign[];
    pagination: PaginationMeta;
    summary: AdminCampaignSummary;
  };
}

export interface CampaignDetailResponse {
  success: boolean;
  data: Campaign;
}

export interface CampaignStats {
  campaignId: string;
  campaignName?: string;
  channel: CampaignChannelEnum;
  status: CampaignStatusEnum;
  totalTarget: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  pendingCount: number;
  deliveryRatePercentage: number;
  scheduledAt?: string | Date | null;
  sentAt?: string | Date | null;
  completedAt?: string | Date | null;
}

export interface CampaignStatsResponse {
  success: boolean;
  data: CampaignStats;
}

export interface CreateCampaignDto {
  name: string;
  channel: CampaignChannelEnum;
  message: string;
  subject?: string;
  templateId?: string;
  audienceType?: CampaignAudienceEnum;
  audienceFilter?: Record<string, any>;
  scheduledAt?: string | null;
}

export interface UpdateCampaignDto {
  name?: string;
  channel?: CampaignChannelEnum;
  message?: string;
  subject?: string | null;
  templateId?: string | null;
  audienceType?: CampaignAudienceEnum;
  audienceFilter?: Record<string, any> | null;
  scheduledAt?: string | null;
}
