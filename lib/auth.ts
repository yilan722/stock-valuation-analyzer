import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './database'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface UserSession {
  userId: string
  email: string
  name?: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: UserSession): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession
  } catch {
    return null
  }
}

export async function createUser(email: string, password: string, name?: string) {
  const hashedPassword = await hashPassword(password)
  
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name
    }
  })
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email }
  })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id }
  })
}

export async function canGenerateReport(userId: string): Promise<{ canGenerate: boolean; reason?: string }> {
  const user = await getUserById(userId)
  if (!user) {
    return { canGenerate: false, reason: 'User not found' }
  }

  // Check if user has free reports available
  if (user.freeReportsUsed === 0) {
    return { canGenerate: true }
  }

  // Check subscription status
  if (user.subscriptionType && user.subscriptionEnd && user.subscriptionEnd > new Date()) {
    const reportsUsedThisMonth = user.paidReportsUsed
    if (reportsUsedThisMonth < user.monthlyReportLimit) {
      return { canGenerate: true }
    } else {
      return { canGenerate: false, reason: 'Monthly report limit reached' }
    }
  }

  return { canGenerate: false, reason: 'No free reports or active subscription' }
}

export async function incrementReportUsage(userId: string, isFree: boolean = true) {
  if (isFree) {
    await prisma.user.update({
      where: { id: userId },
      data: { freeReportsUsed: { increment: 1 } }
    })
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: { paidReportsUsed: { increment: 1 } }
    })
  }
} 