"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FieldInterface, SharedWithInterface, FieldPermissionInterface } from "@repo/types"
import { MoreHorizontal, Edit, Trash2, Ban, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SharedUsersListProps {
  sharedUsers: SharedWithInterface[]
  fields: FieldInterface[]
  onUpdate: (email: string, updatedUser: SharedWithInterface) => void
  onRemove: (email: string) => void
}

export default function SharedUsersList({ sharedUsers, fields, onUpdate, onRemove }: SharedUsersListProps) {
  const [editingUser, setEditingUser] = useState<SharedWithInterface | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [fieldPermissions, setFieldPermissions] = useState<FieldPermissionInterface[]>([])
  const [filterInputs, setFilterInputs] = useState<Record<string, string>>({})

  const handleEditUser = (user: SharedWithInterface) => {
    setEditingUser(user)
    setFieldPermissions([...user.fieldPermission])

    // Convert filter arrays to comma-separated strings for editing
    const initialFilterInputs: Record<string, string> = {}
    user.fieldPermission.forEach((fp) => {
      initialFilterInputs[fp.fieldName] = fp.filter.join(", ")
    })
    setFilterInputs(initialFilterInputs)

    setIsEditModalOpen(true)
  }

  const handlePermissionChange = (fieldName: string, permission: "READ" | "WRITE") => {
    setFieldPermissions(fieldPermissions.map((fp) => (fp.fieldName === fieldName ? { ...fp, permission } : fp)))
  }

  const handleFilterChange = (fieldName: string, filterString: string) => {
    setFilterInputs({
      ...filterInputs,
      [fieldName]: filterString,
    })
  }

  const handleUpdateUser = () => {
    if (!editingUser) return

    // Convert comma-separated filter strings to arrays
    const updatedFieldPermissions = fieldPermissions.map((fp) => ({
      ...fp,
      filter: filterInputs[fp.fieldName] ? filterInputs[fp.fieldName].split(",").map((item) => item.trim()) : [],
    }))

    const updatedUser: SharedWithInterface = {
      ...editingUser,
      fieldPermission: updatedFieldPermissions,
    }

    onUpdate(editingUser.email, updatedUser)
    setIsEditModalOpen(false)
  }

  const handleToggleBlock = (user: SharedWithInterface) => {
    const updatedUser: SharedWithInterface = {
      ...user,
      isBlocked: !user.isBlocked,
    }
    onUpdate(user.email, updatedUser)
  }

  if (sharedUsers.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No users have been shared with this table yet.</div>
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sharedUsers.map((user) => (
            <TableRow key={user.email}>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.isBlocked ? (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <Ban className="h-3 w-3" />
                    Blocked
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {user.fieldPermission.map((fp) => (
                    <Badge
                      key={fp.fieldName}
                      variant={fp.permission === "WRITE" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {fp.fieldName}: {fp.permission.toLowerCase()}
                      {fp.filter.length > 0 && ` (${fp.filter.length} filters)`}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditUser(user)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Permissions
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleBlock(user)}>
                      {user.isBlocked ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Unblock User
                        </>
                      ) : (
                        <>
                          <Ban className="h-4 w-4 mr-2" />
                          Block User
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onRemove(user.email)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Access
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Modal */}
      {editingUser && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Permissions for {editingUser.email}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-2">
              <div>
                <h3 className="font-medium mb-3">Column Permissions</h3>
                <div className="border rounded-md p-4 space-y-6">
                  {fields.map((field) => {
                    const fieldPermission = fieldPermissions.find((fp) => fp.fieldName === field.name)

                    return (
                      <div key={field.name} className="flex flex-col sm:flex-row sm:items-start gap-2">
                        <div className="w-32 pt-2 flex-shrink-0">{field.name}</div>

                        <div className="w-32 flex-shrink-0">
                          <Select
                            value={fieldPermission?.permission || "READ"}
                            onValueChange={(value: "READ" | "WRITE") => handlePermissionChange(field.name, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Permission" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="READ">Read</SelectItem>
                              <SelectItem value="WRITE">Write</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex-1">
                          <div className="space-y-1">
                            <Input
                              id={`filter-edit-${field.name}`}
                              value={filterInputs[field.name] || ""}
                              onChange={(e) => handleFilterChange(field.name, e.target.value)}
                              placeholder="Filter ( Comma Seperated , )"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

