import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  FieldInterface,
  SharedWithInterface,
  FieldPermissionInterface,
  WorkingTimeAccessInterface,
  NetworkAccessInterface,
} from "@repo/types";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sharedUser: SharedWithInterface) => void;
  fields: FieldInterface[];
}

const ShareModal = ({ isOpen, onClose, onSubmit, fields }: ShareModalProps) => {
  const [email, setEmail] = useState("");
  const [fieldPermissions, setFieldPermissions] = useState<
    FieldPermissionInterface[]
  >(
    fields.map((field) => ({
      fieldName: field.name,
      permission: "READ",
      filter: [],
    }))
  );
  const [filterInputs, setFilterInputs] = useState<Record<string, string>>(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {})
  );
  const [error, setError] = useState("");
  const [tablePermissions, setTablePermissions] = useState({
    edit: false,
    delete: false,
  });
  const [rowsPerPageLimit, setRowsPerPageLimit] = useState(10);
  const [workingTimeAccess, setWorkingTimeAccess] = useState<
    WorkingTimeAccessInterface[]
  >(
    ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => ({
      day: day as "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT",
      accessTime: day === "SUN" ? [] : [["09:00", "18:00"]],
      enabled: true,
    }))
  );
  const [networkAccess, setNetworkAccess] = useState<NetworkAccessInterface[]>(
    []
  );
  const [restrictNetwork, setRestrictNetwork] = useState(false);
  const [restrictWorkingTime, setRestrictWorkingTime] = useState(false);

  const handlePermissionChange = (
    fieldName: string,
    permission: "READ" | "WRITE"
  ) => {
    setFieldPermissions(
      fieldPermissions.map((fp) =>
        fp.fieldName === fieldName ? { ...fp, permission } : fp
      )
    );
  };

  const handleFilterChange = (fieldName: string, filterString: string) => {
    setFilterInputs({
      ...filterInputs,
      [fieldName]: filterString,
    });
  };

  const handleTablePermissionChange = (
    permission: "edit" | "delete",
    value: boolean
  ) => {
    setTablePermissions((prev) => ({
      ...prev,
      [permission]: value,
    }));
  };

  const validateEmail = (email: string) => {
    return email !== "";
  };

  const handleSubmit = () => {
    if (!validateEmail(email)) {
      setError("Please select a user");
      return;
    }

    const updatedFieldPermissions = fieldPermissions.map((fp) => ({
      ...fp,
      filter: filterInputs[fp.fieldName]
        ? filterInputs[fp.fieldName].split(",").map((item) => item.trim())
        : [],
    }));

    // Create a simplified network access array without MongoDB-specific fields
    const simplifiedNetworkAccess = networkAccess.map((access) => ({
      IP_ADDRESS: access.IP_ADDRESS,
      enabled: access.enabled,
      comment: access.comment,
      type: access.type,
    }));

    const newSharedUser: SharedWithInterface = {
      email,
      fieldPermission: updatedFieldPermissions,
      tablePermissions,
      rowsPerPageLimit,
      isBlocked: false,
      workingTimeAccess,
      networkAccess: simplifiedNetworkAccess, // Use the simplified array
      restrictNetwork,
      restrictWorkingTime,
    };

    onSubmit(newSharedUser);
    resetForm();
  };

  const resetForm = () => {
    setEmail("");
    setFieldPermissions(
      fields.map((field) => ({
        fieldName: field.name,
        permission: "READ",
        filter: [],
      }))
    );
    setFilterInputs(
      fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {})
    );
    setError("");
    setTablePermissions({
      edit: false,
      delete: false,
    });
    setRowsPerPageLimit(10);
    setWorkingTimeAccess(
      ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => ({
        day: day as "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT",
        accessTime: day === "SUN" ? [] : [["09:00", "18:00"]],
        enabled: true,
      }))
    );
    setNetworkAccess([]);
    setRestrictNetwork(false);
    setRestrictWorkingTime(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleTimeRangeChange = (dayIndex: number, timeRanges: string) => {
    const newWorkingTime = [...workingTimeAccess];
    if (timeRanges === "") {
      newWorkingTime[dayIndex].accessTime = [];
    } else {
      newWorkingTime[dayIndex].accessTime = timeRanges
        .split(",")
        .map((range) => range.trim())
        .filter((range) => range.includes("-"))
        .map((range) => {
          const [start, end] = range.split("-").map((t) => t.trim());
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

  const addCurrentIP = async (type: "IPv4" | "IPv6") => {
    try {
      // Use different endpoints for IPv4 and IPv6
      const endpoint =
        type === "IPv6"
          ? "https://api6.ipify.org?format=json"
          : "https://api.ipify.org?format=json";

      const response = await fetch(endpoint);
      const data = await response.json();
      const ip = data.ip;

      setNetworkAccess([
        ...networkAccess,
        {
          IP_ADDRESS: ip,
          enabled: true,
          comment: `Current ${type} Address`,
          type: type,
        },
      ]);
    } catch (error) {
      console.error(`Failed to fetch ${type}:`, error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:w-full max-w-[calc(95%)] px-0 sm:px-6  pt-10 max-h-[95vh] overflow-y-auto">
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
          <div className="flex items-center gap-4 px-2">
            <Label htmlFor="user-select" className="w-20 flex-shrink-0">
              Email
            </Label>
            <div className="flex-1">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email "
              />
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3 px-2">Column Permissions</h3>
            <div className="border rounded-md p-4 space-y-6">
              {fields.map((field) => (
                <div
                  key={field.name}
                  className="flex flex-col sm:flex-row sm:items-start gap-2"
                >
                  <div className="w-32 pt-2 flex-shrink-0">{field.name}</div>

                  <div className="w-32 flex-shrink-0">
                    <Select
                      value={
                        fieldPermissions.find(
                          (fp) => fp.fieldName === field.name
                        )?.permission || "READ"
                      }
                      onValueChange={(value: "READ" | "WRITE") =>
                        handlePermissionChange(field.name, value)
                      }
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
                        onChange={(e) =>
                          handleFilterChange(field.name, e.target.value)
                        }
                        placeholder="Filter ( Comma Seperated , )"
                      />
                    </div>
                  </div>
                </div>
              ))}
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
                    onValueChange={(value) =>
                      handleTablePermissionChange("edit", value === "true")
                    }
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
                    onValueChange={(value) =>
                      handleTablePermissionChange("delete", value === "true")
                    }
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
                <Label htmlFor="rows-limit" className="w-32">
                  Limit
                </Label>
                <div className="flex-1">
                  <Input
                    id="rows-limit"
                    type="number"
                    min="1"
                    value={rowsPerPageLimit}
                    onChange={(e) =>
                      setRowsPerPageLimit(Number(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Working Time Access</h3>
              <div className="flex items-center gap-2">
                <Label htmlFor="restrict-working-time">
                  Restrict Working Time
                </Label>
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
                    <div className="ml-24 space-y-2">
                      {day.accessTime.map((range, rangeIndex) => (
                        <div
                          key={rangeIndex}
                          className="flex items-center gap-2 flex-wrap sm:flex-nowrap"
                        >
                          <Input
                            type="time"
                            value={range[0]}
                            onChange={(e) => {
                              const newWorkingTime = [...workingTimeAccess];
                              newWorkingTime[dayIndex].accessTime[
                                rangeIndex
                              ][0] = e.target.value;
                              setWorkingTimeAccess(newWorkingTime);
                            }}
                            className="w-32"
                          />
                          <span>to</span>
                          <Input
                            type="time"
                            value={range[1]}
                            onChange={(e) => {
                              const newWorkingTime = [...workingTimeAccess];
                              newWorkingTime[dayIndex].accessTime[
                                rangeIndex
                              ][1] = e.target.value;
                              setWorkingTimeAccess(newWorkingTime);
                            }}
                            className="w-32"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              removeTimeRange(dayIndex, rangeIndex)
                            }
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
            <div className="flex items-center justify-between mb-3 px-2">
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
                  onClick={() => addCurrentIP("IPv4")}
                >
                  Add Current IPv4
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addCurrentIP("IPv6")}
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
                        placeholder={
                          access.type === "IPv4"
                            ? "IPv4 Address"
                            : "IPv6 Address"
                        }
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
                      <span className="text-sm text-gray-500">
                        {access.type}
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setNetworkAccess(
                            networkAccess.filter((_, i) => i !== index)
                          );
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
                      {
                        IP_ADDRESS: "",
                        enabled: true,
                        comment: "",
                        type: "IPv4",
                      },
                    ]);
                  }}
                  className="bg-[#4161ed] hover:bg-[#1f3fcc]"
                >
                  Add IPv4 Access
                </Button>
                <Button
                  onClick={() => {
                    setNetworkAccess([
                      ...networkAccess,
                      {
                        IP_ADDRESS: "",
                        enabled: true,
                        comment: "",
                        type: "IPv6",
                      },
                    ]);
                  }}
                  className="bg-[#4161ed] hover:bg-[#1f3fcc]"
                >
                  Add IPv6 Access
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 px-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Share</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
