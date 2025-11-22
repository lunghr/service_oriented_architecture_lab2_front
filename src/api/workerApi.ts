import axios from 'axios'
import type {Worker, NewWorker, WorkerUpdate, WorkerResponse} from '../types/worker'

const WORKER_API = 'https://localhost:8543/jaxrs-service/api'

const api = axios.create({
    baseURL: WORKER_API,
})
export const workerApi = {
    getWorkers: async (page = 1, size = 10): Promise<WorkerResponse> => {
        const response = await api.get<WorkerResponse>('/workers', {
            params: {page, size}
        })
        return response.data
    },

    createWorker: async (data: NewWorker): Promise<Worker> => {
        const response = await api.post<Worker>('/workers', data)
        return response.data
    },

    updateWorker: async (id: number, data: WorkerUpdate): Promise<Worker> => {
        const response = await api.patch<Worker>(`/workers/${id}`, data)
        return response.data
    },

    deleteWorker: async (id: number): Promise<void> => {
        await api.delete(`/workers/${id}`)
    },

    searchWorkers: async (
        page = 1,
        size = 10,
        sort: string[] = [],
        filter: string[] = []
    ): Promise<WorkerResponse> => {
        const response = await api.post<WorkerResponse>('/workers/search', {
            sort,
            filter
        }, {
            params: {page, size}
        })
        return response.data
    }
}