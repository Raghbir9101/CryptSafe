import { useEffect } from 'react';
import { getTables, SelectedTable } from '../Services/TableService';
import { Table } from "../Services/TableService"
import { ExternalLink, Pencil, ShareIcon, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../Utils/utils';
import { Button } from "@/components/ui/button"
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Auth } from '../Services/AuthService';

export default function Tables() {
  const nav = useNavigate();
  const handleDelete = async (id: any) => {
    try {
      await api.delete(`/tables/${id}`)
      await getTables();
    } catch (error) {
      console.log("error")
    }
  }
  useEffect(() => {
    getTables()
  }, [])

  return (
    <div className="rounded-md border">
      <TableComponent>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Actions</TableHead>
            <TableHead className="w-[100px]">Data</TableHead>
            <TableHead>Table Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Last Edit</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Last Edit By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Table.value.data?.map((table) => {
            return <TableRow key={table._id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className='cursor-pointer'
                  onClick={() => nav(`/tables/share/${table._id}`)}
                  disabled={Auth.value.loggedInUser?._id !== table.createdBy}
                >
                  <ShareIcon className="h-4 w-4 " />
                </Button>
                <Button
                  className="cursor-pointer"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(table._id)}
                  disabled={Auth.value.loggedInUser?._id !== table.createdBy}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  className="cursor-pointer"
                  variant="ghost"
                  size="icon"
                  onClick={() => nav(`/tables/update/${table._id}`)}
                  disabled={Auth.value.loggedInUser?._id !== table.createdBy}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
            <TableCell>
              <Button
                className="cursor-pointer"
                variant="ghost"
                size="icon"
                onClick={() => {
                  SelectedTable.value = table
                  nav(`/tables/${table._id}`)
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </TableCell>
            <TableCell>{table.name}</TableCell>
            <TableCell>{table.description}</TableCell>
            <TableCell>
              {new Date(table.updatedAt).toLocaleString()}
            </TableCell>
            <TableCell>
              {new Date(table.createdAt).toLocaleString()}
            </TableCell>
            <TableCell className='text-center'>
              {table.updatedBy || "-"}
            </TableCell>
          </TableRow>
          })}
        </TableBody>
      </TableComponent>
    </div>
  );
}