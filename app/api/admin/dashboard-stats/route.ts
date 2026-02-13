import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { isAdmin, isSubadmin } from '@/lib/utils/roles'
import type { DashboardStatistics, Project } from '@/types/admin-dashboard'
import { ERROR_MESSAGES } from '@/constants'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
    }

    const admin = await isAdmin(user.id)
    const subadmin = await isSubadmin(user.id)

    if (!admin && !subadmin) {
      return NextResponse.json({ error: ERROR_MESSAGES.FORBIDDEN }, { status: 403 })
    }

    // Get statistics
    const totalDocuments = await prisma.documents.count({
      where: { is_active: true },
    })

    const completedDocuments = await prisma.documents.count({
      where: {
        is_active: true,
        download_count: { gt: 0 },
      },
    })

    const totalUsers = await prisma.profiles.count()
    const activeUsers = await prisma.profiles.count({
      where: {
        email_confirmed: true,
      },
    })

    const totalSubadmins = await prisma.profiles.count({
      where: { role: 'subadmin' },
    })
    const activeSubadmins = await prisma.subadmin_permissions.count({
      where: { is_active: true },
    })

    const totalDownloads = await prisma.download_logs.count()
    const recentDownloads = await prisma.download_logs.count({
      where: {
        downloaded_at: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    })

    // Calculate productivity (based on document activity)
    const totalActiveDocuments = totalDocuments
    const documentsWithActivity = await prisma.documents.count({
      where: {
        is_active: true,
        OR: [
          { download_count: { gt: 0 } },
          { updated_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        ],
      },
    })
    const productivityPercentage = totalActiveDocuments > 0
      ? Math.round((documentsWithActivity / totalActiveDocuments) * 100)
      : 0

    const statistics: DashboardStatistics = {
      projects: {
        total: totalDocuments,
        completed: completedDocuments,
      },
      activeTasks: {
        total: totalDownloads,
        completed: recentDownloads,
      },
      teams: {
        total: totalSubadmins,
        completed: activeSubadmins,
      },
      productivity: {
        percentage: productivityPercentage,
        completed: 5, // Placeholder
      },
    }

    // Get recent documents as "projects"
    const recentDocuments = await prisma.documents.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        category: true,
        download_count: true,
        created_at: true,
        file_type: true,
        created_by: true,
      },
    })

    // Get user profiles for document creators
    const creatorIds = recentDocuments
      .map((d) => d.created_by)
      .filter((id): id is string => id !== null)
    const creators = await prisma.profiles.findMany({
      where: { id: { in: creatorIds } },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
      },
    })

    const projects: Project[] = recentDocuments.map((doc) => {
      const creator = creators.find((c) => c.id === doc.created_by)
      const priority: 'Low' | 'Medium' | 'High' =
        (doc.download_count ?? 0) > 50
          ? 'High'
          : (doc.download_count ?? 0) > 20
            ? 'Medium'
            : 'Low'

      // Calculate progress based on downloads (simplified)
      const progress = Math.min(100, Math.round(((doc.download_count ?? 0) / 100) * 100))

      return {
        id: doc.id,
        name: doc.title,
        hours: Math.floor(Math.random() * 100) + 10, // Placeholder
        priority,
        members: creator
          ? [
            {
              id: creator.id,
              name: `${creator.first_name} ${creator.last_name}`,
            },
          ]
          : [],
        progress,
      }
    })

    return NextResponse.json({
      statistics,
      projects,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}

