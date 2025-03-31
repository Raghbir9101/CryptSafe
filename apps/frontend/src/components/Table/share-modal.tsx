import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FieldInterface, SharedWithInterface, FieldPermissionInterface } from "@repo/types"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (sharedUser: SharedWithInterface) => void
  fields: FieldInterface[]
}

const ShareModal = ({ isOpen, onClose, onSubmit, fields }: ShareModalProps) => {
  // Mock users for the select dropdown
  const availableUsers = [
    { email: "john.doe@example.com", name: "John Doe" },
    { email: "jane.smith@example.com", name: "Jane Smith" },
    { email: "alex.wilson@example.com", name: "Alex Wilson" },
    { email: "sarah.parker@example.com", name: "Sarah Parker" },
    { email: "mike.johnson@example.com", name: "Mike Johnson" },
  ]

  const [email, setEmail] = useState("")
  const [fieldPermissions, setFieldPermissions] = useState<FieldPermissionInterface[]>(
    fields.map((field) => ({
      fieldName: field.name,
      permission: "READ",
      filter: [],
    })),
  )
  const [filterInputs, setFilterInputs] = useState<Record<string, string>>(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {}),
  )
  const [error, setError] = useState("")

  const handlePermissionChange = (fieldName: string, permission: "READ" | "WRITE") => {
    setFieldPermissions(fieldPermissions.map((fp) => (fp.fieldName === fieldName ? { ...fp, permission } : fp)))
  }

  const handleFilterChange = (fieldName: string, filterString: string) => {
    setFilterInputs({
      ...filterInputs,
      [fieldName]: filterString,
    })
  }

  const validateEmail = (email: string) => {
    return email !== ""
  }

  const handleSubmit = () => {
    if (!validateEmail(email)) {
      setError("Please select a user")
      return
    }

    // Convert comma-separated filter strings to arrays
    const updatedFieldPermissions = fieldPermissions.map((fp) => ({
      ...fp,
      filter: filterInputs[fp.fieldName] ? filterInputs[fp.fieldName].split(",").map((item) => item.trim()) : [],
    }))

    const newSharedUser: SharedWithInterface = {
      email,
      fieldPermission: updatedFieldPermissions,
      isBlocked: false,
    }

    onSubmit(newSharedUser)
    resetForm()
  }

  const resetForm = () => {
    setEmail("")
    setFieldPermissions(
      fields.map((field) => ({
        fieldName: field.name,
        permission: "READ",
        filter: [],
      })),
    )
    setFilterInputs(fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {}))
    setError("")
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Table with User</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6 py-2">
          <div className="flex items-center gap-4">
            <Label htmlFor="user-select" className="w-20 flex-shrink-0">
              Email
            </Label>
            <div className="flex-1">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email " />
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Column Permissions</h3>
            <div className="border rounded-md p-4 space-y-6">
              {fields.map((field) => (
                <div key={field.name} className="flex flex-col sm:flex-row sm:items-start gap-2">
                  <div className="w-32 pt-2 flex-shrink-0">{field.name}</div>

                  <div className="w-32 flex-shrink-0">
                    <Select
                      value={fieldPermissions.find((fp) => fp.fieldName === field.name)?.permission || "READ"}
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
                        id={`filter-${field.name}`}
                        value={filterInputs[field.name]}
                        onChange={(e) => handleFilterChange(field.name, e.target.value)}
                        placeholder="Filter ( Comma Seperated , )"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Share</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ShareModal

