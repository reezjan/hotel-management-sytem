import { db } from './db';
import { wastages, transactions, loginHistory, userSessions, securityAlerts, inventoryItems, users, hotels } from '@shared/schema';
import { eq, and, gte, sql, desc, count } from 'drizzle-orm';
import { alertService } from './alert-service';

interface SuspiciousPattern {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  details: any;
  userId?: string;
  userName?: string;
}

interface WastagePattern {
  itemId: string;
  itemName: string;
  count: number;
  totalValue: number;
}

export class PatternDetector {
  
  async detectSuspiciousWastage(hotelId: string, userId: string): Promise<SuspiciousPattern[]> {
    const patterns: SuspiciousPattern[] = [];
    
    try {
      // Get date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Get date 60 days ago for comparison
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      // Get all wastages by user in last 30 days
      const recentWastages = await db
        .select({
          id: wastages.id,
          itemId: wastages.itemId,
          itemName: inventoryItems.name,
          qty: wastages.qty,
          estimatedValue: wastages.estimatedValue,
          reason: wastages.reason,
          createdAt: wastages.createdAt
        })
        .from(wastages)
        .leftJoin(inventoryItems, eq(wastages.itemId, inventoryItems.id))
        .where(
          and(
            eq(wastages.hotelId, hotelId),
            eq(wastages.recordedBy, userId),
            gte(wastages.createdAt, thirtyDaysAgo)
          )
        );

      // Get previous 30 days wastages for frequency comparison
      const previousWastages = await db
        .select({
          id: wastages.id
        })
        .from(wastages)
        .where(
          and(
            eq(wastages.hotelId, hotelId),
            eq(wastages.recordedBy, userId),
            gte(wastages.createdAt, sixtyDaysAgo),
            sql`${wastages.createdAt} < ${thirtyDaysAgo}`
          )
        );

      // Check 1: Same item wasted more than 3 times
      const itemCounts = new Map<string, WastagePattern>();
      
      for (const wastage of recentWastages) {
        if (wastage.itemId) {
          const existing = itemCounts.get(wastage.itemId);
          const value = parseFloat(wastage.estimatedValue?.toString() || '0');
          
          if (existing) {
            existing.count += 1;
            existing.totalValue += value;
          } else {
            itemCounts.set(wastage.itemId, {
              itemId: wastage.itemId,
              itemName: wastage.itemName || 'Unknown Item',
              count: 1,
              totalValue: value
            });
          }
        }
      }

      for (const [itemId, pattern] of Array.from(itemCounts)) {
        if (pattern.count > 3) {
          patterns.push({
            type: 'repeated_wastage',
            severity: pattern.count > 5 ? 'high' : 'medium',
            description: `Item "${pattern.itemName}" wasted ${pattern.count} times in last 30 days`,
            details: {
              itemId,
              itemName: pattern.itemName,
              count: pattern.count,
              totalValue: pattern.totalValue,
              period: '30 days'
            },
            userId
          });
        }
      }

      // Check 2: Total wastage value exceeds threshold (Rs. 50,000)
      const totalValue = recentWastages.reduce((sum, w) => {
        return sum + parseFloat(w.estimatedValue?.toString() || '0');
      }, 0);

      if (totalValue > 50000) {
        patterns.push({
          type: 'high_wastage_value',
          severity: totalValue > 100000 ? 'critical' : 'high',
          description: `Total wastage value of Rs. ${totalValue.toLocaleString()} exceeds threshold in last 30 days`,
          details: {
            totalValue,
            threshold: 50000,
            wastageCount: recentWastages.length,
            period: '30 days'
          },
          userId
        });
      }

      // Check 3: Wastage frequency increased significantly
      const recentCount = recentWastages.length;
      const previousCount = previousWastages.length;
      
      if (previousCount > 0) {
        const increasePercent = ((recentCount - previousCount) / previousCount) * 100;
        
        if (increasePercent > 50) {
          patterns.push({
            type: 'wastage_frequency_spike',
            severity: increasePercent > 100 ? 'high' : 'medium',
            description: `Wastage frequency increased by ${increasePercent.toFixed(0)}% compared to previous period`,
            details: {
              recentCount,
              previousCount,
              increasePercent: increasePercent.toFixed(2),
              period: '30 days'
            },
            userId
          });
        }
      }

    } catch (error) {
      console.error('[PatternDetector] Error detecting suspicious wastage:', error);
    }

    return patterns;
  }

