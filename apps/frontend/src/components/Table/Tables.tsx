import { useEffect, useState } from 'react';
import { getTables, SelectedTable } from '../Services/TableService';
import { Table } from "../Services/TableService"
import { ExternalLink, Pencil, ShareIcon, Trash2, Plus, MoreVertical } from 'lucide-react';
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
import { Auth, getUserAfterRefresh } from '../Services/AuthService';
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function Tables() {
  const [isAdmin, setIsAdmin] = useState(false)
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
    if (Auth.value.loggedInUser?._id === table.createdBy) {
      return true;
    }
    const sharedUser = table.sharedWith?.find(
      (user: any) => user.email === Auth.value.loggedInUser?.email
    );
    return sharedUser?.tablePermissions?.[permission] || false;
  }

  useEffect(() => {
    getTables()
  }, [])
  useEffect(() => {
    getUserAfterRefresh()
  }, []);
  return (
    <div className="container mx-auto px-6 py-20">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Manage Tables</h1>
      </div>

      <div className="rounded-lg border bg-white text-card-foreground shadow-[0_8px_30px_rgb(0,0,0,0.18)] max-h-[calc(100vh-12rem)] overflow-auto">
        <TableComponent>
          <TableHeader>
            <TableRow className="bg-[#4161ed] border-b-2 border-[#4161ed]">
              <TableHead className="w-[80px] text-white"><b>Data</b></TableHead>
              <TableHead className="text-white"><b>Table Name</b></TableHead>
              <TableHead className="text-white"><b>Description</b></TableHead>
              <TableHead className="text-white"><b>Last Edit</b></TableHead>
              <TableHead className="text-white"><b>Created At</b></TableHead>
              <TableHead className="text-white"><b>Last Edit By</b></TableHead>
              <TableHead className="w-[50px] text-white"><b>Actions</b></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Table.value.data?.map((table) => (
              <TableRow
                key={table._id}
                className="transition-all duration-200 hover:bg-muted/50"
              >
                <TableCell className="py-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-all duration-200"
                    onClick={() => {
                      SelectedTable.value = table
                      nav(`/tables/${table._id}`)
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TableCell>
                <TableCell className="py-2">
                  <div className="font-medium">{table.name}</div>
                </TableCell>
                <TableCell className="py-2">
                  <div className="text-muted-foreground line-clamp-2">{table.description}</div>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-normal">
                      {new Date(table.updatedAt).toLocaleDateString()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(table.updatedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-normal">
                      {new Date(table.createdAt).toLocaleDateString()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(table.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  {table?.updatedBy?.name ? (
                    <Badge variant="secondary" className="font-normal">
                      {table.updatedBy.name}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0 hover:bg-muted"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {hasTablePermission(table, 'edit') && (
                        <>
                          <DropdownMenuItem
                            onClick={() => nav(`/tables/share/${table._id}`)}
                            className="cursor-pointer"
                          >
                            <ShareIcon className="mr-2 h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => nav(`/tables/update/${table._id}`)}
                            className="cursor-pointer"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </>
                      )}
                      {hasTablePermission(table, 'delete') && (
                        <DropdownMenuItem
                          onClick={() => handleDelete(table._id)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {!Table.value.data?.length && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-muted-foreground">No tables found</p>
                    {
                      Auth?.value?.loggedInUser?.isAdmin && <Button
                        variant="outline"
                        onClick={() => nav('/tables/create')}
                        className="mt-2 transition-colors duration-200"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create your first table
                      </Button>
                    }
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableComponent>
      </div>

      {
        Auth?.value?.loggedInUser?.isAdmin && <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => nav('/tables/create')}
                className="fixed cursor-pointer bottom-6 right-6 bg-primary hover:bg-primary/90 text-white transition-colors duration-200 shadow-lg rounded-full h-12 w-12 flex items-center justify-center bg-[#4161ed] hover:bg-[#1f3fcc] "
              >
                <span className="text-3xl">+</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Create New Table</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }
    </div>
  );
}