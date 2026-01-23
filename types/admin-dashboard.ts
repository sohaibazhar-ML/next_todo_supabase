export interface DashboardStatistics {
  projects: {
    total: number
    completed: number
  }
  activeTasks: {
    total: number
    completed: number
  }
  teams: {
    total: number
    completed: number
  }
  productivity: {
    percentage: number
    completed: number
  }
}

export interface Project {
  id: string
  name: string
  logo?: string
  hours: number
  priority: 'Low' | 'Medium' | 'High'
  members: {
    id: string
    name: string
    avatar?: string
  }[]
  progress: number
}

export interface NavigationItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
  children?: NavigationItem[]
}

export interface AdminDashboardProps {
  statistics: DashboardStatistics
  projects: Project[]
  userRole: 'admin' | 'subadmin'
  permissions: {
    canUpload: boolean
    canViewStats: boolean
  }
}

