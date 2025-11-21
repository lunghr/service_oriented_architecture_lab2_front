import { useMemo } from 'react'
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type PaginationState,
    type Updater,
} from '@tanstack/react-table'
import type { Worker } from '../types/worker'
import { Button, Table, Badge, Pagination, Form } from 'react-bootstrap'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

const positionLabels: Record<string, string> = {
    LABORER: 'Рабочий',
    HUMAN_RESOURCES: 'Кадры',
    HEAD_OF_DIVISION: 'Начальник подразделения',
    HEAD_OF_DEPARTMENT: 'Начальник отдела',
    CLEANER: 'Уборщик',
}

const statusVariants: Record<string, string> = {
    HIRED: 'success',
    RECOMMENDED_FOR_PROMOTION: 'warning',
    PROBATION: 'info',
    FIRED: 'danger',
}

const statusTexts: Record<string, string> = {
    HIRED: 'Работает',
    RECOMMENDED_FOR_PROMOTION: 'Рекомендован к повышению',
    PROBATION: 'Испытательный срок',
    FIRED: 'Уволен',
}

interface WorkersTableProps {
    data: Worker[]
    pageCount: number
    pagination: PaginationState
    setPagination: (updater: Updater<PaginationState>) => void
    onEdit: (worker: Worker) => void
    onDelete: (worker: Worker) => void
}

export default function WorkersTable({
                                         data,
                                         pageCount,
                                         pagination,
                                         setPagination,
                                         onEdit,
                                         onDelete,
                                     }: WorkersTableProps) {

    const columns = useMemo<ColumnDef<Worker>[]>(() => [
        { accessorKey: 'id', header: 'ID', size: 70 },
        { accessorKey: 'name', header: 'ФИО', cell: info => <strong>{info.getValue() as string}</strong> },
        {
            header: 'Координаты',
            cell: ({ row }) => `${row.original.coordinates.x}, ${row.original.coordinates.y}`,
        },
        {
            accessorKey: 'salary',
            header: 'Зарплата',
            cell: ({ row }) => row.original.salary
                ? <span className="text-success fw-bold">{row.original.salary.toLocaleString('ru')} ₽</span>
                : <em className="text-muted">—</em>,
        },
        {
            accessorKey: 'position',
            header: 'Должность',
            cell: ({ row }) => row.original.position ? positionLabels[row.original.position] : <em className="text-muted">—</em>,
        },
        {
            accessorKey: 'status',
            header: 'Статус',
            cell: ({ row }) => {
                const s = row.original.status
                return <Badge bg={statusVariants[s]}>{statusTexts[s]}</Badge>
            },
        },
        {
            header: 'Организация',
            cell: ({ row }) => row.original.organization.fullName,
        },
        {
            accessorKey: 'startDate',
            header: 'Дата приёма',
            cell: ({ row }) => format(new Date(row.original.startDate), 'dd.MM.yyyy', { locale: ru }),
        },
        {
            id: 'actions',
            header: 'Действия',
            size: 140,
            cell: ({ row }) => (
                <div className="d-flex gap-1">
                    <Button size="sm" variant="outline-primary" onClick={() => onEdit(row.original)}>
                        Изменить
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => onDelete(row.original)}>
                        Удалить
                    </Button>
                </div>
            ),
        },
    ], [onEdit, onDelete])

    const table = useReactTable({
        data,
        columns,
        pageCount,
        manualPagination: true,
        manualSorting: true,
        onPaginationChange: setPagination, // теперь тип совпадает — Updater<PaginationState>
        state: {
            pagination,
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    return (
        <>
            <div className="table-responsive">
                <Table striped bordered hover>
                    <thead className="table-dark">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th
                                    key={header.id}
                                    style={{ width: header.getSize() }}
                                    className="user-select-none"
                                    onClick={header.column.getToggleSortingHandler()}
                                    title="Клик — сортировка"
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {' '}
                                    {{
                                        asc: 'Up Arrow',
                                        desc: 'Down Arrow',
                                    }[header.column.getIsSorted() as string] ?? null}
                                </th>
                            ))}
                        </tr>
                    ))}
                    </thead>
                    <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </div>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-3">
                <div className="text-muted">
                    Страница <strong>{table.getState().pagination.pageIndex + 1}</strong> из <strong>{pageCount || 1}</strong>
                    {' '} (всего: {data.length} на странице)
                </div>

                <Pagination className="mb-0">
                    <Pagination.First onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} />
                    <Pagination.Prev onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} />
                    <Pagination.Next onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} />
                    <Pagination.Last onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} />
                </Pagination>

                <Form.Group controlId="gotoPage" className="d-flex align-items-center gap-2 mb-0">
                    <Form.Label className="mb-0">Перейти:</Form.Label>
                    <Form.Control
                        type="number"
                        min={1}
                        max={pageCount || 1}
                        value={table.getState().pagination.pageIndex + 1}
                        onChange={e => {
                            const page = e.target.value ? Number(e.target.value) - 1 : 0
                            table.setPageIndex(page)
                        }}
                        style={{ width: '80px' }}
                    />
                </Form.Group>
            </div>
        </>
    )
}
