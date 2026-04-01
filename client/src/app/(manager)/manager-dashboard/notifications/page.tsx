"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotificationStore } from "@/stores/notification.store";
import { INotification } from "@/interfaces/api";

const PAGE_SIZE = 10;

function getNotificationHref(notification: INotification): string {
  if (notification.relatedType === "project") {
    return "/manager-dashboard/projects";
  }

  return "/manager-dashboard/tasks";
}

function formatNotificationTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return date.toLocaleString();
}

export default function ManagerNotificationsPage() {
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const {
    notifications,
    unreadCount,
    pagination,
    isLoading,
    error,
    getNotifications,
    markAsRead,
    markAllAsRead,
    clearError,
  } = useNotificationStore();

  useEffect(() => {
    void getNotifications({ page, limit: PAGE_SIZE, unreadOnly });
  }, [getNotifications, page, unreadOnly]);

  const hasPrevious = page > 1;
  const hasNext = useMemo(() => {
    if (!pagination) {
      return false;
    }
    return page < pagination.totalPages;
  }, [pagination, page]);

  const handleMarkAllRead = async () => {
    const success = await markAllAsRead();
    if (success && unreadOnly) {
      setPage(1);
      void getNotifications({ page: 1, limit: PAGE_SIZE, unreadOnly: true });
    }
  };

  const handleMarkOneRead = async (id: string) => {
    const success = await markAsRead(id);
    if (success && unreadOnly) {
      void getNotifications({ page, limit: PAGE_SIZE, unreadOnly: true });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track project, task, and comment updates across your workspace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={unreadCount > 0 ? "default" : "secondary"}>
            {unreadCount} unread
          </Badge>
          <Button
            variant="outline"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || isLoading}
            className="gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Inbox</CardTitle>
              <CardDescription>
                {pagination?.total ?? notifications.length} total notifications
              </CardDescription>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={unreadOnly}
                onCheckedChange={(checked) => {
                  setUnreadOnly(Boolean(checked));
                  setPage(1);
                }}
              />
              Show unread only
            </label>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && notifications.length === 0 && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="space-y-2 rounded-lg border p-4">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
              <Bell className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="font-medium">No notifications found</p>
              <p className="text-sm text-muted-foreground">
                {unreadOnly
                  ? "You are all caught up."
                  : "New activity alerts will appear here."}
              </p>
            </div>
          )}

          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`rounded-lg border p-4 transition-colors ${
                notification.isRead ? "bg-background" : "bg-primary/5"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{notification.title}</p>
                    {!notification.isRead && (
                      <Badge variant="default" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatNotificationTime(notification.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={getNotificationHref(notification)}>Open</Link>
                  </Button>
                  {!notification.isRead && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => handleMarkOneRead(notification._id)}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Mark read
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between border-t pt-3">
            <p className="text-xs text-muted-foreground">
              Page {page} of {pagination?.totalPages ?? 1}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={!hasPrevious || isLoading}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={!hasNext || isLoading}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearError}>
                Dismiss error
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
