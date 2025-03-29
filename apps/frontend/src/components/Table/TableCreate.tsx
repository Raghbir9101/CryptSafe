import { useState } from 'react';
import { X } from 'lucide-react';
import { createTable } from '../Services/TableService';
import { FieldInterface } from '@repo/types';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../Utils/utils';
import { Box, Button, Modal, Typography } from '@mui/material';



const TablesCreate = () => {
  const nav = useNavigate();
  const { id } = useParams();
  const [newField, setNewField] = useState<FieldInterface>({
    name: '',
    type: 'TEXT',
    unique: false,
    required: false,
    hidden: false,
    options: []
  });

  const [fields, setFields] = useState<FieldInterface[]>([]);
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<string[]>([])
  const [currentSelectField, setCurrentSelectField] = useState('')
  const [description, setDescription] = useState('');
  // const fieldTypes = ['String', 'Number', 'Boolean', 'Date', 'Object'];
  const fieldTypes = ["TEXT", "NUMBER", "DATE", "BOOLEAN", "SELECT", "MULTISELECT"];
  const handleSubmit = async () => {
    try {
      const res = await createTable({ name: name, fields: fields?.map((field) => ({ ...field, type: field.type.toUpperCase() })), description: description })
      nav("/tables")
    } catch (error) {
      console.log(error, 'kaddu');

    }
  }
  const handleAddField = () => {
    if (newField.name && newField.type) {
      setFields([...fields, { ...newField }]);
      setNewField({
        name: '',
        type: 'TEXT',
        unique: false,
        required: false,
        hidden: false
      });
    }
  };

  const handleRemoveField = (indexToRemove: number) => {
    setFields(fields.filter((_, index) => index !== indexToRemove));
  };

  const handleFieldChange = (index: number, updates: Partial<FieldInterface>) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    setFields(updatedFields);
  };

  interface NewRowData {
    [key: string]: any;
  }

  const handleAddRow = async (newRowData: NewRowData) => {
    try {
      const response = await api.post(`/api/table/rows`, {
        tableID: id,
        data: newRowData
      })

      if (!response.ok) {
        throw new Error('Failed to add row');
      }

      const addedRow = await response.json();
      return addedRow;
    } catch (error) {
      console.error('Error adding row:', error);
      throw error;
    }
  };
  const handleOpenModal = () => {

  }
  return (
    <div className='bg-gradient-to-br from-gray-50 to-gray-100 p-8 w-full min-h-screen'>
      <div className="w-full md:w-[60%] mx-auto">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <h1 className="text-3xl font-bold text-white tracking-wide">Field Configuration</h1>
          </div>

          {/* Content Container */}
          <div className="p-8 space-y-8">
            {/* Table Name and Description Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative flex-1">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Table Name"
                  className="w-full px-4 py-3 border-2 border-transparent bg-gray-100 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-300 ease-in-out"
                />
                <span className="absolute left-4 -top-2 bg-white px-2 text-xs text-gray-500">Table Name</span>
              </div>

              <div className="relative flex-1">
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  className="w-full px-4 py-3 border-2 border-transparent bg-gray-100 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-300 ease-in-out"
                />
                <span className="absolute left-4 -top-2 bg-white px-2 text-xs text-gray-500">Description</span>
              </div>
            </div>

            {/* Add Fields Section */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Add New Field</h2>
              <div className="flex items-center space-x-4">
                {/* Field Name Input */}
                <input
                  placeholder="Field Name"
                  value={newField.name}
                  onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />

                {/* Field Type Select */}
                <select
                  value={newField.type}
                  // onChange={(e) => setNewField({ ...newField, type: e.target.value as FieldInterface['type'] })}
                  onChange={(e) => {
                    setCurrentSelectField(e.target.value);
                    setNewField({ ...newField, type: e.target.value as FieldInterface['type'] });
                  }}
                  className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Select Type</option>
                  {fieldTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {
                  currentSelectField === "SELECT" || currentSelectField === "MULTISELECT" && (
                    <Button onClick={() => setOpen(true)} variant='contained'>Add</Button>
                  )
                }
                <Modal
                  open={open}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                >
                  <Box sx={{ width: "50%", height: "50%", backgroundColor: "white" }}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                      Add Options <Button variant='contained'>Add</Button>
                    </Typography>
                    <div className="relative flex-1">
                      <input
                        // value={option}
                        // onChange={(e) => setOption(e.target.value)}
                        placeholder="Option"
                        className="w-full px-4 py-3 border-2 border-transparent bg-gray-100 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-300 ease-in-out"
                      />
                      <span className="absolute left-4 -top-2 bg-white px-2 text-xs text-gray-500">Options</span>
                    </div>
                  </Box>
                </Modal>
                {/* Checkboxes */}
                <div className="flex items-center space-x-3">
                  {[
                    { label: 'Unique', key: 'unique', color: 'blue' },
                    { label: 'Required', key: 'required', color: 'green' },
                    { label: 'Hidden', key: 'hidden', color: 'red' }
                  ].map(({ label, key, color }) => (
                    <label key={key} className="flex items-center space-x-2 cursor-pointer border-1 border-gray-300 rounded-md px-2 py-1">
                      <input
                        type="checkbox"
                        checked={newField[key as keyof FieldInterface] as boolean || false}
                        onChange={(e) => setNewField({
                          ...newField,
                          [key]: e.target.checked
                        })}
                        className={`form-checkbox h-5 w-5 rounded-md text-${color}-600 focus:ring-${color}-500`}
                      />
                      <span className="text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>

                {/* Add Field Button */}
                <button
                  onClick={handleAddField}
                  className="cursor-pointer px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Add Field
                </button>
              </div>
            </div>

            {/* Fields List Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Fields List</h2>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Field Name Input */}
                      <input
                        value={field.name}
                        onChange={(e) => handleFieldChange(index, { name: e.target.value })}
                        placeholder="Field Name"
                        className="flex-1 px-3 py-2 border rounded-md"
                      />

                      {/* Field Type Select */}
                      <select
                        value={field.type}
                        onChange={(e) => handleFieldChange(index, { type: e.target.value as FieldInterface['type'] })}
                        className="px-3 py-2 border rounded-md"
                      >
                        <option value="">Select Type</option>
                        {fieldTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>

                      {/* Checkboxes */}
                      <div className="flex items-center space-x-3">
                        {[
                          { label: 'Unique', key: 'unique', color: 'blue' },
                          { label: 'Required', key: 'required', color: 'green' },
                          { label: 'Hidden', key: 'hidden', color: 'red' }
                        ].map(({ label, key, color }) => (
                          <label key={key} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field[key as keyof FieldInterface] as boolean || false}
                              onChange={(e) => handleFieldChange(index, {
                                [key]: e.target.checked
                              })}
                              className={`form-checkbox h-4 w-4 rounded-md text-${color}-600 focus:ring-${color}-500`}
                            />
                            <span className="text-gray-700 text-sm">{label}</span>
                          </label>
                        ))}
                      </div>

                      {/* Remove Field Button */}
                      <button
                        onClick={() => handleRemoveField(index)}
                        className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleSubmit} className='cursor-pointer px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg'>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablesCreate;