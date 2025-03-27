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

const initialRows: GridRowsProp = [
  {
    id: randomId(),
    name: randomTraderName(),
    age: 25,
    joinDate: randomCreatedDate(),
    role: randomRole(),
  },
  {
    id: randomId(),
    name: randomTraderName(),
    age: 36,
    joinDate: randomCreatedDate(),
    role: randomRole(),
  },
  {
    id: randomId(),
    name: randomTraderName(),
    age: 19,
    joinDate: randomCreatedDate(),
    role: randomRole(),
  },
  {
    id: randomId(),
    name: randomTraderName(),
    age: 28,
    joinDate: randomCreatedDate(),
    role: randomRole(),
  },
  {
    id: randomId(),
    name: randomTraderName(),
    age: 23,
    joinDate: randomCreatedDate(),
    role: randomRole(),
  },
];

declare module '@mui/x-data-grid' {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
    ) => void;
  }
}

function EditToolbar(props: GridSlotProps['toolbar']) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = randomId();
    setRows((oldRows) => [
      ...oldRows,
      { id, name: '', age: '', role: '', isNew: true },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
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
  const [rows, setRows] = React.useState(initialRows);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
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

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  //sample data of columns fetched from tables/${id}
//   {
//     "_id": "67e57f300e8864ea7a4ba6ce",
//     "name": "testing",
//     "description": "testing table",
//     "fields": [
//         {
//             "name": "id",
//             "unique": true,
//             "type": "TEXT",
//             "required": true,
//             "hidden": false,
//             "options": [],
//             "_id": "67e57f300e8864ea7a4ba6cf"
//         },
//         {
//             "name": "name",
//             "unique": false,
//             "type": "TEXT",
//             "required": true,
//             "hidden": false,
//             "options": [],
//             "_id": "67e57f300e8864ea7a4ba6d0"
//         },
//         {
//             "name": "dob",
//             "unique": false,
//             "type": "DATE",
//             "required": true,
//             "hidden": false,
//             "options": [],
//             "_id": "67e57f300e8864ea7a4ba6d1"
//         },
//         {
//             "name": "isAdmin",
//             "unique": false,
//             "type": "BOOLEAN",
//             "required": true,
//             "hidden": false,
//             "options": [],
//             "_id": "67e57f300e8864ea7a4ba6d2"
//         },
//         {
//             "name": "mobile",
//             "unique": true,
//             "type": "NUMBER",
//             "required": true,
//             "hidden": false,
//             "options": [],
//             "_id": "67e57f550e8864ea7a4ba6e5"
//         }
//     ],
//     "createdBy": "67e40c9daa260d48edfb0a86",
//     "sharedWith": [],
//     "createdAt": "2025-03-27T16:39:12.029Z",
//     "updatedAt": "2025-03-27T16:39:49.864Z",
//     "__v": 0
// }

  //function which takes in tables data and returns columns
  function getColumns(tables: any) {
    return tables.fields.map((field: any) => ({
      field: field.name,
      headerName: field.name,
      width: 180,
      editable: true,
      type: field.type == "TEXT" ? "string" : field.type == "NUMBER" ? "number" : field.type == "DATE" ? "date" : field.type == "BOOLEAN" ? "boolean" : "string",
    }));
  }

  const [tables, setTables] = useState([]);
  const [fetchedRows, setFetchedRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const {id} = useParams()
  function getTable(){

    api.get(`/tables/${id}`).then((res) => {
      console.log(res.data)
      setTables(res.data);
      setColumns(getColumns(res.data));
    });
    api.get(`/tables/rows/${id}`).then((res) => {
      console.log(res.data)
      setFetchedRows(res.data);
    });
  }
  React.useEffect(() => {
    getTable();
  }, []);

  // const columns: GridColDef[] = [
  //   { field: 'name', headerName: 'Name', width: 180, editable: true },
  //   {
  //     field: 'age',
  //     headerName: 'Age',
  //     type: 'number',
  //     width: 80,
  //     align: 'left',
  //     headerAlign: 'left',
  //     editable: true,
  //   },
  //   {
  //     field: 'joinDate',
  //     headerName: 'Join date',
  //     type: 'date',
  //     width: 180,
  //     editable: true,
  //   },
  //   {
  //     field: 'role',
  //     headerName: 'Department',
  //     width: 220,
  //     editable: true,
  //     type: 'singleSelect',
  //     valueOptions: ['Market', 'Finance', 'Development'],
  //   },
  //   {
  //     field: 'actions',
  //     type: 'actions',
  //     headerName: 'Actions',
  //     width: 100,
  //     cellClassName: 'actions',
  //     getActions: ({ id }) => {
  //       const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

  //       if (isInEditMode) {
  //         return [
  //           <GridActionsCellItem
  //             icon={<SaveIcon />}
  //             label="Save"
  //             sx={{
  //               color: 'primary.main',
  //             }}
  //             onClick={handleSaveClick(id)}
  //           />,
  //           <GridActionsCellItem
  //             icon={<CancelIcon />}
  //             label="Cancel"
  //             className="textPrimary"
  //             onClick={handleCancelClick(id)}
  //             color="inherit"
  //           />,
  //         ];
  //       }

  //       return [
  //         <GridActionsCellItem
  //           icon={<EditIcon />}
  //           label="Edit"
  //           className="textPrimary"
  //           onClick={handleEditClick(id)}
  //           color="inherit"
  //         />,
  //         <GridActionsCellItem
  //           icon={<DeleteIcon />}
  //           label="Delete"
  //           onClick={handleDeleteClick(id)}
  //           color="inherit"
  //         />,
  //       ];
  //     },
  //   },
  // ];

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
          toolbar: { setRows, setRowModesModel },
        }}
      />
    </Box>
  );
}
