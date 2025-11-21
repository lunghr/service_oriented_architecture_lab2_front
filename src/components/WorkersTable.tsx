import {useMemo, useState} from 'react'
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import type {ColumnDef} from '@tanstack/react-table'
import type {Worker} from '../types/worker'
import {Button, Table, Badge, Pagination} from 'react-bootstrap'
import {format} from 'date-fns'
import {ru} from 'date-fns/locale'

interface WorkersTableProps {
    workers: Worker[]
    onEdit: (worker: Worker) => void
    onDelete: (worker: Worker) => void
}

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

export default function WorkersTable({workers, onEdit, onDelete}: WorkersTableProps) {
    const [globalFilter, setGlobalFilter] = useState('')

    const columns = useMemo<ColumnDef<Worker>[]>(
        () => [
            {accessorKey: 'id', header: 'ID', size: 70},
            {accessorKey: 'name', header: 'ФИО', cell: info => <strong>{info.getValue<string>()}</strong>},
            {
                header: 'Координаты',
                cell: ({row}) => `${row.original.coordinates.x}, ${row.original.coordinates.y}`,
            },
            {
                accessorKey: 'salary',
                header: 'Зарплата',
                cell: ({row}) => row.original.salary
                    ? <span className="text-success fw-bold">{row.original.salary.toLocaleString('ru')} ₽</span>
                    : <em className="text-muted">—</em>,
            },
            {
                accessorKey: 'position',
                header: 'Должность',
                cell: ({row}) => row.original.position ? positionLabels[row.original.position] :
                    <em className="text-muted">—</em>,
            },
            {
                accessorKey: 'status',
                header: 'Статус',
                cell: ({row}) => {
                    const s = row.original.status
                    return <Badge bg={statusVariants[s]}>{statusTexts[s]}</Badge>
                },
            },
            {
                header: 'Организация',
                cell: ({row}) => row.original.organization.fullName,
            },
            {
                accessorKey: 'startDate',
                header: 'Дата приёма',
                cell: ({row}) => format(new Date(row.original.startDate), 'dd.MM.yyyy', {locale: ru}),
            },
            {
                id: 'actions',
                header: 'Действия',
                size: 130,
                cell: ({row}) => (
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
        ],
        [onEdit, onDelete]
    )

    const table = useReactTable({
        data: workers,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {globalFilter},
        onGlobalFilterChange: setGlobalFilter,
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
                                    style={{width: header.getSize()}}
                                    className="user-select-none cursor-pointer"
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                    </thead>
                    <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3">
                <div>Показано {table.getRowModel().rows.length} из {workers.length}</div>
                <Pagination>
                    <Pagination.Prev onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}/>
                    <Pagination.Item active>{table.getState().pagination.pageIndex + 1}</Pagination.Item>
                    <Pagination.Next onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}/>
                </Pagination>
            </div>
        </>
    )
}