import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/utils/roles'

// GET - Get admin statistics with filters
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')
    const userEmail = searchParams.get('userEmail')
    const documentSearch = searchParams.get('documentSearch')
    const category = searchParams.get('category')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []

    // Build date filter
    const dateFilter: any = {}
    if (fromDate || toDate) {
      dateFilter.downloaded_at = {}
      if (fromDate) {
        dateFilter.downloaded_at.gte = new Date(fromDate)
      }
      if (toDate) {
        const toDateEnd = new Date(toDate)
        toDateEnd.setHours(23, 59, 59, 999)
        dateFilter.downloaded_at.lte = toDateEnd
      }
    }

    // Build document filter
    const documentFilter: any = {}
    if (documentSearch) {
      documentFilter.OR = [
        { title: { contains: documentSearch, mode: 'insensitive' } },
        { description: { contains: documentSearch, mode: 'insensitive' } },
        { file_name: { contains: documentSearch, mode: 'insensitive' } },
      ]
    }
    if (category) {
      documentFilter.category = category
    }
    if (tags.length > 0) {
      documentFilter.tags = { hasSome: tags }
    }

    // Build user filter
    const userFilter: any = {}
    if (userEmail) {
      userFilter.email = { contains: userEmail, mode: 'insensitive' }
    }

    // Get total users (with optional email filter)
    const totalUsers = await prisma.profiles.count({
      where: userFilter,
    })

    // Get total admins
    const totalAdmins = await prisma.profiles.count({
      where: {
        ...userFilter,
        role: 'admin',
      },
    })

    // Get total documents (with optional filters)
    const totalDocuments = await prisma.documents.count({
      where: documentFilter,
    })

    // Get user IDs if email filter is set (needed before download logs query)
    let filteredUserIdsForQueries: string[] | undefined = undefined
    if (userEmail) {
      const filteredUsers = await prisma.profiles.findMany({
        where: userFilter,
        select: { id: true },
      })
      const foundUserIds = filteredUsers.map(u => u.id)
      if (foundUserIds.length === 0) {
        // No users match, return empty results early
        return NextResponse.json({
          summary: {
            totalUsers: 0,
            totalAdmins: 0,
            totalDocuments: 0,
          },
          downloadsPerDocument: [],
          versionDownloads: [],
          userVersionsCount: [],
          userDocumentDownloads: [],
          filterOptions: {
            categories: [],
            tags: [],
          },
        })
      }
      filteredUserIdsForQueries = foundUserIds
    }

    // Build download logs filter (combining date, document, and user filters)
    const downloadLogsFilter: any = {
      documents: documentFilter,
    }
    if (Object.keys(dateFilter).length > 0) {
      downloadLogsFilter.downloaded_at = dateFilter.downloaded_at
    }
    if (filteredUserIdsForQueries && filteredUserIdsForQueries.length > 0) {
      downloadLogsFilter.user_id = { in: filteredUserIdsForQueries }
    }

    // Get documents with their download logs (filtered)
    const documentsWithLogs = await prisma.documents.findMany({
      where: documentFilter,
      select: {
        id: true,
        title: true,
        file_name: true,
        category: true,
        download_count: true,
        download_logs: {
          where: downloadLogsFilter,
          select: {
            id: true,
            user_id: true,
            downloaded_at: true,
          },
        },
      },
    })

    // Calculate actual total downloads for each document (from all logs, not just filtered)
    // This gives us the true total count regardless of filters
    const documentTotalCounts = await prisma.download_logs.groupBy({
      by: ['document_id'],
      where: {
        documents: documentFilter,
      },
      _count: {
        id: true,
      },
    })

    const totalCountsMap = new Map(
      documentTotalCounts.map(item => [item.document_id, item._count.id])
    )

    // Map documents with accurate counts
    const downloadsPerDocument = documentsWithLogs.map(doc => ({
      id: doc.id,
      title: doc.title,
      file_name: doc.file_name,
      category: doc.category,
      total_downloads: totalCountsMap.get(doc.id) || 0, // Use actual count from all logs
      filtered_downloads: doc.download_logs.length, // Count of filtered logs
      download_logs: doc.download_logs,
    })).sort((a, b) => b.total_downloads - a.total_downloads) // Sort by total downloads

    // Get version-wise downloads (user document versions with export info)
    const versionDownloads = await prisma.user_document_versions.findMany({
      where: {
        exported_file_path: { not: null },
        ...(fromDate || toDate ? {
          updated_at: {
            ...(fromDate ? { gte: new Date(fromDate) } : {}),
            ...(toDate ? {
              lte: (() => {
                const d = new Date(toDate)
                d.setHours(23, 59, 59, 999)
                return d
              })(),
            } : {}),
          },
        } : {}),
        documents: documentFilter,
        ...(filteredUserIdsForQueries ? { user_id: { in: filteredUserIdsForQueries } } : {}),
      },
      select: {
        id: true,
        version_number: true,
        version_name: true,
        exported_file_path: true,
        exported_file_size: true,
        created_at: true,
        documents: {
          select: {
            id: true,
            title: true,
            file_name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    // Get users' edited versions count
    const userVersionsCount = await prisma.user_document_versions.groupBy({
      by: ['user_id'],
      where: {
        ...(fromDate || toDate ? {
          created_at: {
            ...(fromDate ? { gte: new Date(fromDate) } : {}),
            ...(toDate ? {
              lte: (() => {
                const d = new Date(toDate)
                d.setHours(23, 59, 59, 999)
                return d
              })(),
            } : {}),
          },
        } : {}),
        documents: documentFilter,
        ...(filteredUserIdsForQueries ? { user_id: { in: filteredUserIdsForQueries } } : {}),
      },
      _count: {
        id: true,
      },
    })

    // Get user profiles for version counts
    const versionUserIds = userVersionsCount.map(uv => uv.user_id)
    const userProfiles = await prisma.profiles.findMany({
      where: {
        id: { in: versionUserIds },
        ...userFilter,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        username: true,
      },
    })

    const userVersionsWithProfiles = userVersionsCount.map(uv => {
      const profile = userProfiles.find(p => p.id === uv.user_id)
      return {
        user_id: uv.user_id,
        email: profile?.email || 'Unknown',
        name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown',
        username: profile?.username || 'Unknown',
        versions_count: uv._count.id,
      }
    }).filter(uv => uv.email !== 'Unknown' || !userEmail) // Filter out unknown if email filter is set

    // Get which user downloaded what documents
    const userDocumentDownloads = await prisma.download_logs.findMany({
      where: {
        ...dateFilter,
        documents: documentFilter,
        ...(filteredUserIdsForQueries ? { user_id: { in: filteredUserIdsForQueries } } : {}),
      },
      select: {
        id: true,
        user_id: true,
        document_id: true,
        downloaded_at: true,
        documents: {
          select: {
            id: true,
            title: true,
            file_name: true,
            category: true,
          },
        },
      },
      orderBy: {
        downloaded_at: 'desc',
      },
      take: 1000, // Limit to prevent huge responses
    })

    // Get user profiles for downloads
    const downloadUserIds = [...new Set(userDocumentDownloads.map(d => d.user_id))]
    const downloadUserProfiles = await prisma.profiles.findMany({
      where: {
        id: { in: downloadUserIds },
        ...userFilter,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        username: true,
      },
    })

    const userDocumentDownloadsWithProfiles = userDocumentDownloads.map(download => {
      const profile = downloadUserProfiles.find(p => p.id === download.user_id)
      return {
        id: download.id,
        user_id: download.user_id,
        user_email: profile?.email || 'Unknown',
        user_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown',
        document_id: download.document_id,
        document_title: download.documents.title,
        document_file_name: download.documents.file_name,
        document_category: download.documents.category,
        downloaded_at: download.downloaded_at,
      }
    }).filter(d => d.user_email !== 'Unknown' || !userEmail)

    // Get unique categories and tags for filter options
    const categories = await prisma.documents.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
      orderBy: {
        category: 'asc',
      },
    })

    const allTags = await prisma.documents.findMany({
      select: {
        tags: true,
      },
    })

    const uniqueTags = [...new Set(allTags.flatMap(d => d.tags))].sort()

    return NextResponse.json({
      summary: {
        totalUsers,
        totalAdmins,
        totalDocuments,
      },
      downloadsPerDocument: downloadsPerDocument.map(doc => ({
        id: doc.id,
        title: doc.title,
        file_name: doc.file_name,
        category: doc.category,
        total_downloads: doc.total_downloads, // Already calculated from actual logs
        filtered_downloads: doc.filtered_downloads,
        download_logs: doc.download_logs.map(log => ({
          id: log.id,
          user_id: log.user_id,
          downloaded_at: log.downloaded_at,
        })),
      })),
      versionDownloads: versionDownloads.map(v => ({
        id: v.id,
        version_number: v.version_number,
        version_name: v.version_name,
        document_id: v.documents.id,
        document_title: v.documents.title,
        document_file_name: v.documents.file_name,
        exported_file_path: v.exported_file_path,
        exported_file_size: v.exported_file_size?.toString() || null,
        created_at: v.created_at,
      })),
      userVersionsCount: userVersionsWithProfiles,
      userDocumentDownloads: userDocumentDownloadsWithProfiles,
      filterOptions: {
        categories: categories.map(c => c.category),
        tags: uniqueTags,
      },
    })
  } catch (error: any) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

