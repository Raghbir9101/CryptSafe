import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../Utils/utils";
import {
  Plus,
  Save,
  X,
  Pencil,
  Trash2,
  ArrowUpDown,
  Search,
  ShareIcon,
  Import,
} from "lucide-react";
import { parse, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SelectedTable } from "../Services/TableService";
import { Auth } from "../Services/AuthService";
import {
  decryptObjectValues,
  encryptObjectValues,
} from "../Services/encrption";

interface TableField {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  options?: string[];
  unique?: boolean;
}

interface TableRow {
  _id: string;
  data: Record<string, any>;
  createdAt: string;
}

type SortDirection = "asc" | "desc" | null;
type SortConfig = {
  field: string;
  direction: SortDirection;
};

type DateRangeFilter = {
  start: string;
  end: string;
};

export default function TableContent() {
  const [tableFields, setTableFields] = useState<TableField[]>([]);
  const [rows, setRows] = useState<TableRow[]>([]);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [newRow, setNewRow] = useState<Record<string, any>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [csvPreviewData, setCsvPreviewData] = useState<
    Record<string, any>[] | null
  >(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "",
    direction: null,
  });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateRangeFilters, setDateRangeFilters] = useState<
    Record<string, DateRangeFilter>
  >({});
  const [tableData, setTableData] = useState<any>(null);
  const [currentUserTableContent, setCurrentUserTableContent] =
    useState<any>(null);
  const [selectedStats, setSelectedStats] = useState<Record<string, string[]>>(
    {}
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { id } = useParams();

  useEffect(() => {
    fetchTableData();
  }, [id, currentPage, rowsPerPage]);

  const fetchTableData = async () => {
    try {
      const [tableRes, rowsRes] = await Promise.all([
        api.get(`/tables/${id}`),
        api.get(`/tables/rows/${id}?page=${currentPage}&limit=${rowsPerPage}`),
      ]);
      console.log("API Response:", rowsRes.data);
      const decryptedTable = decryptObjectValues(
        tableRes?.data,
        import.meta.env.VITE_GOOGLE_API
      );

      // Handle the new response structure
      const rowsData = rowsRes.data?.rows || [];
      const total = rowsRes.data?.total || 0;

      const decryptedRows = rowsData.map((row: any) => ({
        ...row,
        data: decryptObjectValues(row?.data, import.meta.env.VITE_GOOGLE_API),
      }));

      console.log("Decrypted Rows:", decryptedRows);
      setTableFields(decryptedTable.fields);
      setTableData(decryptedTable);
      setRows(decryptedRows);
      setTotalRows(total);

      // Initialize newRow with empty values for each field
      const emptyRow = decryptedTable.fields.reduce(
        (acc: Record<string, any>, field: TableField) => {
          acc[field.name] = "";
          return acc;
        },
        {}
      );
      setNewRow(emptyRow);
    } catch (error) {
      console.error("Error fetching table data:", error);
      toast.error("Failed to load table data");
    }
  };

  const isOwner = tableData?.createdBy === Auth.value.loggedInUser?._id;
  const sharedUser = tableData?.sharedWith?.find(
    (user: any) => user.email === Auth.value.loggedInUser?.email
  );
  const fieldPermissions = sharedUser?.fieldPermission || [];

  const hasWritePermission = (fieldName: string) => {
    if (isOwner) return true;
    if (!sharedUser) return false;

    const fieldPermission = fieldPermissions.find(
      (fp: any) => fp.fieldName === fieldName
    );
    return fieldPermission?.permission === "WRITE";
  };

  const hasAnyWritePermission = () => {
    if (isOwner) return true;
    if (!sharedUser) return false;
    return fieldPermissions.some((fp: any) => fp.permission === "WRITE");
  };

  const canAddRow = () => {
    if (isOwner) return true;
    if (!sharedUser) return false;

    // Get all required fields
    const requiredFields = tableFields.filter((field) => field.required);

    // Check if user has write permission for all required fields
    return requiredFields.every((field) => hasWritePermission(field.name));
  };

  const handleEdit = (rowId: string) => {
    setEditingRow(rowId);
  };

  const handleSave = async (rowId: string) => {
    try {
      const row = rows.find((r) => r._id === rowId);
      if (!row) return;

      // Check for unique constraints
      const uniqueFields = tableFields.filter((field) => field.unique);
      for (const field of uniqueFields) {
        const value = row.data[field.name];
        if (value) {
          const existingRow = rows.find(
            (r) => r._id !== rowId && r.data[field.name] === value
          );
          if (existingRow) {
            toast.error(
              `${field.name} must be unique. Value "${value}" already exists.`
            );
            return;
          }
        }
      }

      // Process the data to handle date conversions
      const processedData = { ...row.data };
      tableFields.forEach((field) => {
        if (
          (field.type === "DATE" || field.type === "DATE-TIME") &&
          processedData[field.name]
        ) {
          processedData[field.name] = new Date(
            processedData[field.name]
          ).toISOString();
        }
      });
      const encryptedData = encryptObjectValues(
        processedData,
        import.meta.env.VITE_GOOGLE_API
      );
      await api.patch(`/tables/update/${id}/${rowId}`, encryptedData);
      setEditingRow(null);
      toast.success("Row updated successfully");
      fetchTableData(); // Refresh data to ensure consistency
    } catch (error: any) {
      console.error("Error saving row:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to save changes");
      }
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    fetchTableData(); // Reset changes
  };

  const handleDelete = async (rowId: string) => {
    try {
      await api.delete(`/tables/delete/${id}/${rowId}`);
      setRows(rows.filter((row) => row._id !== rowId));
      toast.success("Row deleted successfully");
    } catch (error) {
      console.error("Error deleting row:", error);
      toast.error("Failed to delete row");
    }
  };
  const handleBulkAdd = async (rows: Record<string, any>[]) => {
    try {
      // Process all rows and validate against table fields
      const processedRows = rows.map((row) => {
        const processedData = { ...row };
        tableFields.forEach((field) => {
          if (
            (field.type === "DATE" || field.type === "DATE-TIME") &&
            processedData[field.name]
          ) {
            // Ensure date is in ISO format
            processedData[field.name] = new Date(
              processedData[field.name]
            ).toISOString();
          }
        });
        return processedData;
      });

      // Encrypt all rows
      const encryptedData = processedRows.map((row) =>
        encryptObjectValues(row, import.meta.env.VITE_GOOGLE_API)
      );

      // Send to server
      await api.post(`/tables/insert-bulk/${id}`, encryptedData);

      // Refresh table data
      await fetchTableData();

      // Show success message
      toast.success(`Successfully added ${rows.length} records`);

      return true;
    } catch (error: any) {
      console.error("Error adding rows:", error);
      toast.error(error.response?.data?.message || "Failed to add records");
      return false;
    }
  };

  const handleImportRows = async () => {
    try {
      const addPromises = [];
      // Validate required fields
      for (let newRow of csvPreviewData || []) {
        const missingFields = tableFields
          .filter((field) => field.required)
          .filter((field) => !newRow[field.name]);

        if (missingFields.length > 0) {
          toast.error(
            `Please fill in required fields: ${missingFields.map((f) => f.name).join(", ")}`
          );
          return;
        }

        // Check for unique constraints
        const uniqueFields = tableFields.filter((field) => field.unique);
        for (const field of uniqueFields) {
          const value = newRow[field.name];
          if (value) {
            const existingRow = rows.find(
              (row) => row.data[field.name] === value
            );
            if (existingRow) {
              toast.error(
                `${field.name} must be unique. Value "${value}" already exists.`
              );
              return;
            }
          }
        }

        // Process the data to handle date conversions
        const processedData = { ...newRow };
        tableFields.forEach((field) => {
          if (
            (field.type === "DATE" || field.type === "DATE-TIME") &&
            processedData[field.name]
          ) {
            processedData[field.name] = new Date(
              processedData[field.name]
            ).toISOString();
          }
        });
        // const encryptedData = encryptObjectValues(processedData, import.meta.env.VITE_GOOGLE_API);
        // const response = await api.post(`/tables/insert/${id}`, encryptedData);
        // const decryptedResponse = decryptObjectValues(response.data, import.meta.env.VITE_GOOGLE_API);
        // setRows([...rows, decryptedResponse.row]);

        const encryptedData = encryptObjectValues(
          processedData,
          import.meta.env.VITE_GOOGLE_API
        );
        addPromises.push(api.post(`/tables/insert/${id}`, encryptedData));
        // const decryptedResponse = decryptObjectValues(response.data, import.meta.env.VITE_GOOGLE_API);
        // setRows([...rows, decryptedResponse.row]);
      }

      const responses = await Promise.all(addPromises);
      const newRows = responses.map(
        (response) =>
          decryptObjectValues(response.data, import.meta.env.VITE_GOOGLE_API)
            .row
      );
      setRows([...rows, ...newRows]);
      setCsvPreviewData(null); // Clear preview data after import
      setIsAddModalOpen(false);
      toast.success("Rows added successfully");
    } catch (error: any) {
      console.error("Error adding row:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to add row");
      }
    }
  };

  const handleAddRow = async () => {
    try {
      // Validate required fields
      const missingFields = tableFields
        .filter((field) => field.required)
        .filter((field) => !newRow[field.name]);

      if (missingFields.length > 0) {
        toast.error(
          `Please fill in required fields: ${missingFields.map((f) => f.name).join(", ")}`
        );
        return;
      }

      // Check for unique constraints
      const uniqueFields = tableFields.filter((field) => field.unique);
      for (const field of uniqueFields) {
        const value = newRow[field.name];
        if (value) {
          const existingRow = rows.find(
            (row) => row.data[field.name] === value
          );
          if (existingRow) {
            toast.error(
              `${field.name} must be unique. Value "${value}" already exists.`
            );
            return;
          }
        }
      }

      // Process the data to handle date conversions
      const processedData = { ...newRow };
      tableFields.forEach((field) => {
        if (
          (field.type === "DATE" || field.type === "DATE-TIME") &&
          processedData[field.name]
        ) {
          processedData[field.name] = new Date(
            processedData[field.name]
          ).toISOString();
        }
      });
      const encryptedData = encryptObjectValues(
        processedData,
        import.meta.env.VITE_GOOGLE_API
      );
      const response = await api.post(`/tables/insert/${id}`, encryptedData);
      const decryptedResponse = decryptObjectValues(
        response.data,
        import.meta.env.VITE_GOOGLE_API
      );
      setRows([...rows, decryptedResponse.row]);

      // Reset new row form
      setNewRow(
        tableFields.reduce((acc: Record<string, any>, field) => {
          acc[field.name] = "";
          return acc;
        }, {})
      );

      setIsAddModalOpen(false);
      toast.success("Row added successfully");
    } catch (error: any) {
      console.error("Error adding row:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to add row");
      }
    }
  };

  const handleInputChange = (
    rowId: string | null,
    fieldName: string,
    value: any
  ) => {
    if (rowId) {
      setRows(
        rows.map((row) =>
          row._id === rowId
            ? { ...row, data: { ...row.data, [fieldName]: value } }
            : row
        )
      );
    } else {
      setNewRow({ ...newRow, [fieldName]: value });
    }
  };

  const formatValue = (value: any, type: string) => {
    if (type === "BOOLEAN") {
      return value === true || value === "true" ? "Yes" : "No";
    }
    if (!value) return "";
    if (type === "DATE") {
      return new Date(value).toLocaleDateString();
    }
    if (type === "DATE-TIME") {
      return new Date(value).toLocaleString();
    }
    return value;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date
      .toLocaleString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(",", "");
  };

  const renderInputField = (
    field: TableField,
    value: any,
    onChange: (value: any) => void
  ) => {
    const baseInputClass = "h-8 w-full px-2 text-sm"; // Reduced from h-9 to h-8

    switch (field.type) {
      case "TEXT":
        return (
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.name}`}
            className={baseInputClass}
          />
        );
      case "NUMBER":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.name}`}
            className={baseInputClass}
          />
        );
      case "DATE":
        return (
          <Input
            type="date"
            value={value ? new Date(value).toISOString().split("T")[0] : ""}
            onChange={(e) => {
              const dateValue = e.target.value;
              if (dateValue) {
                const date = new Date(dateValue + "T00:00:00.000Z");
                onChange(date.toISOString());
              } else {
                onChange("");
              }
            }}
            className={`${baseInputClass} `}
          />
        );
      case "DATE-TIME":
        return (
          <Input
            type="datetime-local"
            value={
              value
                ? new Date(value)
                    .toLocaleString("sv", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    .replace(" ", "T")
                : ""
            }
            onChange={(e) => {
              const dateTimeValue = e.target.value;
              if (dateTimeValue) {
                const date = new Date(dateTimeValue);
                onChange(date.toISOString());
              } else {
                onChange("");
              }
            }}
            className={`${baseInputClass} min-w-[200px]`}
          />
        );
      case "BOOLEAN":
        return (
          <div className="flex items-center h-9">
            {" "}
            {/* Match height */}
            <Checkbox
              checked={value === true || value === "true"}
              onCheckedChange={(checked) => {
                onChange(checked === true);
              }}
            />
          </div>
        );
      case "TEXTAREA":
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.name}`}
            className={`${baseInputClass} min-h-[36px] resize-none`}
          />
        );
      case "SELECT":
        return (
          <Select value={value || ""} onValueChange={onChange}>
            <SelectTrigger className={baseInputClass}>
              <SelectValue placeholder={`Select ${field.name}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.name}`}
            className={baseInputClass}
          />
        );
    }
  };

  const handleSort = (field: string) => {
    setSortConfig((prevConfig) => {
      if (prevConfig.field === field) {
        if (prevConfig.direction === "asc") return { field, direction: "desc" };
        if (prevConfig.direction === "desc") return { field, direction: null };
        return { field, direction: "asc" };
      }
      return { field, direction: "asc" };
    });
  };

  const handleFilter = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateRangeFilter = (
    field: string,
    type: "start" | "end",
    value: string
  ) => {
    setDateRangeFilters((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [type]: value,
      },
    }));
  };

  const clearDateRangeFilter = (field: string) => {
    setDateRangeFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[field];
      return newFilters;
    });
  };

  const getSortedAndFilteredRows = () => {
    if (!rows || !Array.isArray(rows)) {
      return [];
    }

    let filteredRows = [...rows];

    // Apply text filters
    Object.entries(filters).forEach(([field, value]) => {
      if (value) {
        filteredRows = filteredRows.filter((row) => {
          const cellValue = row.data[field];
          if (cellValue === null || cellValue === undefined) return false;
          return cellValue
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase());
        });
      }
    });

    // Apply date range filters
    Object.entries(dateRangeFilters).forEach(([field, range]) => {
      if (range.start || range.end) {
        filteredRows = filteredRows.filter((row) => {
          const cellValue = row.data[field];
          if (!cellValue) return false;

          const date = new Date(cellValue);
          const startDate = range.start ? new Date(range.start) : null;
          const endDate = range.end ? new Date(range.end) : null;

          if (startDate && endDate) {
            return date >= startDate && date <= endDate;
          } else if (startDate) {
            return date >= startDate;
          } else if (endDate) {
            return date <= endDate;
          }
          return true;
        });
      }
    });

    // Apply sorting
    if (sortConfig.field && sortConfig.direction) {
      filteredRows.sort((a, b) => {
        const aValue = a.data[sortConfig.field];
        const bValue = b.data[sortConfig.field];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        const fieldType = tableFields.find(
          (f) => f.name === sortConfig.field
        )?.type;

        if (fieldType === "NUMBER") {
          return sortConfig.direction === "asc"
            ? Number(aValue) - Number(bValue)
            : Number(bValue) - Number(aValue);
        }

        if (fieldType === "DATE" || fieldType === "DATE-TIME") {
          return sortConfig.direction === "asc"
            ? new Date(aValue).getTime() - new Date(bValue).getTime()
            : new Date(bValue).getTime() - new Date(aValue).getTime();
        }

        return sortConfig.direction === "asc"
          ? aValue.toString().localeCompare(bValue.toString())
          : bValue.toString().localeCompare(aValue.toString());
      });
    }

    return filteredRows;
  };
  const hasShowPermission = (fieldName: string) => {
    const fieldPermission = currentUserTableContent?.fieldPermission?.find(
      (fp: any) => fp?.fieldName === fieldName
    );
    return fieldPermission?.permission === "NONE" ? false : true;
  };
  useEffect(() => {
    const user = tableData?.sharedWith?.find(
      (per: any) => per.email === Auth.value.loggedInUser?.email
    );
    setCurrentUserTableContent(user);
  }, [tableData]);

  const [openCsvContent, setOpenCsvContent] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const csvReader = async (e) => {
    const file = e.target.files?.[0];
    console.log("CSV Reader triggered", file);
    if (!file) {
      toast.error("No file selected");
      return;
    }
    if (file.type !== "text/csv") {
      toast.error("Please upload a valid CSV file");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvData = e.target?.result as string;
      const rows = csvData.split("\n").map((row) => row.split(","));
      if (rows.length === 0) {
        toast.error("CSV file is empty");
        return;
      }
      const headers = rows[0].map((h) => h.trim());
      const tableFieldNames = tableFields.map((f) => f.name);

      // Validate headers match table fields
      const missingFields = tableFieldNames.filter(
        (field) => !headers.includes(field)
      );
      const extraFields = headers.filter(
        (header) => !tableFieldNames.includes(header)
      );

      if (missingFields.length > 0) {
        toast.error(`Missing required columns: ${missingFields.join(", ")}`);
        return;
      }

      if (extraFields.length > 0) {
        toast.error(`Unknown columns: ${extraFields.join(", ")}`);
        return;
      }

      const newRows: Record<string, any>[] = [];
      const errors: string[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length !== headers.length) continue; // Skip malformed rows

        const rowData: Record<string, any> = {};
        const rowNum = i + 1;
        let isValidRow = true;

        headers.forEach((header, index) => {
          const value = row[index].trim();
          const field = tableFields.find((f) => f.name === header);

          if (field) {
            try {
              // Type validation
              switch (field.type) {
                case "NUMBER":
                  if (value && isNaN(Number(value))) {
                    errors.push(
                      `Row ${rowNum}: "${value}" is not a valid number for column "${header}"`
                    );
                    isValidRow = false;
                  }
                  rowData[header] = value ? Number(value) : null;
                  break;
                case "DATE":
                case "DATE-TIME":
                  if (value) {
                    // Try different date formats
                    const dateFormats = [
                      "yyyy-MM-dd", // 2023-12-31
                      "dd/MM/yyyy", // 31/12/2023
                      "MM/dd/yyyy", // 12/31/2023
                      "dd-MM-yyyy", // 31-12-2023
                      "MM-dd-yyyy", // 12-31-2023
                      "dd.MM.yyyy", // 31.12.2023
                      "yyyy-MM-dd HH:mm", // 2023-12-31 15:30
                      "dd/MM/yyyy HH:mm", // 31/12/2023 15:30
                      "MM/dd/yyyy HH:mm", // 12/31/2023 15:30
                      "yyyy-MM-dd'T'HH:mm", // 2023-12-31T15:30
                    ];

                    let parsedDate = null;
                    // Try to parse with each format until one works
                    for (const format of dateFormats) {
                      const attemptParse = parse(value, format, new Date());
                      if (isValid(attemptParse)) {
                        parsedDate = attemptParse;
                        break;
                      }
                    }

                    if (!parsedDate) {
                      // If no format worked, try native Date parsing as last resort
                      const nativeDate = new Date(value);
                      if (isValid(nativeDate)) {
                        parsedDate = nativeDate;
                      }
                    }

                    if (!parsedDate || !isValid(parsedDate)) {
                      errors.push(
                        `Row ${rowNum}: "${value}" is not a valid ${field.type.toLowerCase()} for column "${header}". Try formats like: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY`
                      );
                      isValidRow = false;
                    }
                    rowData[header] = parsedDate
                      ? parsedDate.toISOString()
                      : null;
                  } else {
                    rowData[header] = null;
                  }
                  break;

                case "BOOLEAN":
                  const boolValue = value.toLowerCase();
                  if (
                    value &&
                    !["true", "false", "1", "0", "yes", "no"].includes(
                      boolValue
                    )
                  ) {
                    errors.push(
                      `Row ${rowNum}: "${value}" is not a valid boolean for column "${header}"`
                    );
                    isValidRow = false;
                  }
                  rowData[header] = ["true", "1", "yes"].includes(boolValue);
                  break;

                case "SELECT":
                  if (
                    value &&
                    field.options &&
                    !field.options.includes(value)
                  ) {
                    errors.push(
                      `Row ${rowNum}: "${value}" is not a valid option for column "${header}". Valid options: ${field.options.join(", ")}`
                    );
                    isValidRow = false;
                  }
                  rowData[header] = value;
                  break;

                default:
                  rowData[header] = value;
              }

              // Required field validation
              if (field.required && !value) {
                errors.push(`Row ${rowNum}: "${header}" is required but empty`);
                isValidRow = false;
              }

              // Unique field validation (only against other imported rows)
              if (field.unique && value) {
                const duplicate = newRows.find((r) => r[header] === value);
                if (duplicate) {
                  errors.push(
                    `Row ${rowNum}: "${value}" in column "${header}" is duplicate. Values must be unique.`
                  );
                  isValidRow = false;
                }
              }
            } catch (error) {
              errors.push(
                `Row ${rowNum}: Error processing "${header}": ${error.message}`
              );
              isValidRow = false;
            }
          }
        });

        if (isValidRow) {
          newRows.push(rowData);
        }
      }

      if (errors.length > 0) {
        console.log("Validation errors:", errors);
        toast.error(
          <div>
            <p>Found {errors.length} validation errors:</p>
            <ul className="mt-2 list-disc list-inside">
              {errors.slice(0, 5).map((error, i) => (
                <li key={i} className="text-sm">
                  {error}
                </li>
              ))}
              {errors.length > 5 && (
                <li className="text-sm">
                  ...and {errors.length - 5} more errors
                </li>
              )}
            </ul>
          </div>
        );
        return;
      }

      if (newRows.length === 0) {
        toast.error("No valid rows found in CSV file");
        return;
      }

      try {
        setCsvPreviewData(newRows);
        setOpenCsvContent(true);
      } catch (error: any) {
        console.error("Error importing records:", error);
        toast.error(
          error.response?.data?.message || "Failed to import records"
        );
      }
    };
    reader.readAsText(file);
  };

  const handleRowsPerPageChange = (value: string) => {
    const newRowsPerPage = parseInt(value);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  const renderPagination = () => {
    if (totalRows === 0) return null;

    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between p-4 flex-wrap md:flex-nowrap gap-5 md:gap-1">
        <div className="flex justify-between items-center gap-4 w-full md:w-auto">
          <span className="text-sm text-gray-700">
            Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
            {Math.min(currentPage * rowsPerPage, totalRows)} of {totalRows}{" "}
            entries
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Rows per page:</span>
            <Select
              value={rowsPerPage.toString()}
              onValueChange={handleRowsPerPageChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={rowsPerPage} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-between items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {startPage > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
              >
                1
              </Button>
              {startPage > 2 && <span className="px-2">...</span>}
            </>
          )}
          {pageNumbers.map((number) => (
            <Button
              key={number}
              variant={currentPage === number ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(number)}
            >
              {number}
            </Button>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2">...</span>}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="px-1 py-3 md:container md:mx-auto md:px-6 md:py-10">
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4 md:mb-4">
          <h1 className="text-center text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight">
            Table Content
          </h1>
          <div className="flex items-center gap-2">
            <Dialog open={openCsvContent} onOpenChange={setOpenCsvContent}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => csvInputRef.current.click()}
                  className="bg-[#405fe8] hover:bg-[#1f3fcc] cursor-pointer"
                >
                  <Import className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Import Records</span>
                  <input
                    type="file"
                    hidden
                    ref={csvInputRef}
                    accept=".csv"
                    onChange={csvReader}
                  />
                </Button>
              </DialogTrigger>
              <DialogContent
                style={{ maxWidth: "none" }}
                className="w-[98vw] h-[95vh]"
              >
                <DialogHeader>
                  <DialogTitle>CSV Import Preview</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col h-[calc(95vh-150px)]">
                  {csvPreviewData ? (
                    <div className="flex-1 flex flex-col">
                      <div className="flex-1 relative">
                        <div className="absolute inset-0 overflow-auto">
                          <div className="inline-block min-w-full">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  {Object.keys(csvPreviewData[0] || {}).map(
                                    (header) => (
                                      <TableHead
                                        key={header}
                                        className="min-w-[200px] sticky top-0 bg-white z-10"
                                      >
                                        {header}
                                      </TableHead>
                                    )
                                  )}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {csvPreviewData.map((row, index) => (
                                  <TableRow key={index}>
                                    {Object.values(row).map((value, i) => (
                                      <TableCell
                                        key={i}
                                        className="whitespace-nowrap"
                                      >
                                        {value as string}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end items-center gap-2 mt-4">
                        <span className="text-sm text-muted-foreground">
                          {csvPreviewData.length} records found
                        </span>
                        <div className="flex-1" />
                        <Button
                          variant="outline"
                          onClick={() => {
                            setOpenCsvContent(false);
                            setCsvPreviewData(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleImportRows}>
                          Import All Records
                        </Button>
                        <Button
                          onClick={async () => {
                            const success = await handleBulkAdd(csvPreviewData);
                            if (success) {
                              setOpenCsvContent(false);
                              setCsvPreviewData(null);
                            }
                          }}
                          className="bg-[#405fe8] hover:bg-[#1f3fcc]"
                        >
                          Add to Table
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p>Select a CSV file to preview data</p>
                      <Button
                        onClick={() => csvInputRef.current.click()}
                        className="bg-[#405fe8] hover:bg-[#1f3fcc] cursor-pointer"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Import Records
                        <input
                          type="file"
                          hidden
                          ref={csvInputRef}
                          accept=".csv"
                          onChange={csvReader}
                        />
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            {canAddRow() && (
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#405fe8] hover:bg-[#1f3fcc] cursor-pointer">
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Add Record</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Row</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {tableFields.map((field) => (
                      <div key={field.name} className="grid gap-2">
                        <Label htmlFor={field.name}>
                          {field.name}
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>
                        {field.description && (
                          <p className="text-sm text-muted-foreground">
                            {field.description}
                          </p>
                        )}
                        {hasWritePermission(field.name) ? (
                          renderInputField(field, newRow[field.name], (value) =>
                            handleInputChange(null, field.name, value)
                          )
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            You don't have permission to edit this field
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddRow}>Add Record</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-white text-card-foreground shadow-[0_8px_30px_rgb(0,0,0,0.18)] max-h-[calc(100vh-12rem)] overflow-auto">
          <div className="relative">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px] text-white">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-white">
                        {" "}
                        <b>Created At</b>
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-white"
                          onClick={() => handleSort("createdAt")}
                        >
                          {sortConfig.field === "createdAt" ? (
                            sortConfig.direction === "asc" ? (
                              <ArrowUpDown className="h-4 w-4 rotate-180" />
                            ) : sortConfig.direction === "desc" ? (
                              <ArrowUpDown className="h-4 w-4" />
                            ) : (
                              <ArrowUpDown className="h-4 w-4 opacity-50" />
                            )
                          ) : (
                            <ArrowUpDown className="h-4 w-4 opacity-50" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </TableHead>
                  {tableFields
                    ?.filter((field) => {
                      return hasShowPermission(field.name);
                    })
                    ?.map((field) => (
                      <TableHead key={field?.name} className="w-[200px] ">
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="truncate text-white">
                                  {" "}
                                  <b>{field.name}</b>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{field.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-white"
                              onClick={() => handleSort(field.name)}
                            >
                              {sortConfig.field === field.name ? (
                                sortConfig.direction === "asc" ? (
                                  <ArrowUpDown className="h-4 w-4 rotate-180" />
                                ) : sortConfig.direction === "desc" ? (
                                  <ArrowUpDown className="h-4 w-4" />
                                ) : (
                                  <ArrowUpDown className="h-4 w-4 opacity-50" />
                                )
                              ) : (
                                <ArrowUpDown className="h-4 w-4 opacity-50" />
                              )}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 hover:bg-transparent"
                                >
                                  <Search className="h-4 w-4 text-white" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="start"
                                className="w-[250px]"
                              >
                                <div className="p-2">
                                  {field.type === "DATE" ||
                                  field.type === "DATE-TIME" ? (
                                    <div className="space-y-1.5">
                                      <div className="space-y-1">
                                        <Label className="text-xs">
                                          Start Date
                                        </Label>
                                        <Input
                                          type={
                                            field.type === "DATE"
                                              ? "date"
                                              : "datetime-local"
                                          }
                                          value={
                                            dateRangeFilters[field.name]
                                              ?.start || ""
                                          }
                                          onChange={(e) =>
                                            handleDateRangeFilter(
                                              field.name,
                                              "start",
                                              e.target.value
                                            )
                                          }
                                          className="w-full h-8 text-xs"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs">
                                          End Date
                                        </Label>
                                        <Input
                                          type={
                                            field.type === "DATE"
                                              ? "date"
                                              : "datetime-local"
                                          }
                                          value={
                                            dateRangeFilters[field.name]?.end ||
                                            ""
                                          }
                                          onChange={(e) =>
                                            handleDateRangeFilter(
                                              field.name,
                                              "end",
                                              e.target.value
                                            )
                                          }
                                          className="w-full h-8 text-xs"
                                        />
                                      </div>
                                      <div className="flex justify-end pt-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            clearDateRangeFilter(field.name)
                                          }
                                          className="h-7 text-xs"
                                        >
                                          Clear Filter
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <Input
                                      placeholder={`Filter ${field.name}...`}
                                      value={filters[field.name] || ""}
                                      onChange={(e) =>
                                        handleFilter(field.name, e.target.value)
                                      }
                                      className="w-full"
                                    />
                                  )}
                                </div>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </TableHead>
                    ))}
                  {hasAnyWritePermission() && (
                    <TableHead className="w-[100px] text-white sticky right-0 bg-[#405fe8] z-10">
                      <b>Actions</b>
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {getSortedAndFilteredRows().map((row) => (
                  <TableRow key={row._id}>
                    <TableCell className="w-[200px]">
                      <div className="px-2 h-[24px] flex items-center">
                        <span className="truncate">
                          {formatTimestamp(row.createdAt)}
                        </span>
                      </div>
                    </TableCell>
                    {tableFields
                      ?.filter((field) => hasShowPermission(field.name))
                      .map((field) => (
                        <TableCell key={field.name} className="w-[200px]">
                          {editingRow === row._id &&
                          hasWritePermission(field.name) ? (
                            <div className="px-2">
                              {renderInputField(
                                field,
                                row.data[field.name],
                                (value) =>
                                  handleInputChange(row._id, field.name, value)
                              )}
                            </div>
                          ) : (
                            <div className="px-2 h-[24px] flex items-center">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="truncate">
                                      {formatValue(
                                        row.data[field.name],
                                        field.type
                                      )}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[300px] break-words">
                                    <p className="whitespace-pre-wrap">
                                      {formatValue(
                                        row.data[field.name],
                                        field.type
                                      )}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}
                        </TableCell>
                      ))}
                    {hasAnyWritePermission() && (
                      <TableCell className="sticky right-0 bg-white z-10">
                        <div className="flex items-center gap-2">
                          {editingRow === row._id ? (
                            <>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleSave(row._id)}
                                      className="cursor-pointer"
                                    >
                                      <Save className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Save changes</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={handleCancel}
                                      className="cursor-pointer"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Cancel</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </>
                          ) : (
                            <>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEdit(row._id)}
                                      className="cursor-pointer"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit record</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDelete(row._id)}
                                      className="cursor-pointer"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete record</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {/* Summary Row */}
                <TableRow className="bg-gray-50">
                  <TableCell className="w-[200px] font-semibold">
                    <div className="px-2 py-3 flex items-start">
                      <span>Summary</span>
                    </div>
                  </TableCell>
                  {tableFields
                    ?.filter((field) => hasShowPermission(field.name))
                    .map((field) => {
                      const values = getSortedAndFilteredRows()
                        .map((row) => row.data[field.name])
                        .filter(
                          (value) =>
                            value !== null &&
                            value !== undefined &&
                            value !== ""
                        );

                      if (field.type === "NUMBER") {
                        const numbers = values.map(Number);
                        const sum = numbers.reduce((a, b) => a + b, 0);
                        const avg = numbers.length ? sum / numbers.length : 0;
                        const max = numbers.length ? Math.max(...numbers) : 0;
                        const min = numbers.length ? Math.min(...numbers) : 0;
                        const count = numbers.length;

                        const stats = [
                          { label: "Count", value: count.toString() },
                          { label: "Sum", value: sum.toFixed(2) },
                          { label: "Average", value: avg.toFixed(2) },
                          { label: "Max", value: max.toFixed(2) },
                          { label: "Min", value: min.toFixed(2) },
                        ];

                        return (
                          <TableCell key={field.name} className="w-[200px]">
                            <div className="px-2 py-3">
                              <div className="flex flex-col gap-2">
                                <Select
                                  value={
                                    selectedStats[field.name]?.[0] || "count"
                                  }
                                  onValueChange={(value) => {
                                    setSelectedStats((prev) => ({
                                      ...prev,
                                      [field.name]: [value],
                                    }));
                                  }}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue>
                                      {selectedStats[field.name]?.[0] ===
                                        "sum" && `Sum: ${sum.toFixed(2)}`}
                                      {selectedStats[field.name]?.[0] ===
                                        "average" &&
                                        `Average: ${avg.toFixed(2)}`}
                                      {selectedStats[field.name]?.[0] ===
                                        "max" && `Max: ${max.toFixed(2)}`}
                                      {selectedStats[field.name]?.[0] ===
                                        "min" && `Min: ${min.toFixed(2)}`}
                                      {(!selectedStats[field.name]?.[0] ||
                                        selectedStats[field.name]?.[0] ===
                                          "count") &&
                                        `Count: ${count}`}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="count">
                                      Count: {count}
                                    </SelectItem>
                                    <SelectItem value="sum">
                                      Sum: {sum.toFixed(2)}
                                    </SelectItem>
                                    <SelectItem value="average">
                                      Average: {avg.toFixed(2)}
                                    </SelectItem>
                                    <SelectItem value="max">
                                      Max: {max.toFixed(2)}
                                    </SelectItem>
                                    <SelectItem value="min">
                                      Min: {min.toFixed(2)}
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </TableCell>
                        );
                      } else {
                        return (
                          <TableCell key={field.name} className="w-[200px]">
                            <div className="px-2 py-3 flex items-start">
                              <span className="text-xs">
                                Count: {values.length}
                              </span>
                            </div>
                          </TableCell>
                        );
                      }
                    })}
                  {hasAnyWritePermission() && (
                    <TableCell className="sticky right-0 bg-gray-50 z-10" />
                  )}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Separated Pagination */}
        <div className="rounded-lg border bg-white text-card-foreground shadow-[0_8px_30px_rgb(0,0,0,0.18)]">
          {renderPagination()}
        </div>
      </div>
    </div>
  );
}
