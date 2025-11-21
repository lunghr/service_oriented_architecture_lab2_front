import { useState, useEffect } from 'react'
import { Card, Button, Spinner, Alert } from 'react-bootstrap'
import WorkersTable from '../components/WorkersTable'
import WorkerModal from '../components/WorkerModal'
import type { Worker, NewWorker } from '../types/worker'
import { workerApi } from '../api/workerApi'
import { toast } from 'react-toastify'

type ApiError = {
    response?: {
        data?: {
            message?: string
        }
    }
}

const getErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === 'object' && error !== null) {
        const apiError = error as ApiError
        if (apiError.response?.data?.message) {
            return apiError.response.data.message
        }
    }
    if (error instanceof Error) {
        return error.message
    }
    return fallback
}

export default function WorkersPage() {
    const [workers, setWorkers] = useState<Worker[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [editingWorker, setEditingWorker] = useState<Worker | null>(null)

    const loadWorkers = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await workerApi.getWorkers(1, 50)
            setWorkers(data.content)
        } catch (err: unknown) {
            const msg = getErrorMessage(err, 'Не удалось подключиться к серверу')
            setError(msg)
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadWorkers()
    }, [])

    const handleSave = async (payload: Worker) => {
        try {
            const saved =
                editingWorker
                    ? await workerApi.updateWorker(editingWorker.id, payload)
                    : await workerApi.createWorker(payload as NewWorker)

            setWorkers(prev =>
                editingWorker
                    ? prev.map(w => (w.id === saved.id ? saved : w))
                    : [saved, ...prev]
            )

            toast.success(editingWorker ? 'Работник обновлён!' : 'Работник добавлен!')
            setShowModal(false)
            setEditingWorker(null)
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'Ошибка сохранения'))
        }
    }


    const handleDelete = async (worker: Worker) => {
        try {
            await workerApi.deleteWorker(worker.id)
            toast.success('Работник удалён')
            await loadWorkers()
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'Не удалось удалить'))
        }
    }
    if (loading) {
        return (
            <Card className="text-center py-5">
                <div className="mt-3">Загрузка работников...</div>
                <div className="mt-3">
                    <Spinner animation="border" role="status" variant="primary" />
                </div>
            </Card>
        )
    }

    if (error) {
        return (
            <Alert variant="danger">
                <Alert.Heading>Ошибка подключения к серверу</Alert.Heading>
                <p>{error}</p>
                <Button onClick={loadWorkers}>Попробовать снова</Button>
            </Alert>
        )
    }

    return (
        <>
            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h3 className="mb-0">Работники</h3>
                    <div className="d-flex gap-2">
                        <Button variant="success" onClick={() => { setEditingWorker(null); setShowModal(true) }}>
                            + Добавить работника
                        </Button>
                        <Button variant="primary"  onClick={loadWorkers}>
                            Обновить список
                        </Button>
                    </div>
                </Card.Header>
                <Card.Body>
                    <WorkersTable
                        workers={workers}
                        onEdit={w => { setEditingWorker(w); setShowModal(true) }}
                        onDelete={handleDelete}
                    />
                </Card.Body>
            </Card>

            <WorkerModal
                show={showModal}
                onHide={() => { setShowModal(false); setEditingWorker(null) }}
                worker={editingWorker}
                onSave={handleSave}
            />
        </>
    )
}