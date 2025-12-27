"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Notification } from "@/types/assessment"

interface AlertBannerProps {
  notification: Notification
}

export function AlertBanner({ notification }: AlertBannerProps) {
  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {notification.title}
            </p>
            <p className="text-sm text-muted-foreground">
              {notification.message}
            </p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          View Detail
        </Button>
      </CardContent>
    </Card>
  )
}
