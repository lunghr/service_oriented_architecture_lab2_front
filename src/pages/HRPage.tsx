import { useState } from 'react'
import { Card, Button, Form, InputGroup, Alert } from 'react-bootstrap'
import { toast } from 'react-toastify'
import axios from 'axios'

type ApiErrorResponse = { message?: string }

const HR_API = 'https://localhost:8444/spring-service/api'

const api = axios.create({
    baseURL: HR_API
})

const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback
    }
    return fallback
}

export default function HRPage() {
    const [fireId, setFireId] = useState('')
    const [indexId, setIndexId] = useState('')
    const [coeff, setCoeff] = useState('')
    const [result, setResult] = useState<string | null>(null)

    const fireWorker = async () => {
        if (!fireId || !/^\d+$/.test(fireId)) {
            toast.error('Введите корректный ID')
            return
        }

        try {
            const res = await api.post(`/hr/fire/${fireId}`)
            toast.success(res.data)
            setResult(`Успешно уволен работник ID ${fireId}`)
            setFireId('')
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Ошибка увольнения'))
        }
    }

    const normalizeDecimal = (value: string) => value.replace(',', '.');

    const indexSalary = async () => {
        const normalizedCoeff = normalizeDecimal(coeff);
        const coeffValue = Number(normalizedCoeff);

        if (!indexId || Number.isNaN(coeffValue) || coeffValue <= 1) {
            toast.error('ID и коэффициент > 1 обязательны');
            return;
        }

        try {
            const res = await api.post(`/hr/index/${indexId}/${normalizedCoeff}`);
            setResult(`Зарплата работника ${indexId} проиндексирована: ${res.data.message} ₽`);
            setIndexId('');
            setCoeff('');
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Ошибка индексации'));
        }
    }

    return (
        <div className="row">
            <div className="col-lg-6">
                <Card className="mb-4">
                    <Card.Header className="bg-danger text-white">
                        <h4 className="mb-0">Увольнение сотрудника</h4>
                    </Card.Header>
                    <Card.Body>
                        <InputGroup>
                            <Form.Control
                                placeholder="ID работника"
                                value={fireId}
                                onChange={(e) => setFireId(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fireWorker()}
                            />
                            <Button variant="danger" onClick={fireWorker}>
                                Уволить
                            </Button>
                        </InputGroup>
                        <small className="text-muted">
                            Введите ID из таблицы работников и нажмите "Уволить"
                        </small>
                    </Card.Body>
                </Card>
            </div>

            <div className="col-lg-6">
                <Card className="mb-4">
                    <Card.Header className="bg-success text-white">
                        <h4 className="mb-0">Индексация зарплаты</h4>
                    </Card.Header>
                    <Card.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>ID работника</Form.Label>
                            <Form.Control
                                placeholder="Например: 42"
                                value={indexId}
                                onChange={(e) => setIndexId(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Коэффициент индексации (например: 1.15)</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                min="1.01"
                                placeholder="1.15"
                                value={coeff}
                                onChange={(e) => setCoeff(e.target.value)}
                            />
                        </Form.Group>
                        <Button variant="success" onClick={indexSalary} className="w-100">
                            Проиндексировать зарплату
                        </Button>
                    </Card.Body>
                </Card>
            </div>

            {result && (
                <div className="col-12">
                    <Alert variant="info" onClose={() => setResult(null)} dismissible>
                        <strong>Результат:</strong> {result}
                    </Alert>
                </div>
            )}
        </div>
    )
}