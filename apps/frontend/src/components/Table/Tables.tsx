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

  const hasTablePermission = (table: any, permission: 'edit' | 'delete') => {
    // Check if user is the creator
    if (Auth.value.loggedInUser?._id === table.createdBy) {
      return true;
    }

    // Check shared permissions
    const sharedUser = table.sharedWith?.find(
      (user: any) => user.email === Auth.value.loggedInUser?.email
    );
    return sharedUser?.tablePermissions?.[permission] || false;
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
                    className={`${!hasTablePermission(table, 'edit') 
                      ? "cursor-not-allowed text-gray-400 hover:bg-transparent hover:text-gray-400" 
                      : "cursor-pointer"}`}
                    onClick={() => hasTablePermission(table, 'edit') && nav(`/tables/share/${table._id}`)}
                  >
                    <ShareIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    className={`${!hasTablePermission(table, 'delete') 
                      ? "cursor-not-allowed text-gray-400 hover:bg-transparent hover:text-gray-400" 
                      : "cursor-pointer"}`}
                    variant="ghost"
                    size="icon"
                    onClick={() => hasTablePermission(table, 'delete') && handleDelete(table._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    className={`${!hasTablePermission(table, 'edit') 
                      ? "cursor-not-allowed text-gray-400 hover:bg-transparent hover:text-gray-400" 
                      : "cursor-pointer"}`}
                    variant="ghost"
                    size="icon"
                    onClick={() => hasTablePermission(table, 'edit') && nav(`/tables/update/${table._id}`)}
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
              <TableCell className={table?.updatedBy?.name ? '' : 'text-center'}>
                {table?.updatedBy?.name || "-"}
              </TableCell>
            </TableRow>
          })}
        </TableBody>
      </TableComponent>
    </div>
  );
}