
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../Utils/utils';
import { Plus, Save, X, Pencil, Trash2, ArrowUpDown, Search, ShareIcon } from 'lucide-react';
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
}

type SortDirection = 'asc' | 'desc' | null;
type SortConfig = {
  field: string;
  direction: SortDirection;
};

export default function TableContent() {
  const [tableFields, setTableFields] = useState<TableField[]>([]);
  const [rows, setRows] = useState<TableRow[]>([]);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [newRow, setNewRow] = useState<Record<string, any>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: '', direction: null });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const { id } = useParams();

  useEffect(() => {
    fetchTableData();
  }, [id]);

  const fetchTableData = async () => {
    try {
      const [tableRes, rowsRes] = await Promise.all([
        api.get(`/tables/${id}`),
        api.get(`/tables/rows/${id}`)
      ]);

      setTableFields(tableRes.data.fields);
      setRows(rowsRes.data);

      // Initialize newRow with empty values for each field
      const emptyRow = tableRes.data.fields.reduce((acc: Record<string, any>, field: TableField) => {
        acc[field.name] = '';
        return acc;
      }, {});
      setNewRow(emptyRow);
    } catch (error) {
      console.error('Error fetching table data:', error);
      toast.error('Failed to load table data');
    }
  };

  const handleEdit = (rowId: string) => {
    setEditingRow(rowId);
  };

  const handleSave = async (rowId: string) => {
    try {
      const row = rows.find(r => r._id === rowId);
      if (!row) return;

      // Check for unique constraints
      const uniqueFields = tableFields.filter(field => field.unique);
      for (const field of uniqueFields) {
        const value = row.data[field.name];
        if (value) {
          const existingRow = rows.find(r =>
            r._id !== rowId && r.data[field.name] === value
          );
          if (existingRow) {
            toast.error(`${field.name} must be unique. Value "${value}" already exists.`);
            return;
          }
        }
      }

      // Process the data to handle date conversions
      const processedData = { ...row.data };
      tableFields.forEach((field) => {
        if (field.type === "DATE" && processedData[field.name]) {
          processedData[field.name] = new Date(processedData[field.name]).toISOString();
        }
      });

      await api.patch(`/tables/update/${id}/${rowId}`, processedData);
      setEditingRow(null);
      toast.success('Row updated successfully');
      fetchTableData(); // Refresh data to ensure consistency
    } catch (error: any) {
      console.error('Error saving row:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to save changes');
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
      setRows(rows.filter(row => row._id !== rowId));
      toast.success('Row deleted successfully');
    } catch (error) {
      console.error('Error deleting row:', error);
      toast.error('Failed to delete row');
    }
  };

  const handleAddRow = async () => {
    try {
      // Validate required fields
      const missingFields = tableFields
        .filter(field => field.required)
        .filter(field => !newRow[field.name]);

      if (missingFields.length > 0) {
        toast.error(`Please fill in required fields: ${missingFields.map(f => f.name).join(', ')}`);
        return;
      }

      // Check for unique constraints
      const uniqueFields = tableFields.filter(field => field.unique);
      for (const field of uniqueFields) {
        const value = newRow[field.name];
        if (value) {
          const existingRow = rows.find(row => row.data[field.name] === value);
          if (existingRow) {
            toast.error(`${field.name} must be unique. Value "${value}" already exists.`);
            return;
          }
        }
      }

      // Process the data to handle date conversions
      const processedData = { ...newRow };
      tableFields.forEach((field) => {
        if (field.type === "DATE" && processedData[field.name]) {
          processedData[field.name] = new Date(processedData[field.name]).toISOString();
        }
      });

      const response = await api.post(`/tables/insert/${id}`, processedData);
      setRows([...rows, response.data.row]);

      // Reset new row form
      setNewRow(tableFields.reduce((acc: Record<string, any>, field) => {
        acc[field.name] = '';
        return acc;
      }, {}));

      setIsAddModalOpen(false);
      toast.success('Row added successfully');
    } catch (error: any) {
      console.error('Error adding row:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to add row');
      }
    }
  };

  const handleInputChange = (rowId: string | null, fieldName: string, value: any) => {
    if (rowId) {
      setRows(rows.map(row =>
        row._id === rowId
          ? { ...row, data: { ...row.data, [fieldName]: value } }
          : row
      ));
    } else {
      setNewRow({ ...newRow, [fieldName]: value });
    }
  };

  const formatValue = (value: any, type: string) => {
    if (type === 'BOOLEAN') {
      return value === true ? 'Yes' : 'No';
    }
    if (!value) return '';
    if (type === 'DATE') {
      return new Date(value).toLocaleString();
    }
    return value;
  };

  const renderInputField = (field: TableField, value: any, onChange: (value: any) => void) => {
    switch (field.type) {
      case 'TEXT':
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.name}`}
            className="w-full"
          />
        );
      case 'NUMBER':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.name}`}
            className="w-full"
          />
        );
      case 'DATE':
        return (
          <Input
            type="datetime-local"
            value={value ? new Date(value).toISOString().slice(0, 16) : ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full"
          />
        );
      case 'BOOLEAN':
        return (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={value || false}
              onCheckedChange={(checked) => onChange(checked)}
            />
          </div>
        );
      case 'TEXTAREA':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.name}`}
            className="w-full"
          />
        );
      case 'SELECT':
        return (
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full">
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
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.name}`}
            className="w-full"
          />
        );
    }
  };

  const handleSort = (field: string) => {
    setSortConfig((prevConfig) => {
      if (prevConfig.field === field) {
        if (prevConfig.direction === 'asc') return { field, direction: 'desc' };
        if (prevConfig.direction === 'desc') return { field, direction: null };
        return { field, direction: 'asc' };
      }
      return { field, direction: 'asc' };
    });
  };

  const handleFilter = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const getSortedAndFilteredRows = () => {
    let filteredRows = [...rows];

    // Apply filters
    Object.entries(filters).forEach(([field, value]) => {
      if (value) {
        filteredRows = filteredRows.filter(row => {
          const cellValue = row.data[field];
          if (cellValue === null || cellValue === undefined) return false;
          return cellValue.toString().toLowerCase().includes(value.toLowerCase());
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

        const fieldType = tableFields.find(f => f.name === sortConfig.field)?.type;

        if (fieldType === 'NUMBER') {
          return sortConfig.direction === 'asc'
            ? Number(aValue) - Number(bValue)
            : Number(bValue) - Number(aValue);
        }

        if (fieldType === 'DATE') {
          return sortConfig.direction === 'asc'
            ? new Date(aValue).getTime() - new Date(bValue).getTime()
            : new Date(bValue).getTime() - new Date(aValue).getTime();
        }

        return sortConfig.direction === 'asc'
          ? aValue.toString().localeCompare(bValue.toString())
          : bValue.toString().localeCompare(aValue.toString());
      });
    }

    return filteredRows;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Table Content</h2>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Row
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Row</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {tableFields.map((field) => (
                <div key={field.name} className="grid gap-2">
                  <Label htmlFor={field.name}>
                    {field.name}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {field.description && (
                    <p className="text-sm text-muted-foreground">{field.description}</p>
                  )}
                  {renderInputField(field, newRow[field.name], (value) =>
                    handleInputChange(null, field.name, value)
                  )}
                </div>
              ))}
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRow}>
                  Add Row
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {tableFields.map((field) => (
                <TableHead key={field.name} className="max-w-[250px]">
                  <div className="flex items-center gap-2">
                    <span>{field.name}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleSort(field.name)}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                        {sortConfig.field === field.name && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Search className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[200px]">
                          <div className="p-2">
                            <Input
                              placeholder={`Filter ${field.name}...`}
                              value={filters[field.name] || ''}
                              onChange={(e) => handleFilter(field.name, e.target.value)}
                              className="w-full"
                            />
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getSortedAndFilteredRows().map((row) => (
              <TableRow key={row._id}>
                {tableFields.map((field) => (
                  <TableCell key={field.name} className="max-w-[250px]">
                    {editingRow === row._id ? (
                      renderInputField(
                        field,
                        row.data[field.name],
                        (value) => handleInputChange(row._id, field.name, value)
                      )
                    ) : (
                      <div className="py-2">
                        {formatValue(row.data[field.name], field.type)}
                      </div>
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  <div className="flex items-center gap-2">
                    {editingRow === row._id ? (
                      <>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSave(row._id)}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCancel}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(row._id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(row._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}