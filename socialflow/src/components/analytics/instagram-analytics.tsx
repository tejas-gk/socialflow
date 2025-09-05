"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { apiClient } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

function number(v: unknown) {
  if (v == null) return 0
  if (typeof v === "number") return v
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

interface InstagramAccount {
  id: string;
  name: string;
  username: string;
  followersCount: number;
  mediaCount: number;
}

export default function InstagramAnalytics() {
  const { data: accountsResp } = useSWR("ig-accounts", () => apiClient.getInstagramAccountsAnalytics())
  const accounts: InstagramAccount[] = accountsResp?.data ?? []

  const [businessId, setBusinessId] = useState("")

  useEffect(() => {
    if (!businessId && accounts?.length) setBusinessId(accounts[0].id)
  }, [accounts, businessId])

  const { data: dashboard, isLoading: dashboardLoading } = useSWR(
    businessId ? ["ig-dashboard", businessId] : null, 
    () => apiClient.getInstagramDashboard(businessId)
  )

  const { data: followers } = useSWR(
    businessId ? ["ig-followers", businessId] : null, 
    () => apiClient.getInstagramFollowers(businessId)
  )

  const { data: engagement } = useSWR(
    businessId ? ["ig-engagement", businessId] : null, 
    () => apiClient.getInstagramEngagement(businessId)
  )

  const { data: profileViews } = useSWR(
    businessId ? ["ig-profile-views", businessId] : null, 
    () => apiClient.getInstagramProfileViews(businessId)
  )

  const selectedAccount = accounts.find(acc => acc.id === businessId)

  // Process follower data for chart
  const followerTimeseries = useMemo(() => {
    const values = followers?.new?.data?.[0]?.values ?? []
    return values.map((v: any) => ({
      date: v.end_time?.slice(0, 10),
      value: number(v.value),
    }))
  }, [followers])

  if (!accounts.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground mb-4">
            Connect and select an Instagram business account to view detailed analytics and insights.
          </p>
          <Button onClick={() => window.location.href = '/connections'}>
            Connect Instagram
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Account Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Instagram Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={businessId} onValueChange={setBusinessId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Instagram account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  @{acc.username} ({acc.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {dashboardLoading ? (
        <div className="text-center py-8">Loading analytics...</div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard 
              title="Followers" 
              value={dashboard?.getTotalFollowers?.followers_count?.toLocaleString() || selectedAccount?.followersCount?.toLocaleString() || "—"} 
            />
            <MetricCard 
              title="Posts" 
              value={dashboard?.getTotalPosts?.media_count?.toLocaleString() || selectedAccount?.mediaCount?.toLocaleString() || "—"} 
            />
            <MetricCard 
              title="Profile Views" 
              value={profileViews?.data?.[0]?.values?.[0]?.value?.toLocaleString() || "—"} 
            />
            <MetricCard 
              title="Engagement" 
              value={engagement?.data?.[0]?.total_value?.value?.toLocaleString() || "—"} 
            />
          </div>

          {/* Follower Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Follower Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={followerTimeseries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ fill: "#8884d8" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Account Details */}
          {selectedAccount && (
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Username:</strong> @{selectedAccount.username}</p>
                  <p><strong>Page Name:</strong> {selectedAccount.name}</p>
                  <p><strong>Followers:</strong> {selectedAccount.followersCount.toLocaleString()}</p>
                  <p><strong>Posts:</strong> {selectedAccount.mediaCount.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function MetricCard({ title, value }: { title: string; value: number | string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
