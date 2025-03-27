import { signal } from '@preact/signals-react';
import { TableInterface } from '@repo/types';
import { api } from '../../Utils/utils';


interface TableState {
    status: 'idle' | 'loading' | 'error' | 'success',
    data: TableInterface[] | null
}

export const Table = signal<TableState>({
    status: 'idle',
    data: null
})

export const getTables = async () => {
    Table.value = { ...Table.value, status: 'loading' }
    try {
        const response = await api.get('/tables', { withCredentials: true });
        Table.value = { ...Table.value, data: response.data, status: 'success' }
        return response.data
    } catch (error) {
        Table.value = { ...Table.value, status: 'error' }
        return error
    }
}

export const createTable = async (tableData: { name: string, fields: any, description: string }) => {
    Table.value = { ...Table.value, status: 'loading' }
    try {
        const response = await api.post('/tables', tableData, { withCredentials: true });
        Table.value = { ...Table.value, data: response.data, status: 'success' }
        return response.data
    } catch (error) {
        Table.value = { ...Table.value, status: 'error' }
        return error
    }
}

export const updateTable = async (id: string, tableData: { name: string, fields: any, description: string }) => {
    Table.value = { ...Table.value, status: 'loading' }
    try {
        const response = await api.patch(`/tables/${id}`, tableData, { withCredentials: true });
        Table.value = { ...Table.value, data: response.data, status: 'success' }
        return response.data;
    } catch (error) {
        Table.value = { ...Table.value, status: 'error' }
        return error
    }
}


