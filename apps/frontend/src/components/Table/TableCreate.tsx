import { Box, Card, Input, MenuItem, Select, Button, Typography, FormControlLabel, Checkbox, TextField } from '@mui/material'
import React, { useState } from 'react'
import { FieldInterface } from '@repo/types'

function TableCreate() {
  const sheetTabNames = ["Sheet1", "Sheet2", "Sheet3"]
  const [fields, setFields] = useState<FieldInterface[]>([])
  const [newField, setNewField] = useState<Partial<FieldInterface>>({
    name: '',
    type: 'TEXT',
    unique: false,
    required: false,
    hidden: false,
    options: []
  })

  const fieldTypes = ["TEXT", "NUMBER", "DATE", "BOOLEAN", "SELECT", "MULTISELECT"]

  const handleAddField = () => {
    if (newField.name) {
      setFields([...fields, newField as FieldInterface])
      setNewField({
        name: '',
        type: 'TEXT',
        unique: false,
        required: false,
        hidden: false,
        options: []
      })
    }
  }

  return (
    <div>
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 2,
      }}>
        <Box sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}>
          <Input placeholder='Table Name' />
          <Input placeholder='URL' />
          <Select>
            {sheetTabNames.map((name) => (
              <MenuItem key={name} value={name}>{name}</MenuItem>
            ))}
          </Select>
        </Box>

        <Typography variant="h6">Add Fields</Typography>
        <Box sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          p: 2,
          border: '1px solid #ccc',
          borderRadius: 1,
        }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              label="Field Name"
              value={newField.name}
              onChange={(e) => setNewField({ ...newField, name: e.target.value })}
            />
            <Select
              value={newField.type}
              onChange={(e) => setNewField({ ...newField, type: e.target.value as FieldInterface['type'] })}
              sx={{ minWidth: 120 }}
            >
              {fieldTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
            <FormControlLabel
              control={
                <Checkbox
                  checked={newField.unique}
                  onChange={(e) => setNewField({ ...newField, unique: e.target.checked })}
                />
              }
              label="Unique"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={newField.required}
                  onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                />
              }
              label="Required"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={newField.hidden}
                  onChange={(e) => setNewField({ ...newField, hidden: e.target.checked })}
                />
              }
              label="Hidden"
            />
            <Button variant="contained" onClick={handleAddField}>Add Field</Button>
          </Box>
        </Box>

        <Typography variant="h6">Fields List</Typography>
        <Box sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}>
          {fields.map((field, index) => (
            <Card key={index} sx={{ p: 2 }}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Typography>{field.name}</Typography>
                <Typography>({field.type})</Typography>
                {field.unique && <Typography>Unique</Typography>}
                {field.required && <Typography>Required</Typography>}
                {field.hidden && <Typography>Hidden</Typography>}
              </Box>
            </Card>
          ))}
        </Box>
      </Box>
    </div>
  )
}

export default TableCreate