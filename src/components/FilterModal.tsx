import { Modal, Button, Form, Stack, Row, Col, CloseButton } from 'react-bootstrap'
import { useState } from 'react'

export type FilterOperator = 'eq' | 'in' | 'like' | 'gt' | 'gte' | 'lt' | 'lte' | 'between'

export type FilterItem = {
    field: string
    operator: FilterOperator
    value: string
    value2?: string
}

const fieldConfig = [
    { value: 'id', label: 'ID', operators: ['eq', 'gt', 'gte', 'lt', 'lte', 'between'] as const },
    { value: 'name', label: 'ФИО', operators: ['like'] as const },
    { value: 'salary', label: 'Зарплата', operators: ['eq', 'gt', 'gte', 'lt', 'lte', 'between'] as const },
    { value: 'position', label: 'Должность', operators: ['eq', 'in'] as const },
    { value: 'status', label: 'Статус', operators: ['eq', 'in'] as const },
    { value: 'startDate', label: 'Дата приёма', operators: ['eq', 'gt', 'gte', 'lt', 'lte', 'between'] as const },
    { value: 'x', label: 'Координата X', operators: ['eq', 'gt', 'gte', 'lt', 'lte'] as const },
    { value: 'y', label: 'Координата Y', operators: ['eq', 'gt', 'gte', 'lt', 'lte'] as const },
    { value: 'organization', label: 'Организация (название)', operators: ['like'] as const },
] as const

const operatorLabels: Record<FilterOperator, string> = {
    eq: 'равно',
    in: 'один из',
    like: 'содержит',
    gt: 'больше',
    gte: 'больше или равно',
    lt: 'меньше',
    lte: 'меньше или равно',
    between: 'между',
}

const positionOptions = [
    { value: 'LABORER', label: 'Рабочий' },
    { value: 'HUMAN_RESOURCES', label: 'Кадры' },
    { value: 'HEAD_OF_DIVISION', label: 'Начальник подразделения' },
    { value: 'HEAD_OF_DEPARTMENT', label: 'Начальник отдела' },
    { value: 'CLEANER', label: 'Уборщик' },
]

const statusOptions = [
    { value: 'HIRED', label: 'Работает' },
    { value: 'PROBATION', label: 'Испытательный срок' },
    { value: 'RECOMMENDED_FOR_PROMOTION', label: 'Рекомендован к повышению' },
    { value: 'FIRED', label: 'Уволен' },
]

interface FilterModalProps {
    show: boolean
    onHide: () => void
    currentFilters: FilterItem[]
    onSave: (filters: FilterItem[]) => void
}

