"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Database,
  Brain,
  Search,
  Calculator,
  FileCode,
  ListTodo,
  Settings,
  HelpCircle,
  Bell,
  ChevronDown,
  CheckCircle2,
  Zap,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { currentUser } from "@/lib/mock-data"
import { useSDLC, type AgentName } from "@/contexts/sdlc-context"

// Type definitions for navigation items
interface NavSubItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  indicator?: 'active' | 'success' | 'warning'
  agentName?: AgentName // Links to SDLC agent for completion status
}

interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  subItems?: NavSubItem[]
}

// Navigation items configuration
const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Data Engineering",
    url: "/data-engineering",
    icon: Database,
  },
  {
    title: "SDLC Intelligence",
    url: "/sdlc-intelligence",
    icon: Brain,
    subItems: [
      {
        title: "Historical Matches",
        url: "/sdlc-intelligence/historical-matches",
        icon: Search,
        agentName: "historicalMatches",
      },
      {
        title: "Estimation Sheet",
        url: "/sdlc-intelligence/estimation-sheet",
        icon: Calculator,
        agentName: "estimationSheet",
      },
      {
        title: "TDD Generation",
        url: "/sdlc-intelligence/tdd-generation",
        icon: FileCode,
        agentName: "tddGeneration",
      },
      {
        title: "Jira Stories",
        url: "/sdlc-intelligence/jira-stories",
        icon: ListTodo,
        agentName: "jiraStories",
      },
    ],
  },
]

const secondaryNavItems: NavItem[] = [
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
    badge: 4,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Help Center",
    url: "/help",
    icon: HelpCircle,
  },
]

interface NavItemProps {
  item: NavItem
  isActive: boolean
}

function NavItem({ item, isActive }: NavItemProps) {
  const [isOpen, setIsOpen] = React.useState(isActive)
  const pathname = usePathname()
  const { isAgentComplete } = useSDLC()

  if (item.subItems) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              className={cn(
                "w-full justify-between",
                isActive && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              )}
            >
              <span className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.subItems.map((subItem) => {
                const isSubActive = pathname === subItem.url || pathname.includes(subItem.url.split('?')[0])
                const isComplete = subItem.agentName ? isAgentComplete(subItem.agentName) : false
                return (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton
                      asChild
                      className={cn(
                        "pl-9",
                        isSubActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      )}
                    >
                      <Link href={subItem.url}>
                        {isComplete ? (
                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        ) : (
                          <subItem.icon className="mr-2 h-4 w-4" />
                        )}
                        <span>{subItem.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className={cn(
          isActive && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
        )}
      >
        <Link href={item.url}>
          <item.icon className="h-5 w-5" />
          <span>{item.title}</span>
          {item.badge && (
            <Badge
              variant="secondary"
              className={cn(
                "ml-auto",
                isActive && "bg-primary-foreground/20 text-primary-foreground"
              )}
            >
              {item.badge}
            </Badge>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar {...props} className="border-r border-sidebar-border">
      {/* Logo Header */}
      <SidebarHeader className="px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">
            ImpactHub
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const isActive = pathname === item.url ||
                  (item.url !== '/' && pathname.startsWith(item.url))
                return (
                  <NavItem key={item.title} item={item} isActive={isActive} />
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-4" />

        {/* Secondary Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge
                            variant="destructive"
                            className="ml-auto h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Profile Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {currentUser.name}
            </span>
            <span className="text-xs text-muted-foreground capitalize">
              {currentUser.role}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
