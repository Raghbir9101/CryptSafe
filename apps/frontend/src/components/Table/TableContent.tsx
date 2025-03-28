import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
  GridSlotProps,
} from '@mui/x-data-grid';
import {
  randomCreatedDate,
  randomTraderName,
  randomId,
  randomArrayItem,
} from '@mui/x-data-grid-generator';
import { getTables } from '../Services/TableService';
import { useState } from 'react';
import { api } from '../../Utils/utils';
import { useParams } from 'react-router-dom';

const roles = ['Market', 'Finance', 'Development'];
const randomRole = () => {
  return randomArrayItem(roles);
};


declare module '@mui/x-data-grid' {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
    ) => void;
    tableFields: any[];
  }
}

function EditToolbar(props: GridSlotProps['toolbar']) {
  const { setRows, setRowModesModel, tableFields } = props;

  const handleClick = () => {
    const id = randomId();
    // Create an empty row with all fields from the table
    const emptyRow = {
      id,
      isNew: true,
      data: tableFields.reduce((acc: any, field: any) => {
        acc[field.name] = '';
        return acc;
      }, {})
    };
    
    setRows((oldRows) => [...oldRows, emptyRow]);
    // Immediately set the row in edit mode
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit },
    }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Add record
      </Button>
    </GridToolbarContainer>
  );
}

export default function FullFeaturedCrudGrid() {
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
  const [tables, setTables] = useState<{ fields: any[] } | null>(null);
  const [fetchedRows, setFetchedRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const {id} = useParams();

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      // Don't prevent default here to allow saving on focus out
      // event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    const row = rows.find((r) => r.id === id);
    if (row) {
      console.log('Editing row:', row);
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    }
  };

  const handleSaveClick = (id: GridRowId) => () => {
    console.log('Saving row:', id);
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = async (newRow: GridRowModel) => {
    try {
      // Extract the actual data from the flat structure and handle date conversions
      const rowData = tables?.fields.reduce((acc: any, field: any) => {
        const value = newRow[`data.${field.name}`];
        // For DATE type, ensure we send a valid date string to the API
        if (field.type === "DATE" && value) {
          acc[field.name] = new Date(value).toISOString();
        } else {
          acc[field.name] = value;
        }
        return acc;
      }, {});

      if (newRow.isNew) {
        console.log('New row being added:', { data: rowData });
        const response = await api.post(`/tables/insert/${id}`, rowData);
        
        // Process the response data and handle dates
        const processedData = { ...response.data.row.data };
        tables?.fields.forEach((field: any) => {
          if (field.type === "DATE" && processedData[field.name]) {
            processedData[field.name] = new Date(processedData[field.name]);
          }
        });

        const savedRow = {
          id: response.data.row._id,
          isNew: false,
          data: processedData,
          ...Object.entries(processedData).reduce((acc: any, [key, value]) => {
            acc[`data.${key}`] = value;
            return acc;
          }, {})
        };

        setRows((prevRows) => prevRows.map(row => 
          row.id === newRow.id ? savedRow : row
        ));
        return savedRow;
      } else {
        // For existing rows being edited
        console.log('Existing row being updated:', { id: newRow.id, data: rowData });
        const response = await api.patch(`/tables/update/${id}/${newRow.id}`, rowData);

        const processedData = { ...rowData };
        tables?.fields.forEach((field: any) => {
          if (field.type === "DATE" && processedData[field.name]) {
            processedData[field.name] = new Date(processedData[field.name]);
          }
        });

        const editedRow = {
          ...newRow,
          isNew: false,
          data: processedData,
          ...Object.entries(processedData).reduce((acc: any, [key, value]) => {
            acc[`data.${key}`] = value;
            return acc;
          }, {})
        };

        setRows((prevRows) => prevRows.map(row => 
          row.id === newRow.id ? editedRow : row
        ));
        return editedRow;
      }
    } catch (error) {
      console.error('Error updating row:', error);
      throw error;
    }
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };


  //function which takes in tables data and returns columns
  function getColumns(tables: any) {
    const baseColumns = tables.fields.map((field: any) => ({
      field: `data.${field.name}`,
      headerName: field.name,
      width: 180,
      editable: true,
      type: field.type == "TEXT" ? "string" : field.type == "NUMBER" ? "number" : field.type == "DATE" ? "date" : field.type == "BOOLEAN" ? "boolean" : "string",
    }));

    const actionColumn = {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }: { id: GridRowId }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{ color: 'primary.main' }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    };

    return [...baseColumns, actionColumn];
  }

  function getTable(){
    api.get(`/tables/${id}`).then((res) => {
      console.log('Table data:', res.data);
      setTables(res.data);
      setColumns(getColumns(res.data));
    });
    api.get(`/tables/rows/${id}`).then((res) => {
      console.log('Fetched rows:', res.data);
      // Map the fetched rows to include id field and nested data structure
      const rowsWithIds = res.data.map((row: any) => ({
        id: row._id,
        isNew: false,
        data: row.data || {} // Ensure data is nested
      }));
      setFetchedRows(rowsWithIds);
      setRows(rowsWithIds);
    });
  }
  React.useEffect(() => {
    getTable();
  }, []);

  return (
    <Box
      sx={{
        height: 500,
        width: '100%',
        '& .actions': {
          color: 'text.secondary',
        },
        '& .textPrimary': {
          color: 'text.primary',
        },
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{ toolbar: EditToolbar }}
        slotProps={{
          toolbar: { setRows, setRowModesModel, tableFields: tables?.fields || [] },
        }}
      />
    </Box>
  );
}
