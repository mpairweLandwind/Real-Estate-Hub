"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PaymentModal } from "@/components/payment-modal"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useToast } from "@/components/ui/toast"
import { Wrench, ArrowLeft, MapPin, Calendar, DollarSign, Edit, Trash2, Save, X } from "lucide-react"
import Link from "next/link"

export default function MaintenanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const supabase = createClient()
  const { addToast } = useToast()
  const [request, setRequest] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [requestId, setRequestId] = useState<string | null>(null)

  const [editData, setEditData] = useState({
    status: "",
    priority: "",
    estimatedCost: "",
    actualCost: "",
    scheduledDate: "",
  })

  useEffect(() => {
    async function fetchRequest() {
      // Await params first
      const resolvedParams = await params
      setRequestId(resolvedParams.id)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data, error } = await supabase
        .from("maintenance_requests")
        .select(
          "*, properties(title, address, city, country), profiles!maintenance_requests_requester_id_fkey(full_name)",
        )
        .eq("id", resolvedParams.id)
        .single()

      if (error || !data) {
        addToast({
          title: "Error",
          description: "Maintenance request not found",
          variant: "error",
        })
        router.push("/maintenance")
        return
      }

      setRequest(data)
      setEditData({
        status: data.status,
        priority: data.priority,
        estimatedCost: data.estimated_cost?.toString() || "",
        actualCost: data.actual_cost?.toString() || "",
        scheduledDate: data.scheduled_date ? new Date(data.scheduled_date).toISOString().split("T")[0] : "",
      })
      setIsLoading(false)
    }

    fetchRequest()
  }, [])

  const handleSave = async () => {
    if (!requestId) return
    setIsSaving(true)

    try {
      const { error } = await supabase
        .from("maintenance_requests")
        .update({
          status: editData.status,
          priority: editData.priority,
          estimated_cost: editData.estimatedCost ? Number.parseFloat(editData.estimatedCost) : null,
          actual_cost: editData.actualCost ? Number.parseFloat(editData.actualCost) : null,
          scheduled_date: editData.scheduledDate || null,
          completed_date: editData.status === "completed" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)

      if (error) throw error

      // Refresh data
      const { data: updatedData } = await supabase
        .from("maintenance_requests")
        .select(
          "*, properties(title, address, city, country), profiles!maintenance_requests_requester_id_fkey(full_name)",
        )
        .eq("id", requestId)
        .single()

      if (updatedData) setRequest(updatedData)

      addToast({
        title: "Success!",
        description: "Maintenance request updated successfully",
        variant: "success",
      })

      setIsEditing(false)
    } catch (err: any) {
      console.error("[v0] Error updating maintenance request:", err)
      addToast({
        title: "Error",
        description: err.message || "Failed to update request",
        variant: "error",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!requestId) return
    setIsDeleting(true)

    try {
      const { error } = await supabase.from("maintenance_requests").delete().eq("id", requestId)

      if (error) throw error

      addToast({
        title: "Success!",
        description: "Maintenance request deleted successfully",
        variant: "success",
      })

      router.push("/maintenance")
    } catch (err: any) {
      console.error("[v0] Error deleting maintenance request:", err)
      addToast({
        title: "Error",
        description: err.message || "Failed to delete request",
        variant: "error",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      completed: "default",
      in_progress: "secondary",
      pending: "secondary",
      cancelled: "destructive",
    }
    return variants[status] || "secondary"
  }

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      urgent: "destructive",
      high: "destructive",
      medium: "secondary",
      low: "secondary",
    }
    return variants[priority] || "secondary"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!request) return null

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/maintenance">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Maintenance
            </Button>
          </Link>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-destructive hover:text-destructive bg-transparent"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={() => {
                    setIsEditing(false)
                    setEditData({
                      status: request.status,
                      priority: request.priority,
                      estimatedCost: request.estimated_cost?.toString() || "",
                      actualCost: request.actual_cost?.toString() || "",
                      scheduledDate: request.scheduled_date
                        ? new Date(request.scheduled_date).toISOString().split("T")[0]
                        : "",
                    })
                  }}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-3xl font-serif mb-2">{request.title}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {request.properties?.title} - {request.properties?.city}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant={getPriorityBadge(isEditing ? editData.priority : request.priority)}
                      className="capitalize"
                    >
                      {isEditing ? editData.priority : request.priority}
                    </Badge>
                    <Badge
                      variant={getStatusBadge(isEditing ? editData.status : request.status)}
                      className="capitalize"
                    >
                      {isEditing ? editData.status.replace("_", " ") : request.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-serif font-bold text-xl mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{request.description}</p>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-xl mb-3">Request Details</h3>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={editData.status}
                            onValueChange={(value) => setEditData((prev) => ({ ...prev, status: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="priority">Priority</Label>
                          <Select
                            value={editData.priority}
                            onValueChange={(value) => setEditData((prev) => ({ ...prev, priority: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="estimatedCost">Estimated Cost</Label>
                          <Input
                            id="estimatedCost"
                            type="number"
                            placeholder="500"
                            value={editData.estimatedCost}
                            onChange={(e) => setEditData((prev) => ({ ...prev, estimatedCost: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="actualCost">Actual Cost</Label>
                          <Input
                            id="actualCost"
                            type="number"
                            placeholder="450"
                            value={editData.actualCost}
                            onChange={(e) => setEditData((prev) => ({ ...prev, actualCost: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="scheduledDate">Scheduled Date</Label>
                          <Input
                            id="scheduledDate"
                            type="date"
                            value={editData.scheduledDate}
                            onChange={(e) => setEditData((prev) => ({ ...prev, scheduledDate: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Category</span>
                        <span className="font-medium capitalize">{request.category}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Priority</span>
                        <span className="font-medium capitalize">{request.priority}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-medium capitalize">{request.status.replace("_", " ")}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-medium">{new Date(request.created_at).toLocaleDateString()}</span>
                      </div>
                      {request.scheduled_date && (
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">Scheduled</span>
                          <span className="font-medium">{new Date(request.scheduled_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {request.completed_date && (
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">Completed</span>
                          <span className="font-medium">{new Date(request.completed_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Property Info */}
                <div>
                  <h3 className="font-serif font-bold text-xl mb-3">Property Information</h3>
                  <div className="p-4 rounded-lg border border-border">
                    <p className="font-semibold mb-1">{request.properties?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.properties?.address}, {request.properties?.city}, {request.properties?.country}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cost Card */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Cost Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(request.estimated_cost || editData.estimatedCost) && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Estimated Cost</p>
                    <p className="text-2xl font-bold text-primary">
                      ${Number.parseFloat(editData.estimatedCost || request.estimated_cost || "0").toLocaleString()}
                    </p>
                  </div>
                )}
                {(request.actual_cost || editData.actualCost) && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Actual Cost</p>
                    <p className="text-2xl font-bold text-primary">
                      ${Number.parseFloat(editData.actualCost || request.actual_cost || "0").toLocaleString()}
                    </p>
                  </div>
                )}
                {request.status === "completed" && request.actual_cost && (
                  <PaymentModal
                    maintenanceRequestId={request.id}
                    amount={request.actual_cost}
                    transactionType="maintenance"
                    trigger={
                      <Button className="w-full gap-2">
                        <DollarSign className="h-4 w-4" />
                        Pay Now
                      </Button>
                    }
                  />
                )}
              </CardContent>
            </Card>

            {/* Requester Info */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Requested By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 h-12 w-12 flex items-center justify-center">
                    <Wrench className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{request.profiles?.full_name || "User"}</p>
                    <p className="text-sm text-muted-foreground">Property Owner</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            {(request.scheduled_date || editData.scheduledDate) && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Scheduled Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(editData.scheduledDate || request.scheduled_date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Maintenance Request"
        description="Are you sure you want to delete this maintenance request? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        variant="destructive"
      />
    </div>
  )
}
