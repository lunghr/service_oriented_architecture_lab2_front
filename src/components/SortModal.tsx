// components/SortModal.tsx
import { Modal, Button, Form, Stack } from 'react-bootstrap'
import { useState } from 'react'

export type SortItem = {
    field: string
    direction: 'asc' | 'desc'
}

const sortOptions = [
    { value: 'id', label: 'ID' },
    { value: 'name', label: 'ФИО' },
    { value: 'salary', label: 'Зарплата' },
    { value: 'startDate', label: 'Дата приёма' },
    { value: 'position', label: 'Должность' },
    { value: 'status', label: 'Статус' },
    { value: 'organization.fullName', label: 'Организация' },
] as const

interface SortModalProps {
    show: boolean
    onHide: () => void
    currentSort: SortItem[]
    onSave: (sort: SortItem[]) => void
}

export default function SortModal({ show, onHide, currentSort, onSave }: SortModalProps) {
    const [localSort, setLocalSort] = useState<SortItem[]>(currentSort.length ? currentSort : [{ field: '', direction: 'asc' }])

    const addSort = () => {
        setLocalSort([...localSort, { field: '', direction: 'asc' }])
    }

    const removeSort = (index: number) => {
        setLocalSort(localSort.filter((_, i) => i !== index))
    }

    const updateSort = (index: number, field: string, direction: 'asc' | 'desc') => {
        const updated = [...localSort]
        updated[index] = { field, direction }
        setLocalSort(updated)
    }

    const handleSave = () => {
        const cleaned = localSort.filter(s => s.field)
        onSave(cleaned.length ? cleaned : [])
        onHide()
    }

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Настройка сортировки</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Stack gap={3}>
                    {localSort.map((item, index) => (
                        <Stack direction="horizontal" gap={3} key={index}>
                            <Form.Select
                                value={item.field}
                                onChange={(e) => updateSort(index, e.target.value, item.direction)}
                                style={{ width: '300px' }}
                            >
                                <option value="">— Выберите поле —</option>
                                {sortOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </Form.Select>

                            <Form.Select
                                value={item.direction}
                                onChange={(e) => updateSort(index, item.field, e.target.value as 'asc' | 'desc')}
                                style={{ width: '140px' }}
                            >
                                <option value="asc">По возрастанию</option>
                                <option value="desc">По убыванию</option>
                            </Form.Select>

                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => removeSort(index)}
                                disabled={localSort.length === 1}
                            >
                                Удалить
                            </Button>
                        </Stack>
                    ))}

                    <Button variant="outline-primary" size="sm" onClick={addSort}>
                        + Добавить сортировку
                    </Button>
                </Stack>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Отмена</Button>
                <Button variant="danger" onClick={() => { setLocalSort([]); onSave([]); onHide() }}>
                    Сбросить всё
                </Button>
                <Button variant="success" onClick={handleSave}>
                    Применить
                </Button>
            </Modal.Footer>
        </Modal>
    )
}