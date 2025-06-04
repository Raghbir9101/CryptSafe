

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { SharedWithInterface, TableInterface } from "@repo/types"
import ShareModal from "./share-modal"
import SharedUsersList from "./shared-users-list"
import { useParams } from "react-router-dom"
import { api } from "@/Utils/utils"
import { decryptObjectValues, encryptObjectValues } from "../Services/encrption"

// Mock function to update table - replace with your actual API call
const updateTable = async (tableId: string, updatedTable: TableInterface): Promise<void> => {
  console.log("Table updated:", updatedTable)
  // This would be your actual API call
}

export default function SharePage() {
  const { tableId } = useParams() as { tableId: string }
  const [table, setTable] = useState<TableInterface | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getTable = async () => {
      try {
        const res = await api.get(`/tables/${tableId}`)
        const decryptedData = decryptObjectValues(res.data, "thisiskadduklfljdsklf jdsklfjkdsjkfj fsfjlksj flllllllllllls");
        setTable(decryptedData)
      } catch (error) {
        console.error("Failed to fetch table:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getTable()
  }, [tableId])

  const handleAddSharedUser = async (newSharedUser: SharedWithInterface) => {
    if (!table) return

    try {
      const encryptedData = encryptObjectValues(newSharedUser, "thisiskadduklfljdsklf jdsklfjkdsjkfj fsfjlksj flllllllllllls");
      console.log(encryptedData,'encryptedData')
      const res = await api.patch(`/tables/share/${tableId}`, {
        sharedWith: encryptedData
      });

      if (res.data.error) {
        return
      }

      setTable(res.data.table)

      setIsModalOpen(false)
    } catch (error) {
      console.error("Failed to update table:", error)
    }
  }

  const handleUpdateSharedUser = async (email: string, updatedUser: SharedWithInterface) => {
    if (!table) return

    try {
      const encryptedData = encryptObjectValues(updatedUser, "thisiskadduklfljdsklf jdsklfjkdsjkfj fsfjlksj flllllllllllls");
      const res = await api.patch(`/tables/share/${tableId}`, {
        sharedWith: encryptedData
      });

      if (res.data.error) {
        return
      }

      setTable(res.data.table)
    } catch (error) {
      console.error("Failed to update table:", error)
    }
  }

  const handleRemoveSharedUser = async (email: string) => {
    if (!table) return

    const updatedTable: TableInterface = {
      ...table,
      sharedWith: table.sharedWith.filter((user) => user.email !== email),
    }

    try {
      await updateTable(tableId, updatedTable)
      setTable(updatedTable)
    } catch (error) {
      console.error("Failed to update table:", error)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!table) {
    return <div className="flex items-center justify-center h-screen">Table not found</div>
  }

  return (
    <div className="container mx-auto px-6 py-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Share Table: {table.name}</CardTitle>
          <CardDescription>Share your table with other users and set column-level permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6 ">
            <h3 className="text-lg font-medium">Shared Users</h3>
            <Button className="cursor-pointer bg-[#4161ed] hover:bg-[#1f3fcc]" onClick={() => setIsModalOpen(true)}>Share with User</Button>
          </div>

          <SharedUsersList
            sharedUsers={table.sharedWith || []}
            fields={table.fields || []}
            onUpdate={handleUpdateSharedUser}
            onRemove={handleRemoveSharedUser}
          />
        </CardContent>
      </Card>

      <ShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddSharedUser}
        fields={table.fields}
      />
    </div>
  )
}

