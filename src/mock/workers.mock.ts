import type { Worker } from '../types/worker'

export const mockWorkers: Worker[] = [
    {
        id: 1,
        name: "Иванов Иван Иванович",
        coordinates: { x: 100, y: -50 },
        salary: 95000,
        startDate: "2024-03-15",
        creationDate: "2025-01-10T10:00:00.000Z",
        position: "LABORER",
        status: "HIRED",
        organization: {
            fullName: "Общество с ограниченной ответственностью «Ромашка»",
            employeesCount: 156,
            organizationType: "PRIVATE_LIMITED_COMPANY",
            officialAddress: "г. Москва, ул. Ленина, д. 25"
        }
    },
    {
        id: 2,
        name: "Петрова Анна Сергеевна",
        coordinates: { x: -200, y: 300 },
        salary: 180000,
        startDate: "2023-11-01",
        creationDate: "2025-01-08T14:22:11.000Z",
        position: "HEAD_OF_DEPARTMENT",
        status: "RECOMMENDED_FOR_PROMOTION",
        organization: {
            fullName: "Публичное акционерное общество «Газпром»",
            employeesCount: 466000,
            organizationType: "OPEN_JOINT_STOCK_COMPANY",
            officialAddress: "г. Москва, ул. Наметкина, д. 16"
        }
    },
    {
        id: 3,
        name: "Сидоров Пётр Алексеевич",
        coordinates: { x: 0, y: 0 },
        salary: null,
        startDate: "2025-04-01",
        creationDate: "2025-04-02T09:15:00.000Z",
        position: null,
        status: "PROBATION",
        organization: {
            fullName: "Индивидуальный предприниматель Сидоров П.А.",
            employeesCount: 3,
            organizationType: null,
            officialAddress: "г. Екатеринбург, ул. Малышева, д. 51"
        }
    }
    // Добавь ещё 5–10 записей, если хочешь — но и этих хватит для теста
]