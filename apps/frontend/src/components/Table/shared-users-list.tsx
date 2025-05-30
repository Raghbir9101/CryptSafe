"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FieldInterface, SharedWithInterface, FieldPermissionInterface, WorkingTimeAccessInterface, NetworkAccessInterface } from "@repo/types"
import { MoreHorizontal, Edit, Trash2, Ban, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

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
  const [tablePermissions, setTablePermissions] = useState({ edit: false, delete: false })
  const [rowsPerPageLimit, setRowsPerPageLimit] = useState(10)
  const [workingTimeAccess, setWorkingTimeAccess] = useState<WorkingTimeAccessInterface[]>([])
  const [networkAccess, setNetworkAccess] = useState<NetworkAccessInterface[]>([])
  const [restrictNetwork, setRestrictNetwork] = useState(false)
  const [restrictWorkingTime, setRestrictWorkingTime] = useState(false)

  const handleEditUser = (user: SharedWithInterface) => {
    setEditingUser(user)
    setFieldPermissions(fields.map((field) => {
      const fieldPermission = user.fieldPermission.find((fp) => fp.fieldName === field.name)
      return fieldPermission ? fieldPermission : {
        fieldName: field.name,
        filter: [],
        permission: "READ"
      }
    }))

    // Set other user properties
    setTablePermissions(user.tablePermissions)
    setRowsPerPageLimit(user.rowsPerPageLimit)
    setWorkingTimeAccess(user.workingTimeAccess)
    setNetworkAccess(user.networkAccess)
    setRestrictNetwork(user.restrictNetwork)
    setRestrictWorkingTime(user.restrictWorkingTime)

    // Convert filter arrays to comma-separated strings for editing
    const initialFilterInputs: Record<string, string> = {}
    user.fieldPermission.forEach((fp) => {
      initialFilterInputs[fp.fieldName] = fp.filter.join(", ")
    })
    setFilterInputs(initialFilterInputs)

    setIsEditModalOpen(true)
  }

  const handlePermissionChange = (fieldName: string, permission: "READ" | "WRITE" | "NONE") => {
    const temp = fieldPermissions.map((fp) => {
      if (fp.fieldName === fieldName) {
        return { ...fp, permission }
      }
      return fp;
    })
    setFieldPermissions(temp)
  }

  const handleFilterChange = (fieldName: string, filterString: string) => {
    setFilterInputs({
      ...filterInputs,
      [fieldName]: filterString,
    })
  }

  const handleUpdateUser = () => {
    if (!editingUser) return

    const updatedFieldPermissions = fieldPermissions.map((fp) => ({
      ...fp,
      filter: filterInputs[fp.fieldName] ? filterInputs[fp.fieldName].split(",").map((item) => item.trim()) : [],
    }))

    const updatedUser: SharedWithInterface = {
      ...editingUser,
      fieldPermission: updatedFieldPermissions,
      tablePermissions,
      rowsPerPageLimit,
      workingTimeAccess,
      networkAccess,
      restrictNetwork,
      restrictWorkingTime,
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

  const handleTimeRangeChange = (dayIndex: number, timeRanges: string) => {
    const newWorkingTime = [...workingTimeAccess];
    if (timeRanges === "") {
      newWorkingTime[dayIndex].accessTime = [];
    } else {
      newWorkingTime[dayIndex].accessTime = timeRanges
        .split(",")
        .map(range => range.trim())
        .filter(range => range.includes("-"))
        .map(range => {
          const [start, end] = range.split("-").map(t => t.trim());
          return [start, end] as [string, string];
        });
    }
    setWorkingTimeAccess(newWorkingTime);
  };

  const addTimeRange = (dayIndex: number) => {
    const newWorkingTime = [...workingTimeAccess];
    newWorkingTime[dayIndex].accessTime.push(["09:00", "18:00"]);
    setWorkingTimeAccess(newWorkingTime);
  };

  const removeTimeRange = (dayIndex: number, rangeIndex: number) => {
    const newWorkingTime = [...workingTimeAccess];
    newWorkingTime[dayIndex].accessTime.splice(rangeIndex, 1);
    setWorkingTimeAccess(newWorkingTime);
  };

  const addCurrentIP = async (type: 'IPv4' | 'IPv6') => {
    try {
      const endpoint = type === 'IPv6'
        ? 'https://api6.ipify.org?format=json'
        : 'https://api.ipify.org?format=json';

      const response = await fetch(endpoint);
      const data = await response.json();
      const ip = data.ip;

      setNetworkAccess([
        ...networkAccess,
        {
          IP_ADDRESS: ip,
          enabled: true,
          comment: `Current ${type} Address`,
          type: type
        }
      ]);
    } catch (error) {
      console.error(`Failed to fetch ${type}:`, error);
    }
  };

  if (sharedUsers.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No users have been shared with this table yet.</div>
  }

  console.log(fieldPermissions)

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
                  {user?.fieldPermission?.map((fp) => (
                    <Badge
                      key={fp?.fieldName}
                      variant={fp?.permission === "WRITE" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {fp?.fieldName}: {fp?.permission?.toLowerCase()}
                      {fp.filter?.length > 0 && ` (${fp?.filter.length} filters)`}
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
                    const fieldPermission = fieldPermissions.find((fp) => {
                      return fp.fieldName === field.name
                    })
                    return (
                      <div key={field.name} className="flex flex-col sm:flex-row sm:items-start gap-2">
                        <div className="w-32 pt-2 flex-shrink-0">{field.name}</div>

                        <div className="w-32 flex-shrink-0">
                          <Select
                            value={fieldPermission?.permission || "READ"}
                            onValueChange={(value: "READ" | "WRITE" | "NONE") => handlePermissionChange(field.name, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Permission" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="READ">Read</SelectItem>
                              <SelectItem value="WRITE">Write</SelectItem>
                              <SelectItem value="NONE">None</SelectItem>
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

              <div>
                <h3 className="font-medium mb-3">Table Permissions</h3>
                <div className="border rounded-md p-4 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-32">Edit Table</div>
                    <div className="flex-1">
                      <Select
                        value={tablePermissions.edit ? "true" : "false"}
                        onValueChange={(value) => setTablePermissions(prev => ({ ...prev, edit: value === "true" }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Permission" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Allow</SelectItem>
                          <SelectItem value="false">Deny</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">Delete Table</div>
                    <div className="flex-1">
                      <Select
                        value={tablePermissions.delete ? "true" : "false"}
                        onValueChange={(value) => setTablePermissions(prev => ({ ...prev, delete: value === "true" }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Permission" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Allow</SelectItem>
                          <SelectItem value="false">Deny</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Rows Per Page Limit</h3>
                <div className="border rounded-md p-4">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="rows-limit" className="w-32">Limit</Label>
                    <div className="flex-1">
                      <Input
                        id="rows-limit"
                        type="number"
                        min="1"
                        value={rowsPerPageLimit}
                        onChange={(e) => setRowsPerPageLimit(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Working Time Access</h3>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="restrict-working-time">Restrict Working Time</Label>
                    <input
                      type="checkbox"
                      id="restrict-working-time"
                      checked={restrictWorkingTime}
                      onChange={(e) => setRestrictWorkingTime(e.target.checked)}
                    />
                  </div>
                </div>
                <div className="border rounded-md p-4 space-y-4">
                  {workingTimeAccess.map((day, dayIndex) => (
                    <div key={day.day} className="space-y-2">
                      <div className="flex items-center gap-4">
                        <div className="w-20">{day.day}</div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={day.enabled}
                            onChange={(e) => {
                              const newWorkingTime = [...workingTimeAccess];
                              newWorkingTime[dayIndex].enabled = e.target.checked;
                              setWorkingTimeAccess(newWorkingTime);
                            }}
                          />
                          <Label>Enabled</Label>
                        </div>
                      </div>
                      {day.enabled && (
                        <div className="space-y-2">
                          {day.accessTime.map((range, rangeIndex) => (
                            <div key={rangeIndex} className="flex items-center gap-2">
                              <div className="flex-1">
                                <Input
                                  type="time"
                                  value={range[0]}
                                  onChange={(e) => {
                                    const newWorkingTime = [...workingTimeAccess];
                                    newWorkingTime[dayIndex].accessTime[rangeIndex][0] = e.target.value;
                                    setWorkingTimeAccess(newWorkingTime);
                                  }}
                                />
                              </div>
                              <span>to</span>
                              <div className="flex-1">
                                <Input
                                  type="time"
                                  value={range[1]}
                                  onChange={(e) => {
                                    const newWorkingTime = [...workingTimeAccess];
                                    newWorkingTime[dayIndex].accessTime[rangeIndex][1] = e.target.value;
                                    setWorkingTimeAccess(newWorkingTime);
                                  }}
                                />
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeTimeRange(dayIndex, rangeIndex)}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addTimeRange(dayIndex)}
                          >
                            Add Time Range
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Network Access</h3>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="restrict-network">Restrict Network</Label>
                    <input
                      type="checkbox"
                      id="restrict-network"
                      checked={restrictNetwork}
                      onChange={(e) => setRestrictNetwork(e.target.checked)}
                    />
                  </div>
                </div>
                <div className="border rounded-md p-4 space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addCurrentIP('IPv4')}
                    >
                      Add Current IPv4
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addCurrentIP('IPv6')}
                    >
                      Add Current IPv6
                    </Button>
                  </div>
                  {networkAccess.map((access, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Label>IP Address</Label>
                          <Input
                            value={access.IP_ADDRESS}
                            onChange={(e) => {
                              const newNetworkAccess = [...networkAccess];
                              newNetworkAccess[index].IP_ADDRESS = e.target.value;
                              setNetworkAccess(newNetworkAccess);
                            }}
                            placeholder={access.type === 'IPv4' ? "IPv4 Address" : "IPv6 Address"}
                          />
                        </div>
                        <div className="flex-1">
                          <Label>Comment</Label>
                          <Input
                            value={access.comment}
                            onChange={(e) => {
                              const newNetworkAccess = [...networkAccess];
                              newNetworkAccess[index].comment = e.target.value;
                              setNetworkAccess(newNetworkAccess);
                            }}
                            placeholder="Comment"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={access.enabled}
                            onChange={(e) => {
                              const newNetworkAccess = [...networkAccess];
                              newNetworkAccess[index].enabled = e.target.checked;
                              setNetworkAccess(newNetworkAccess);
                            }}
                          />
                          <Label>Enabled</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{access.type}</span>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setNetworkAccess(networkAccess.filter((_, i) => i !== index));
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setNetworkAccess([
                          ...networkAccess,
                          { IP_ADDRESS: "", enabled: true, comment: "", type: 'IPv4' }
                        ]);
                      }}
                    >
                      Add IPv4 Access
                    </Button>
                    <Button
                      onClick={() => {
                        setNetworkAccess([
                          ...networkAccess,
                          { IP_ADDRESS: "", enabled: true, comment: "", type: 'IPv6' }
                        ]);
                      }}
                    >
                      Add IPv6 Access
                    </Button>
                  </div>
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

