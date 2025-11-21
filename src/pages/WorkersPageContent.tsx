import {useState, useEffect, useCallback} from 'react'
import {
    Card,
    Button,
    Spinner,
    Alert,
    Form,
} from 'react-bootstrap'
import WorkersTable from '../components/WorkersTable'
import WorkerModal from '../components/WorkerModal'
import SortModal, {type SortItem} from '../components/SortModal'
import FilterModal, {type FilterItem} from '../components/FilterModal'
import type {NewWorker, Worker} from '../types/worker'
import {workerApi} from '../api/workerApi'
import {toast} from 'react-toastify'

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

export default function WorkersPageContent() {
    const [workers, setWorkers] = useState<Worker[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [sort, setSort] = useState<SortItem[]>([])
    const [filters, setFilters] = useState<FilterItem[]>([])

    const [showSortModal, setShowSortModal] = useState(false)
    const [showFilterModal, setShowFilterModal] = useState(false)

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    const [pageCount, setPageCount] = useState(0)
    const [totalElements, setTotalElements] = useState(0)

    const [showModal, setShowModal] = useState(false)
    const [editingWorker, setEditingWorker] = useState<Worker | null>(null)

    const loadWorkers = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const sortArray = sort.map(s => (s.direction === 'desc' ? '-' : '') + s.field)
            const filterArray = filters.map(f => {
                if (f.operator === 'between') return `${f.field}:between:${f.value}:${f.value2 || ''}`
                if (f.operator === 'in') {
                    const values = f.value.split(',').map(v => v.trim()).filter(Boolean)
                    return values.length ? `${f.field}:in:${values.join(':')}` : null
                }
                return `${f.field}:${f.operator}:${f.value}`
            }).filter(Boolean) as string[]

            const response = await workerApi.searchWorkers(
                pagination.pageIndex + 1,
                pagination.pageSize,
                sortArray,
                filterArray
            )

            setWorkers(response.content)
            setPageCount(response.totalPages)
            setTotalElements(response.totalElements)
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Ошибка сервера'
            setError(msg)
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }, [pagination.pageIndex, pagination.pageSize, sort, filters])

    useEffect(() => {
        loadWorkers()
    }, [loadWorkers])

    const handleSave = async (payload: Worker) => {
        try {
            if (editingWorker) {
                await workerApi.updateWorker(editingWorker.id, payload)
            } else {
                await workerApi.createWorker(payload as NewWorker)
            }
            await loadWorkers()

            toast.success(editingWorker ? 'Работник обновлён!' : 'Работник добавлен!')
            setShowModal(false)
            setEditingWorker(null)
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'Ошибка сохранения'))
        }
    }

    const handleDelete = async (worker: Worker) => {
        if (!confirm(`Удалить работника "${worker.name}"?`)) return

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
                    <Spinner animation="border" variant="primary" className="mt-3"/>
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
                    <h3 className="mb-0">
                        Работники
                    </h3>
                    <div className="d-flex gap-2 align-items-center">
                        <Form.Select
                            size="sm"
                            value={pagination.pageSize}
                            aria-label="Размер страницы"
                            onChange={(event) => {
                                const nextSize = Number(event.target.value)
                                setPagination(prev => ({
                                    ...prev,
                                    pageSize: nextSize,
                                    pageIndex: 0,
                                }))
                            }}
                        >
                            {[5, 10, 20, 50].map(size => (
                                <option key={size} value={size}>
                                    {size} / стр.
                                </option>
                            ))}
                        </Form.Select>

                        <Button
                            variant="outline-info"
                            className="px-4 text-nowrap"
                            onClick={() => setShowFilterModal(true)}
                            active={filters.length > 0}
                        >
                            Фильтры {filters.length > 0 && `(${filters.length})`}
                        </Button>

                        <Button
                            variant="outline-secondary"
                            className="px-4 text-nowrap"
                            onClick={() => setShowSortModal(true)}
                            active={sort.length > 0}
                        >
                            Сортировка {sort.length > 0 && `(${sort.length})`}
                        </Button>

                        <Button
                            variant="success"
                            className="px-4 text-nowrap"
                            onClick={() => {
                                setEditingWorker(null)
                                setShowModal(true)
                            }}
                        >
                            + Добавить
                        </Button>
                        <Button variant="primary" onClick={loadWorkers}>
                            Обновить
                        </Button>
                        {(sort.length > 0 || filters.length > 0) && (
                            <Button
                                variant="danger"
                                className="px-4 text-nowrap"
                                onClick={() => {
                                    setSort([])
                                    setFilters([])
                                    setPagination(prev => ({...prev, pageIndex: 0}))
                                    toast.info('Все фильтры и сортировка сброшены')
                                }}
                                title="Очистить все фильтры и сортировку"
                            >
                                Сбросить всё
                            </Button>
                        )}
                    </div>
                </Card.Header>
                <Card.Body>
                    <WorkersTable
                        data={workers}
                        pageCount={pageCount}
                        pagination={pagination}
                        setPagination={setPagination}
                        onEdit={(w) => {
                            setEditingWorker(w);
                            setShowModal(true)
                        }}
                        onDelete={handleDelete}
                    />
                </Card.Body>
            </Card>

            <WorkerModal
                show={showModal}
                onHide={() => {
                    setShowModal(false);
                    setEditingWorker(null)
                }}
                worker={editingWorker}
                onSave={handleSave}
            />
            <SortModal
                show={showSortModal}
                onHide={() => setShowSortModal(false)}
                currentSort={sort}
                onSave={(newSort) => {
                    setSort(newSort)
                    setPagination(prev => ({...prev, pageIndex: 0})) // сбрасываем на первую страницу
                }}
            />

            <FilterModal
                show={showFilterModal}
                onHide={() => setShowFilterModal(false)}
                currentFilters={filters}
                onSave={(newFilters) => {
                    setFilters(newFilters)
                    setPagination(prev => ({...prev, pageIndex: 0}))
                }}
            />
        </>
    )
}