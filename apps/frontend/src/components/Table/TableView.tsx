import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  TextField, 
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Edit, Delete, Add, Save, Cancel } from '@mui/icons-material';
import { FieldInterface } from '@repo/types';

interface TableRecord {
  id: string;
  [key: string]: any;
}

interface TableViewProps {
  fields: FieldInterface[];
  initialData?: TableRecord[];
}

const TableView: React.FC<TableViewProps> = ({ fields, initialData = [] }) => {
  const [records, setRecords] = useState<TableRecord[]>(initialData);
  const [editingRecord, setEditingRecord] = useState<TableRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<TableRecord>>({});

  // Function to render input based on field type
  const renderInput = (field: FieldInterface, value: any, onChange: (value: any) => void) => {
    switch (field.type) {
      case 'TEXT':
        return (
          <TextField
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            size="small"
            fullWidth
          />
        );
      case 'NUMBER':
        return (
          <TextField
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            size="small"
            fullWidth
          />
        );
      case 'DATE':
        return (
          <TextField
            type="date"
            value={value ? new Date(value).toISOString().split('T')[0] : ''}
            onChange={(e) => onChange(e.target.value)}
            size="small"
            fullWidth
          />
        );
      case 'DATE-TIME':
        return (
          <TextField
            type="datetime-local"
            value={value ? new Date(value).toLocaleString('sv', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', 'T') : ''}
            onChange={(e) => {
              const dateTimeValue = e.target.value;
              if (dateTimeValue) {
                const date = new Date(dateTimeValue);
                onChange(date.toISOString());
              } else {
                onChange('');
              }
            }}
            size="small"
            fullWidth
          />
        );
      case 'BOOLEAN':
        return (
          <TextField
            select
            value={value || false}
            onChange={(e) => onChange(e.target.value === 'true')}
            size="small"
            fullWidth
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </TextField>
        );
      // Add cases for SELECT and MULTISELECT if needed
      default:
        return <TextField value={value || ''} onChange={(e) => onChange(e.target.value)} size="small" fullWidth />;
    }
  };

  const handleAdd = async () => {
    try {
      // API call to add record
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      });
      const savedRecord = await response.json();
      setRecords([...records, savedRecord]);
      setIsDialogOpen(false);
      setNewRecord({});
    } catch (error) {
      console.error('Error adding record:', error);
    }
  };

  const handleEdit = async (record: TableRecord) => {
    try {
      // API call to update record
      const response = await fetch(`/api/records/${record.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      const updatedRecord = await response.json();
      setRecords(records.map(r => r.id === updatedRecord.id ? updatedRecord : r));
      setEditingRecord(null);
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // API call to delete record
      await fetch(`/api/records/${id}`, {
        method: 'DELETE',
      });
      setRecords(records.filter(record => record.id !== id));
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  return (
    <div>
      <Button
        startIcon={<Add />}
        variant="contained"
        onClick={() => setIsDialogOpen(true)}
        sx={{ mb: 2 }}
      >
        Add Record
      </Button>

      <Table>
        <TableHead>
          <TableRow>
            {fields.map(field => (
              <TableCell key={field.name}>{field.name}</TableCell>
            ))}
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map(record => (
            <TableRow key={record.id}>
              {fields.map(field => (
                <TableCell key={field.name}>
                  {editingRecord?.id === record.id ? (
                    renderInput(
                      field,
                      editingRecord[field.name],
                      (value) => setEditingRecord({
                        ...editingRecord,
                        [field.name]: value
                      })
                    )
                  ) : (
                    record[field.name]
                  )}
                </TableCell>
              ))}
              <TableCell>
                {editingRecord?.id === record.id ? (
                  <>
                    <IconButton onClick={() => handleEdit(editingRecord)}>
                      <Save />
                    </IconButton>
                    <IconButton onClick={() => setEditingRecord(null)}>
                      <Cancel />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IconButton onClick={() => setEditingRecord(record)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(record.id)}>
                      <Delete />
                    </IconButton>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add Record Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} >
        <DialogTitle>Add New Record</DialogTitle>
        <DialogContent className='max-h-[95vh] overflow-y-auto'>
          {fields.map(field => (
            <div key={field.name} style={{ marginTop: 16 }}>
              {renderInput(
                field,
                newRecord[field.name],
                (value) => setNewRecord({
                  ...newRecord,
                  [field.name]: value
                })
              )}
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TableView; 