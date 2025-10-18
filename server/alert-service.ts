/**
 * Alert Service for sending security notifications
 *
 * FREE SMTP OPTIONS for production:
 * 1. Gmail SMTP (Free, 500 emails/day):
 *    - Host: smtp.gmail.com, Port: 587
 *    - Enable "App Passwords" in Gmail settings
 *    - Use app password instead of regular password
 *
 * 2. SendGrid (Free tier: 100 emails/day):
 *    - Host: smtp.sendgrid.net, Port: 587
 *    - Create free account at sendgrid.com
 *    - Use API key as password
 *
 * 3. Mailgun (Free tier: 100 emails/day):
 *    - Host: smtp.mailgun.org, Port: 587
 *    - Create free account at mailgun.com
 *
 * 4. Brevo (formerly Sendinblue) (Free: 300 emails/day):
 *    - Host: smtp-relay.brevo.com, Port: 587
 *    - Create free account at brevo.com
 *
 * IMPORTANT: All email addresses (from/to) are configured in database
 * by superadmin via Security Settings page. NO hardcoding!
 */

import nodemailer from 'nodemailer';
import { storage } from './storage';
import { logAudit } from './audit';

type AlertType = 'new_device' | 'new_location' | 'large_transaction' | 'suspicious_activity';

interface AlertData {
  [key: string]: any;
}

interface SendEmailParams {
  from: string;
  to: string;
  subject: string;
  html: string;
  smtpConfig: {
    host: string;
    port: number;
    user: string;
    password: string;
  };
}

interface SendSecurityAlertParams {
  hotelId: string;
  userId: string;
  alertType: AlertType;
  alertData: AlertData;
}

interface AlertResult {
  success: boolean;
  error?: string;
}

class AlertService {
  async sendSecurityAlert(params: SendSecurityAlertParams): Promise<AlertResult> {
    const { hotelId, userId, alertType, alertData } = params;

    try {
      // Fetch security settings from database
      const securitySettings = await storage.getSecuritySettings(hotelId);
      
      if (!securitySettings || !securitySettings.ownerEmail) {
        console.warn(`[AlertService] No security settings or owner email configured for hotel ${hotelId}`);
        return { success: false, error: 'No security settings configured' };
      }

      // Check if this alert type is enabled
      const isEnabled = await this.shouldSendAlert(hotelId, alertType);
      if (!isEnabled) {
        console.log(`[AlertService] Alert type ${alertType} is disabled for hotel ${hotelId}`);
        return { success: false, error: 'Alert type is disabled' };
      }

      // Validate SMTP configuration
      if (!securitySettings.smtpHost || !securitySettings.smtpUser || !securitySettings.smtpPassword) {
        console.warn(`[AlertService] Incomplete SMTP configuration for hotel ${hotelId}`);
        return { success: false, error: 'Incomplete SMTP configuration' };
      }

      // Fetch hotel details
      const hotel = await storage.getHotel(hotelId);
      if (!hotel) {
        console.error(`[AlertService] Hotel ${hotelId} not found`);
        return { success: false, error: 'Hotel not found' };
      }

      // Fetch user (staff) details
      const user = await storage.getUser(userId);
      if (!user) {
        console.error(`[AlertService] User ${userId} not found`);
        return { success: false, error: 'User not found' };
      }

      // Build email subject and HTML body
      const { subject, html } = this.formatAlertEmail(
        alertType,
        alertData,
        hotel.name,
        user.fullName || user.username
      );

      // Get SMTP configuration from security settings
      const smtpConfig = {
        host: securitySettings.smtpHost,
        port: securitySettings.smtpPort || 587,
        user: securitySettings.smtpUser,
        password: securitySettings.smtpPassword
      };

      // Send email using configured SMTP
      const emailResult = await this.sendEmail({
        from: securitySettings.smtpUser, // FROM email from database - NO HARDCODING
        to: securitySettings.ownerEmail, // TO email from database - NO HARDCODING
        subject,
        html,
        smtpConfig
      });

      // Log the alert attempt in audit logs
      await logAudit({
        userId,
        hotelId,
        action: 'send_security_alert',
        resourceType: 'security_alert',
        resourceId: userId,
        details: {
          alertType,
          alertData,
          emailSent: emailResult.success,
          error: emailResult.error
        },
        success: emailResult.success,
        errorMessage: emailResult.error
      });

      return emailResult;
    } catch (error) {
      console.error('[AlertService] Error sending security alert:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log failed attempt
      await logAudit({
        userId,
        hotelId,
        action: 'send_security_alert',
        resourceType: 'security_alert',
        resourceId: userId,
        details: { alertType, alertData },
        success: false,
        errorMessage
      });

      return { success: false, error: errorMessage };
    }
  }

  async sendEmail(params: SendEmailParams): Promise<AlertResult> {
    const { from, to, subject, html, smtpConfig } = params;

    try {
      // Create nodemailer transporter with SMTP config
      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.port === 465, // true for 465, false for other ports
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.password
        }
      });

