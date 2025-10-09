import { db } from "./db";
import { auditLogs } from "@shared/schema";

export async function logAudit(params: {
  hotelId?: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  errorMessage?: string;
}) {
  try {
    await db.insert(auditLogs).values({
      hotelId: params.hotelId,
      userId: params.userId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      details: params.details || {},
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      success: params.success !== false,
      errorMessage: params.errorMessage,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
    // Don't throw - audit failure shouldn't break operations
  }
}
