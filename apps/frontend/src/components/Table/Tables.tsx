import Box from '@mui/material/Box';

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useEffect } from 'react';
import { getTables } from '../Services/TableService';
import { Table } from "../Services/TableService"
import { IconButton } from '@mui/material';
import { Delete, DeleteIcon, Edit2, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';




export default function Tables() {
  const nav = useNavigate();

  const columns: GridColDef<(typeof Table.value.data)[number]>[] = [
    {
      field: 'edit/delete',
      headerName: 'Edit/Delete',
      width: 150,
      renderCell(params) {
        return <Box display={"flex"} gap={"10px"} height={"100%"} alignItems={"center"}>
          <IconButton>
            <Trash2 />
          </IconButton>
          <IconButton onClick={() => nav(`/tables/update/${params.row._id}`)}>
            <Pencil />
          </IconButton>
        </Box>
      },
    },
    {
      field: 'data',
      headerName: 'Data',
      width: 150,
      renderCell(params) {
        return <Box display={"flex"} gap={"10px"} height={"100%"} alignItems={"center"}>
          <IconButton onClick={() => nav(`/tables/${params.row._id}`)}>
            <ExternalLink />
          </IconButton>
        </Box>
      },
    },
    {
      field: 'name',
      headerName: 'Table Name',
      width: 150,
      editable: true,
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 150,
      editable: true,
    },
    {
      field: 'updatedBy',
      headerName: 'Last Edit',
      width: 110,
      editable: true,
      renderCell(params) {
        const date = new Date(params.row.updatedBy)
        return `${date.toDateString()} ${date.toLocaleTimeString()}`
      },
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 160,
      renderCell(params) {
        const date = new Date(params.row.createdAt)
        return `${date.toDateString()} ${date.toLocaleTimeString()}`
      },
    },
    {
      field: 'updatedAt',
      headerName: 'Last Edit By',
      width: 160,
      renderCell(params) {
        const date = new Date(params.row.updatedAt)
        return `${date.toDateString()} ${date.toLocaleTimeString()}`
      },
    },
  ];

  useEffect(() => {
    getTables()
  }, [])

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        getRowId={(row) => row._id}
        rows={Table.value.data || []}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        pageSizeOptions={[5]}
        checkboxSelection={false}
        disableRowSelectionOnClick
      />
    </Box>
  );
}