  async detectSuspiciousTransactions(hotelId: string, userId: string): Promise<SuspiciousPattern[]> {
    const patterns: SuspiciousPattern[] = [];

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get all transactions by user
      const userTransactions = await db
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.hotelId, hotelId),
            eq(transactions.createdBy, userId),
            gte(transactions.createdAt, thirtyDaysAgo)
          )
        )
        .orderBy(desc(transactions.createdAt));

      // Check 1: Large cash_out without bill proof
      const largeCashOutNoProof = userTransactions.filter(txn => {
        const amount = parseFloat(txn.amount?.toString() || '0');
        return (
          txn.txnType === 'cash_out' &&
          amount > 10000 &&
          !txn.billPhotoUrl &&
          !txn.billPdfUrl &&
          !txn.billInvoiceNumber
        );
      });

      if (largeCashOutNoProof.length > 0) {
        const totalAmount = largeCashOutNoProof.reduce((sum, txn) => {
          return sum + parseFloat(txn.amount?.toString() || '0');
        }, 0);

        patterns.push({
          type: 'cash_out_no_proof',
          severity: largeCashOutNoProof.length > 3 ? 'critical' : 'high',
          description: `${largeCashOutNoProof.length} large cash-out transactions (total Rs. ${totalAmount.toLocaleString()}) without bill proof`,
          details: {
            count: largeCashOutNoProof.length,
            totalAmount,
            transactions: largeCashOutNoProof.map(t => ({
              id: t.id,
              amount: t.amount,
              purpose: t.purpose,
              createdAt: t.createdAt
            }))
          },
          userId
        });
      }

      // Check 2: Multiple voids in short time
      const voidedTransactions = userTransactions.filter(txn => txn.isVoided);
      
      if (voidedTransactions.length > 5) {
        // Check if they occurred within a short timeframe (e.g., 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentVoids = voidedTransactions.filter(txn => {
          if (!txn.voidedAt) return false;
          const voidDate = new Date(txn.voidedAt);
          return voidDate >= sevenDaysAgo;
        });

        if (recentVoids.length >= 3) {
          patterns.push({
            type: 'multiple_voids',
            severity: recentVoids.length > 5 ? 'high' : 'medium',
            description: `${recentVoids.length} transactions voided in last 7 days`,
            details: {
              count: recentVoids.length,
              totalVoids30Days: voidedTransactions.length,
              voidedTransactions: recentVoids.map(t => ({
                id: t.id,
                amount: t.amount,
                voidReason: t.voidReason,
                voidedAt: t.voidedAt
              }))
            },
            userId
          });
        }
      }

      // Check 3: Transaction amounts are round numbers frequently (possible cash theft)
      const roundNumberTxns = userTransactions.filter(txn => {
        const amount = parseFloat(txn.amount?.toString() || '0');
        // Check if amount is divisible by 1000 or 5000
        return amount > 0 && (amount % 5000 === 0 || amount % 1000 === 0);
      });

      const roundNumberPercent = userTransactions.length > 0 
        ? (roundNumberTxns.length / userTransactions.length) * 100 
        : 0;

      if (roundNumberPercent > 70 && userTransactions.length > 10) {
        patterns.push({
          type: 'suspicious_round_numbers',
          severity: roundNumberPercent > 90 ? 'high' : 'medium',
          description: `${roundNumberPercent.toFixed(0)}% of transactions are round numbers (possible manipulation)`,
          details: {
            roundNumberCount: roundNumberTxns.length,
            totalTransactions: userTransactions.length,
            percentage: roundNumberPercent.toFixed(2),
            examples: roundNumberTxns.slice(0, 5).map(t => ({
              id: t.id,
              amount: t.amount,
              purpose: t.purpose
            }))
          },
          userId
        });
      }

      // Check 4: Cash deposits don't match cash_in amounts
      const cashInTxns = userTransactions.filter(txn => txn.txnType === 'cash_in');
      const cashDepositTxns = userTransactions.filter(txn => txn.txnType === 'deposit');

      const totalCashIn = cashInTxns.reduce((sum, txn) => {
        return sum + parseFloat(txn.amount?.toString() || '0');
      }, 0);

      const totalDeposits = cashDepositTxns.reduce((sum, txn) => {
        return sum + parseFloat(txn.amount?.toString() || '0');
      }, 0);

      if (cashInTxns.length > 5 && totalCashIn > 0) {
        const difference = Math.abs(totalCashIn - totalDeposits);
        const percentDiff = (difference / totalCashIn) * 100;

        if (percentDiff > 20 && difference > 10000) {
          patterns.push({
            type: 'cash_deposit_mismatch',
            severity: percentDiff > 50 ? 'critical' : 'high',
            description: `Cash-in and deposit amounts mismatch by Rs. ${difference.toLocaleString()} (${percentDiff.toFixed(0)}%)`,
            details: {
              totalCashIn,
              totalDeposits,
              difference,
              percentDiff: percentDiff.toFixed(2),
              cashInCount: cashInTxns.length,
              depositCount: cashDepositTxns.length
            },
            userId
          });
        }
      }

    } catch (error) {
      console.error('[PatternDetector] Error detecting suspicious transactions:', error);
    }

    return patterns;
  }

  async detectImpossibleTravel(userId: string): Promise<SuspiciousPattern[]> {
    const patterns: SuspiciousPattern[] = [];

    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Get login history for user
      const logins = await db
        .select()
        .from(loginHistory)
        .where(
          and(
            eq(loginHistory.userId, userId),
            gte(loginHistory.loginAt, sevenDaysAgo)
          )
        )
        .orderBy(desc(loginHistory.loginAt));

      // Check for logins from different countries within impossible timeframe
      for (let i = 0; i < logins.length - 1; i++) {
        const currentLogin = logins[i];
        const previousLogin = logins[i + 1];

        if (currentLogin.location && previousLogin.location && currentLogin.loginAt && previousLogin.loginAt) {
          // Extract country from location (assumes format like "City, Country")
          const currentCountry = currentLogin.location.split(',').pop()?.trim() || '';
          const previousCountry = previousLogin.location.split(',').pop()?.trim() || '';

          if (currentCountry && previousCountry && currentCountry !== previousCountry) {
            // Calculate time difference in hours
            const timeDiff = Math.abs(
              new Date(currentLogin.loginAt).getTime() - new Date(previousLogin.loginAt).getTime()
            ) / (1000 * 60 * 60);

            // If logged in from different countries within 12 hours (impossible for most travel)
            if (timeDiff < 12) {
              patterns.push({
                type: 'impossible_travel',
                severity: 'critical',
                description: `Login from ${currentCountry} within ${timeDiff.toFixed(1)} hours after login from ${previousCountry}`,
                details: {
                  firstLocation: previousLogin.location,
                  secondLocation: currentLogin.location,
                  firstLoginTime: previousLogin.loginAt,
                  secondLoginTime: currentLogin.loginAt,
                  timeDiffHours: timeDiff.toFixed(2),
                  firstIp: previousLogin.ip,
                  secondIp: currentLogin.ip
                },
                userId
              });
            }
          }
        }
      }

    } catch (error) {
      console.error('[PatternDetector] Error detecting impossible travel:', error);
    }

    return patterns;
  }

  async detectSharedDevice(deviceFingerprint: string): Promise<SuspiciousPattern[]> {
    const patterns: SuspiciousPattern[] = [];

    try {
      // Get all user sessions with this device fingerprint
      const sessions = await db
        .select({
          userId: userSessions.userId,
          userName: users.fullName,
          username: users.username,
          lastSeen: userSessions.lastSeen
        })
        .from(userSessions)
        .leftJoin(users, eq(userSessions.userId, users.id))
        .where(eq(userSessions.deviceFingerprint, deviceFingerprint));

      // Get unique users
      const uniqueUsers = new Set(sessions.map(s => s.userId));

      if (uniqueUsers.size > 1) {
        patterns.push({
          type: 'shared_device',
          severity: uniqueUsers.size > 3 ? 'high' : 'medium',
          description: `Device used by ${uniqueUsers.size} different users`,
          details: {
            deviceFingerprint,
            userCount: uniqueUsers.size,
            users: sessions.map(s => ({
              userId: s.userId,
              userName: s.userName || s.username,
              lastSeen: s.lastSeen
            }))
          }
        });
      }

    } catch (error) {
      console.error('[PatternDetector] Error detecting shared device:', error);
    }

    return patterns;
  }

  async runDailyAudit(hotelId: string): Promise<void> {
    try {
      console.log(`[PatternDetector] Running daily audit for hotel ${hotelId}`);
      
      // Get all active staff for this hotel
      const staff = await db
        .select({
          id: users.id,
          username: users.username,
          fullName: users.fullName,
          email: users.email
        })
        .from(users)
        .where(
          and(
            eq(users.hotelId, hotelId),
            eq(users.isActive, true)
          )
        );

      const allPatterns: SuspiciousPattern[] = [];

      // Run detection for each staff member
      for (const staffMember of staff) {
        // Detect suspicious wastage
        const wastagePatterns = await this.detectSuspiciousWastage(hotelId, staffMember.id);
        wastagePatterns.forEach(p => {
          p.userName = staffMember.fullName || staffMember.username;
        });
        allPatterns.push(...wastagePatterns);

        // Detect suspicious transactions
        const transactionPatterns = await this.detectSuspiciousTransactions(hotelId, staffMember.id);
        transactionPatterns.forEach(p => {
          p.userName = staffMember.fullName || staffMember.username;
        });
        allPatterns.push(...transactionPatterns);

        // Detect impossible travel
        const travelPatterns = await this.detectImpossibleTravel(staffMember.id);
        travelPatterns.forEach(p => {
          p.userName = staffMember.fullName || staffMember.username;
        });
        allPatterns.push(...travelPatterns);
      }

      // Check for shared devices
      const deviceFingerprints = await db
        .selectDistinct({ fingerprint: userSessions.deviceFingerprint })
        .from(userSessions)
        .leftJoin(users, eq(userSessions.userId, users.id))
        .where(eq(users.hotelId, hotelId));

      for (const device of deviceFingerprints) {
        if (device.fingerprint) {
          const devicePatterns = await this.detectSharedDevice(device.fingerprint);
          allPatterns.push(...devicePatterns);
        }
      }

      // Create security alerts for each finding
      for (const pattern of allPatterns) {
        await db.insert(securityAlerts).values({
          hotelId,
          type: pattern.type,
          description: `${pattern.severity.toUpperCase()}: ${pattern.description}`,
          performedBy: pattern.userId || null
        });
      }

      // Send summary email to owner if patterns found
      if (allPatterns.length > 0) {
        const criticalCount = allPatterns.filter(p => p.severity === 'critical').length;
        const highCount = allPatterns.filter(p => p.severity === 'high').length;
        const mediumCount = allPatterns.filter(p => p.severity === 'medium').length;
        const lowCount = allPatterns.filter(p => p.severity === 'low').length;

        // Get hotel info for email
        const hotel = await db
          .select()
          .from(hotels)
          .where(eq(hotels.id, hotelId))
          .limit(1);

        if (hotel.length > 0) {
          const hotelName = hotel[0].name;

          // Send alert using alert service
          await alertService.sendSecurityAlert({
            hotelId,
            userId: allPatterns[0].userId || '', // Use first user ID as reference
            alertType: 'suspicious_activity',
            alertData: {
              auditDate: new Date().toISOString(),
              hotelName,
              totalPatterns: allPatterns.length,
              criticalCount,
              highCount,
              mediumCount,
              lowCount,
              patterns: allPatterns.map(p => ({
                type: p.type,
                severity: p.severity,
                description: p.description,
                userName: p.userName,
                details: p.details
              }))
            }
          });
        }

        console.log(`[PatternDetector] Daily audit completed: ${allPatterns.length} suspicious patterns found`);
      } else {
        console.log(`[PatternDetector] Daily audit completed: No suspicious patterns found`);
      }

    } catch (error) {
      console.error('[PatternDetector] Error running daily audit:', error);
    }
  }
}

export const patternDetector = new PatternDetector();