      // Send email
      await transporter.sendMail({
        from,
        to,
        subject,
        html
      });

      console.log(`[AlertService] Email sent successfully to ${to}`);
      return { success: true };
    } catch (error) {
      console.error('[AlertService] Error sending email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  formatAlertEmail(
    alertType: AlertType,
    alertData: AlertData,
    hotelName: string,
    staffName: string
  ): { subject: string; html: string } {
    let subject = '';
    let content = '';

    switch (alertType) {
      case 'new_device':
        subject = `🔒 Security Alert: New Device Login Detected - ${hotelName}`;
        content = `
          <h2 style="color: #ef4444;">New Device Login Detected</h2>
          <p>A staff member has logged in from a new device.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f3f4f6;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Staff Member:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${staffName}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Browser:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${alertData.browser || 'Unknown'}</td>
            </tr>
            <tr style="background-color: #f3f4f6;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Operating System:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${alertData.os || 'Unknown'}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Device Fingerprint:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-family: monospace; font-size: 12px;">${alertData.deviceFingerprint || 'N/A'}</td>
            </tr>
            <tr style="background-color: #f3f4f6;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Login Time:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${alertData.loginTime || new Date().toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Location:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${alertData.location || 'Unknown'}</td>
            </tr>
            <tr style="background-color: #f3f4f6;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">IP Address:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${alertData.ip || 'N/A'}</td>
            </tr>
          </table>
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #92400e;">Recommended Actions:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Verify with ${staffName} if this login was authorized</li>
              <li>Check if the device and location are legitimate</li>
              <li>Review recent activity from this user</li>
              <li>If suspicious, immediately deactivate the user account</li>
            </ul>
          </div>
        `;
        break;

      case 'new_location':
        subject = `🌍 Security Alert: Login from New Location - ${hotelName}`;
        content = `
          <h2 style="color: #3b82f6;">Login from New Location</h2>
          <p>A staff member has logged in from a new location.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f3f4f6;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Staff Member:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${staffName}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">New Location:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${alertData.location || 'Unknown'}</td>
            </tr>
            <tr style="background-color: #f3f4f6;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">City:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${alertData.city || 'Unknown'}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Country:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${alertData.country || 'Unknown'}</td>
            </tr>
            <tr style="background-color: #f3f4f6;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">IP Address:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${alertData.ip || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Login Time:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${alertData.loginTime || new Date().toLocaleString()}</td>
            </tr>
            <tr style="background-color: #f3f4f6;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Device Info:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${alertData.browser || 'Unknown'} on ${alertData.os || 'Unknown'}</td>
            </tr>
          </table>
          <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">Recommended Actions:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Confirm with ${staffName} about this login location</li>
              <li>Verify if the staff member is traveling or working remotely</li>
              <li>Check for any unusual activity patterns</li>
              <li>Consider requiring password reset if suspicious</li>
            </ul>
          </div>
        `;
        break;

      case 'large_transaction':
        subject = `💰 Security Alert: Large Transaction Detected - ${hotelName}`;
        content = `
          <h2 style="color: #10b981;">Large Transaction Detected</h2>
          <p>A large financial transaction has been processed.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f3f4f6;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Processed By:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${staffName}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Transaction Amount:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-size: 18px; font-weight: bold; color: #10b981;">Rs. ${alertData.amount || '0'}</td>
            </tr>
            <tr style="background-color: #f3f4f6;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Transaction Type:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${alertData.type || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Payment Method:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${alertData.paymentMethod || 'N/A'}</td>
            </tr>
            <tr style="background-color: #f3f4f6;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Transaction Time:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${alertData.time || new Date().toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Description:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${alertData.description || 'No description provided'}</td>
            </tr>
            <tr style="background-color: #f3f4f6;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Reference ID:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-family: monospace;">${alertData.referenceId || 'N/A'}</td>
            </tr>
          </table>
          <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #065f46;">Recommended Actions:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Review the transaction details for accuracy</li>
              <li>Verify the payment method and authorization</li>
              <li>Contact ${staffName} to confirm the transaction</li>
              <li>Check supporting documentation (receipts, invoices)</li>
              <li>Monitor for any unusual patterns</li>
            </ul>
          </div>
        `;
        break;

      case 'suspicious_activity':
        subject = `⚠️ Security Alert: Suspicious Activity Detected - ${hotelName}`;
        content = `
          <h2 style="color: #dc2626;">Suspicious Activity Detected</h2>
          <p>Unusual activity has been detected in your hotel system.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f3f4f6;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Staff Member:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${staffName}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Activity Type:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${alertData.activityType || 'Unknown'}</td>
            </tr>
            <tr style="background-color: #f3f4f6;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Description:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${alertData.description || 'No description available'}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Time Detected:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${alertData.time || new Date().toLocaleString()}</td>
            </tr>
            <tr style="background-color: #f3f4f6;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Location/IP:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${alertData.location || 'N/A'} (${alertData.ip || 'N/A'})</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Additional Details:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${JSON.stringify(alertData.details || {}, null, 2)}</td>
            </tr>
          </table>
          <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #991b1b;">⚠️ IMMEDIATE ACTIONS REQUIRED:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li><strong>Investigate immediately</strong> - Review all recent activities by ${staffName}</li>
              <li><strong>Contact the staff member</strong> - Verify if the activity was authorized</li>
              <li><strong>Check system logs</strong> - Look for other suspicious patterns</li>
              <li><strong>Consider temporary suspension</strong> - If unauthorized, deactivate the account immediately</li>
              <li><strong>Document everything</strong> - Keep records for security audit</li>
            </ul>
          </div>
        `;
        break;

      default:
        subject = `🔔 Security Alert - ${hotelName}`;
        content = `
          <h2>Security Alert</h2>
          <p>A security event has been detected.</p>
          <p><strong>Staff Member:</strong> ${staffName}</p>
          <p><strong>Alert Type:</strong> ${alertType}</p>
          <p><strong>Details:</strong> ${JSON.stringify(alertData, null, 2)}</p>
        `;
    }

    // Wrap content in professional email template
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Security Alert</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🏨 ${hotelName}</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Hotel Management System</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          ${content}
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">This is an automated security alert from your Hotel Management System</p>
          <p style="margin: 5px 0 0 0;">Please do not reply to this email</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;">
          <p style="margin: 0; font-size: 12px;">© ${new Date().getFullYear()} ${hotelName}. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    return { subject, html };
  }

  async shouldSendAlert(hotelId: string, alertType: AlertType): Promise<boolean> {
    try {
      const securitySettings = await storage.getSecuritySettings(hotelId);
      
      if (!securitySettings) {
        return false;
      }

      switch (alertType) {
        case 'new_device':
          return securitySettings.alertOnNewDevice ?? false;
        case 'new_location':
          return securitySettings.alertOnNewLocation ?? false;
        case 'large_transaction':
          return securitySettings.alertOnLargeTransaction ?? false;
        case 'suspicious_activity':
          return true; // Always send suspicious activity alerts
        default:
          return false;
      }
    } catch (error) {
      console.error('[AlertService] Error checking alert settings:', error);
      return false;
    }
  }

  async sendDailySummaryEmail(hotelId: string): Promise<AlertResult> {
    try {
      // Fetch security settings from database
      const securitySettings = await storage.getSecuritySettings(hotelId);
      
      if (!securitySettings || !securitySettings.ownerEmail) {
        console.warn(`[AlertService] No security settings or owner email configured for hotel ${hotelId}`);
        return { success: false, error: 'No security settings configured' };
      }

      // Validate SMTP configuration
      if (!securitySettings.smtpHost || !securitySettings.smtpUser || !securitySettings.smtpPassword) {
        console.warn(`[AlertService] Incomplete SMTP configuration for hotel ${hotelId}`);
        return { success: false, error: 'Incomplete SMTP configuration' };
      }

      // Fetch hotel details
      const hotel = await storage.getHotel(hotelId);
      if (!hotel) {
        console.error(`[AlertService] Hotel ${hotelId} not found`);
        return { success: false, error: 'Hotel not found' };
      }

      // Calculate yesterday's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(23, 59, 59, 999);

      // Fetch yesterday's data
      const [
        allTransactions,
        allWastages,
        allAttendance,
        pendingLeaveRequests
      ] = await Promise.all([
        storage.getTransactionsByHotel(hotelId),
        storage.getWastagesByHotel(hotelId),
        storage.getAllAttendanceByHotel(hotelId, yesterday, yesterdayEnd),
        storage.getPendingLeaveRequestsForApprover('owner', hotelId)
      ]);

      // Filter transactions for yesterday
      const yesterdayTransactions = allTransactions.filter((t: any) => {
        const tDate = new Date(t.createdAt);
        return tDate >= yesterday && tDate <= yesterdayEnd;
      });

      // Filter wastages for yesterday
      const yesterdayWastages = allWastages.filter((w: any) => {
        const wDate = new Date(w.createdAt);
        return wDate >= yesterday && wDate <= yesterdayEnd;
      });

      // Calculate financial metrics
      const revenue = yesterdayTransactions
        .filter((t: any) => t.txnType === 'revenue' || t.txnType === 'room_revenue' || t.txnType === 'restaurant_revenue')
        .reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);

      const expenses = yesterdayTransactions
        .filter((t: any) => t.txnType === 'expense')
        .reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);

      const profit = revenue - expenses;

      // Count security alerts (new devices and new locations from yesterday)
      const securityAlertCount = yesterdayTransactions.filter((t: any) => 
        t.details?.isNewDevice || t.details?.isNewLocation
      ).length;

      // Get pending approvals (transactions that require approval but haven't been approved yet)
      const pendingTransactionApprovals = allTransactions.filter((t: any) => t.requiresApproval && !t.approvedBy).length;
      const missingBillProofs = allTransactions.filter((t: any) => !t.billPhotoUrl && !t.billPdfUrl && t.txnType === 'expense').length;

      // Build formatted HTML email
      const { subject, html } = this.formatDailySummaryEmail({
        hotelName: hotel.name,
        date: yesterday,
        totalTransactions: yesterdayTransactions.length,
        revenue,
        expenses,
        profit,
        wastagesCount: yesterdayWastages.length,
        securityAlertsCount: securityAlertCount,
        attendanceSummary: {
          present: allAttendance.filter((a: any) => a.status === 'present').length,
          absent: allAttendance.filter((a: any) => a.status === 'absent').length,
          late: allAttendance.filter((a: any) => a.status === 'late').length
        },
        pendingApprovals: {
          transactions: pendingTransactionApprovals,
          leaveRequests: pendingLeaveRequests.length,
          missingBillProofs
        }
      });

      // Get SMTP configuration from security settings
      const smtpConfig = {
        host: securitySettings.smtpHost,
        port: securitySettings.smtpPort || 587,
        user: securitySettings.smtpUser,
        password: securitySettings.smtpPassword
      };

      // Send email using configured SMTP
      const emailResult = await this.sendEmail({
        from: securitySettings.smtpUser,
        to: securitySettings.ownerEmail,
        subject,
        html,
        smtpConfig
      });

      // Log the summary email attempt in audit logs
      await logAudit({
        userId: null as any,
        hotelId,
        action: 'send_daily_summary',
        resourceType: 'email',
        resourceId: hotelId,
        details: {
          emailSent: emailResult.success,
          error: emailResult.error,
          date: yesterday.toISOString()
        },
        success: emailResult.success,
        errorMessage: emailResult.error
      });

      if (emailResult.success) {
        console.log(`[AlertService] Daily summary email sent successfully to ${securitySettings.ownerEmail}`);
      }

      return emailResult;
    } catch (error) {
      console.error('[AlertService] Error sending daily summary email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log failed attempt
      await logAudit({
        userId: null as any,
        hotelId,
        action: 'send_daily_summary',
        resourceType: 'email',
        resourceId: hotelId,
        details: { error: errorMessage },
        success: false,
        errorMessage
      });

      return { success: false, error: errorMessage };
    }
  }

  formatDailySummaryEmail(data: {
    hotelName: string;
    date: Date;
    totalTransactions: number;
    revenue: number;
    expenses: number;
    profit: number;
    wastagesCount: number;
    securityAlertsCount: number;
    attendanceSummary: {
      present: number;
      absent: number;
      late: number;
    };
    pendingApprovals: {
      transactions: number;
      leaveRequests: number;
      missingBillProofs: number;
    };
  }): { subject: string; html: string } {
    const { hotelName, date, totalTransactions, revenue, expenses, profit, wastagesCount, securityAlertsCount, attendanceSummary, pendingApprovals } = data;

    const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const subject = `📊 Daily Summary Report - ${hotelName} - ${dateStr}`;

    const profitColor = profit >= 0 ? '#10b981' : '#ef4444';
    const profitIcon = profit >= 0 ? '📈' : '📉';

    const content = `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">📊 Daily Summary Report</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">${dateStr}</p>
      </div>

      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
        <!-- Executive Summary -->
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
          <h2 style="margin-top: 0; color: #1f2937; font-size: 20px;">📋 Executive Summary</h2>
          <p style="margin: 0; font-size: 16px; color: #4b5563;">
            Total Transactions: <strong>${totalTransactions}</strong>
          </p>
        </div>

        <!-- Financial Highlights -->
        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
          <h2 style="margin-top: 0; color: #065f46; font-size: 20px;">💰 Financial Highlights</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr style="background-color: #d1fae5;">
              <td style="padding: 12px; font-weight: bold; color: #065f46;">Total Revenue:</td>
              <td style="padding: 12px; text-align: right; font-size: 18px; font-weight: bold; color: #10b981;">Rs. ${revenue.toLocaleString()}</td>
            </tr>
            <tr style="background-color: #fee2e2;">
              <td style="padding: 12px; font-weight: bold; color: #991b1b;">Total Expenses:</td>
              <td style="padding: 12px; text-align: right; font-size: 18px; font-weight: bold; color: #ef4444;">Rs. ${expenses.toLocaleString()}</td>
            </tr>
            <tr style="background-color: ${profit >= 0 ? '#d1fae5' : '#fee2e2'};">
              <td style="padding: 12px; font-weight: bold; color: #1f2937;">Net Profit/Loss:</td>
              <td style="padding: 12px; text-align: right; font-size: 20px; font-weight: bold; color: ${profitColor};">
                ${profitIcon} Rs. ${profit.toLocaleString()}
              </td>
            </tr>
          </table>
        </div>

        <!-- Operations Highlights -->
        <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
          <h2 style="margin-top: 0; color: #1e40af; font-size: 20px;">🏨 Operations Highlights</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr style="background-color: #bfdbfe;">
              <td style="padding: 12px; font-weight: bold;">Staff Attendance:</td>
              <td style="padding: 12px; text-align: right;">
                Present: <strong style="color: #10b981;">${attendanceSummary.present}</strong> | 
                Absent: <strong style="color: #ef4444;">${attendanceSummary.absent}</strong> | 
                Late: <strong style="color: #f59e0b;">${attendanceSummary.late}</strong>
              </td>
            </tr>
            <tr style="background-color: #dbeafe;">
              <td style="padding: 12px; font-weight: bold;">Wastages Reported:</td>
              <td style="padding: 12px; text-align: right; font-size: 18px; font-weight: bold;">${wastagesCount}</td>
            </tr>
          </table>
        </div>

        <!-- Security Highlights -->
        ${securityAlertsCount > 0 ? `
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
          <h2 style="margin-top: 0; color: #92400e; font-size: 20px;">🔒 Security Highlights</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr style="background-color: #fde68a;">
              <td style="padding: 12px; font-weight: bold;">Security Alerts:</td>
              <td style="padding: 12px; text-align: right; font-size: 18px; font-weight: bold; color: #f59e0b;">${securityAlertsCount}</td>
            </tr>
          </table>
          <p style="margin: 10px 0 0 0; color: #92400e; font-size: 14px;">
            ⚠️ New device/location logins detected. Review audit logs for details.
          </p>
        </div>
        ` : ''}

        <!-- Action Items -->
        ${(pendingApprovals.transactions + pendingApprovals.leaveRequests + pendingApprovals.missingBillProofs) > 0 ? `
        <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
          <h2 style="margin-top: 0; color: #991b1b; font-size: 20px;">⚠️ Action Items Required</h2>
          <ul style="margin: 10px 0; padding-left: 20px; color: #991b1b;">
            ${pendingApprovals.transactions > 0 ? `<li><strong>${pendingApprovals.transactions}</strong> transactions pending your approval</li>` : ''}
            ${pendingApprovals.leaveRequests > 0 ? `<li><strong>${pendingApprovals.leaveRequests}</strong> leave requests pending your approval</li>` : ''}
            ${pendingApprovals.missingBillProofs > 0 ? `<li><strong>${pendingApprovals.missingBillProofs}</strong> expenses missing bill proof documentation</li>` : ''}
          </ul>
        </div>
        ` : `
        <div style="background-color: #d1fae5; border-left: 4px solid #10b981; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
          <h2 style="margin-top: 0; color: #065f46; font-size: 20px;">✅ All Clear</h2>
          <p style="margin: 0; color: #065f46;">No pending action items at this time.</p>
        </div>
        `}

        <!-- Link to Dashboard -->
        <div style="text-align: center; margin-top: 30px;">
          <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px;">
            View detailed analytics and audit logs in your dashboard
          </p>
          <a href="${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : '#'}" 
             style="display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
            View Full Dashboard
          </a>
        </div>
      </div>
    `;

    // Wrap content in professional email template
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Daily Summary Report</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 650px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        ${content}
        
        <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">This is an automated daily summary from your Hotel Management System</p>
          <p style="margin: 5px 0 0 0;">Please do not reply to this email</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;">
          <p style="margin: 0; font-size: 12px;">© ${new Date().getFullYear()} ${hotelName}. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    return { subject, html };
  }
}

export const alertService = new AlertService();