export default function FilterModal({
                                        show,
                                        onHide,
                                        currentFilters,
                                        onSave
                                    }: FilterModalProps) {
    const [filters, setFilters] = useState<FilterItem[]>(
        currentFilters.length > 0
            ? currentFilters
            : [{ field: '', operator: 'eq', value: '' }]
    )

    const addFilter = () => {
        setFilters(prev => [...prev, { field: '', operator: 'eq', value: '' }])
    }

    const removeFilter = (index: number) => {
        if (filters.length === 1) return
        setFilters(prev => prev.filter((_, i) => i !== index))
    }

    const updateFilter = (index: number, updates: Partial<FilterItem>) => {
        setFilters(prev => {
            const newFilters = [...prev]
            const oldField = newFilters[index].field

            newFilters[index] = { ...newFilters[index], ...updates }

            if (updates.field && updates.field !== oldField) {
                const config = fieldConfig.find(c => c.value === updates.field)
                const defaultOp = config?.operators[0] || 'eq'
                newFilters[index].operator = defaultOp
                newFilters[index].value = ''
                newFilters[index].value2 = undefined
            }

            if (updates.operator) {
                newFilters[index].value = ''
                newFilters[index].value2 = undefined
            }

            return newFilters
        })
    }

    const toFilterString = (item: FilterItem): string | null => {
        if (!item.field || !item.value) return null

        if (item.operator === 'between') {
            if (!item.value2) return null
            return `${item.field}:between:${item.value}:${item.value2}`
        }

        if (item.operator === 'in') {
            const values = item.value.split(',').map(v => v.trim()).filter(Boolean)
            if (values.length === 0) return null
            return `${item.field}:in:${values.join(':')}`
        }

        return `${item.field}:${item.operator}:${item.value}`
    }

    const handleSave = () => {
        const validItems = filters.filter(f => toFilterString(f) !== null)
        onSave(validItems)
        onHide()
    }

    const isEnumField = (field: string): boolean =>
        field === 'position' || field === 'status'

    return (
        <Modal show={show} onHide={onHide} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Фильтры</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Stack gap={4}>
                    {filters.map((filter, index) => {
                        const config = fieldConfig.find(c => c.value === filter.field)
                        const operators = config?.operators ?? ['eq'] as const
                        const isEnum = isEnumField(filter.field)
                        const options = filter.field === 'position' ? positionOptions : statusOptions

                        return (
                            <Row key={index} className="align-items-end">
                                <Col md={3}>
                                    <Form.Label>Поле</Form.Label>
                                    <Form.Select
                                        value={filter.field}
                                        onChange={e => updateFilter(index, { field: e.target.value })}
                                    >
                                        <option value="">— Выберите поле —</option>
                                        {fieldConfig.map(f => (
                                            <option key={f.value} value={f.value}>{f.label}</option>
                                        ))}
                                    </Form.Select>
                                </Col>

                                <Col md={3}>
                                    <Form.Label>Условие</Form.Label>
                                    <Form.Select
                                        value={filter.operator}
                                        onChange={e => updateFilter(index, { operator: e.target.value as FilterOperator })}
                                        disabled={!filter.field}
                                    >
                                        {operators.map(op => (
                                            <option key={op} value={op}>{operatorLabels[op]}</option>
                                        ))}
                                    </Form.Select>
                                </Col>

                                {isEnum ? (
                                    filter.operator === 'in' ? (
                                        <Col md={5}>
                                            <Form.Label>Значения</Form.Label>
                                            <div className="d-flex flex-wrap gap-3">
                                                {options.map(opt => (
                                                    <Form.Check
                                                        key={opt.value}
                                                        type="checkbox"
                                                        id={`check-${index}-${opt.value}`}
                                                        label={opt.label}
                                                        checked={filter.value.includes(opt.value)}
                                                        onChange={e => {
                                                            const values = filter.value ? filter.value.split(',') : []
                                                            if (e.target.checked) {
                                                                values.push(opt.value)
                                                            } else {
                                                                const idx = values.indexOf(opt.value)
                                                                if (idx > -1) values.splice(idx, 1)
                                                            }
                                                            updateFilter(index, { value: values.join(',') })
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </Col>
                                    ) : (
                                        <Col md={5}>
                                            <Form.Label>Значение</Form.Label>
                                            <Form.Select
                                                value={filter.value}
                                                onChange={e => updateFilter(index, { value: e.target.value })}
                                            >
                                                <option value="">— выберите —</option>
                                                {options.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </Form.Select>
                                        </Col>
                                    )
                                ) : (
                                    <>
                                        <Col md={filter.operator === 'between' ? 3 : 5}>
                                            <Form.Label>
                                                {filter.operator === 'between' ? 'От' : 'Значение'}
                                            </Form.Label>
                                            <Form.Control
                                                type={filter.field.includes('Date') ? 'date' : 'text'}
                                                value={filter.value}
                                                onChange={e => updateFilter(index, { value: e.target.value })}
                                                placeholder={
                                                    filter.operator === 'like' ? 'часть текста' :
                                                        filter.operator === 'in' ? 'через запятую: A,B' : ''
                                                }
                                            />
                                        </Col>

                                        {filter.operator === 'between' && (
                                            <Col md={2}>
                                                <Form.Label>До</Form.Label>
                                                <Form.Control
                                                    type={filter.field.includes('Date') ? 'date' : 'text'}
                                                    value={filter.value2 || ''}
                                                    onChange={e => updateFilter(index, { value2: e.target.value })}
                                                />
                                            </Col>
                                        )}
                                    </>
                                )}

                                <Col md={1}>
                                    <CloseButton
                                        onClick={() => removeFilter(index)}
                                        disabled={filters.length === 1}
                                    />
                                </Col>
                            </Row>
                        )
                    })}

                    <div>
                        <Button variant="outline-primary" size="sm" onClick={addFilter}>
                            + Добавить условие
                        </Button>
                    </div>
                </Stack>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Отмена
                </Button>
                <Button
                    variant="danger"
                    onClick={() => {
                        setFilters([{ field: '', operator: 'eq', value: '' }])
                        onSave([])
                        onHide()
                    }}
                >
                    Очистить все
                </Button>
                <Button variant="success" onClick={handleSave}>
                    Применить ({filters.filter(f => toFilterString(f)).length})
                </Button>
            </Modal.Footer>
        </Modal>
    )
}