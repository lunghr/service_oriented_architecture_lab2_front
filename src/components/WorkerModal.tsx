import {useEffect} from "react";
import {
    Modal,
    Button,
    Form,
    Row,
    Col,
    Badge,
} from "react-bootstrap";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";

import type {Worker, Position, Status, OrganizationType} from "../types/worker";
import {toast} from "react-toastify";


const positionOptions = ["LABORER", "HUMAN_RESOURCES", "HEAD_OF_DIVISION", "HEAD_OF_DEPARTMENT", "CLEANER"] as const;
const statusOptions = ["HIRED", "RECOMMENDED_FOR_PROMOTION", "PROBATION", "FIRED"] as const;
const organizationTypeOptions = ["TRUST", "PRIVATE_LIMITED_COMPANY", "OPEN_JOINT_STOCK_COMPANY", "PUBLIC"] as const;

const workerSchema = z.object({
    name: z.string().min(1, "ФИО обязательно").max(256, "Максимум 256 символов"),

    coordinates: z.object({
        x: z.string()
            .transform((v) => Number(v.replace(",", ".")))
            .refine((n) => !isNaN(n), {message: "X должен быть числом"})
            .refine((n) => n <= 950, {message: "X должен быть ≤ 950"})
            .transform((n) => n as number),

        y: z.string()
            .transform((v) => Number(v.replace(",", ".")))
            .refine((n) => !isNaN(n), {message: "Y должен быть числом"})
            .refine((n) => n >= -706, {message: "Y должен быть ≥ -706"})
            .transform((n) => n as number),
    }),

    salary: z.union([
        z.literal("").transform(() => null),
        z.string().transform((v) => Number(v.replace(",", "."))),
        z.number(),
    ])
        .optional()
        .refine((val) => val == null || val > 0, {message: "Зарплата должна быть > 0"})
        .transform((val) => {
            if (val == null) {
                return null;
            }
            return Number.isNaN(val) ? null : val;
        }),

    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Неверный формат даты"),

    position: z
        .preprocess((val) => (val === "" ? undefined : val), z.enum(positionOptions).nullable().optional()),

    status: z.enum(statusOptions),

    organization: z.object({
        fullName: z.string().min(1, "Название обязательно").max(256, "Максимум 256 символов"),

        employeesCount: z
            .string()
            .transform((v) => (v.trim() === "" ? null : Number(v)))
            .refine((n) => n === null || (Number.isInteger(n) && n > 0), {
                message: "Должно быть целым положительным числом",
            })
            .nullable()
            .optional(),

        organizationType: z
            .preprocess((val) => (val === "" ? undefined : val), z.enum(organizationTypeOptions).nullable().optional()),
        officialAddress: z
            .string()
            .max(256, "Максимум 256 символов")
            .nullable()
            .optional()
            .transform((v) => (v?.trim() === "" ? null : v)),
    }),
});

type WorkerFormData = z.infer<typeof workerSchema>;
type WorkerFormInputs = z.input<typeof workerSchema>;

const positionLabels: Record<Position, string> = {
    LABORER: "Рабочий",
    HUMAN_RESOURCES: "Кадры",
    HEAD_OF_DIVISION: "Начальник подразделения",
    HEAD_OF_DEPARTMENT: "Начальник отдела",
    CLEANER: "Уборщик",
};

const statusLabels: Record<Status, string> = {
    HIRED: "Работает",
    RECOMMENDED_FOR_PROMOTION: "Рекомендован к повышению",
    PROBATION: "Испытательный срок",
    FIRED: "Уволен",
};

const organizationTypeLabels: Record<OrganizationType, string> = {
    TRUST: "Траст",
    PRIVATE_LIMITED_COMPANY: "ООО",
    OPEN_JOINT_STOCK_COMPANY: "ПАО",
    PUBLIC: "Публичная",
};

const buildWorkerPayload = (data: WorkerFormData, original: Worker | null): Worker => ({
    id: original?.id ?? Date.now(),
    creationDate: original?.creationDate ?? new Date().toISOString(),
    name: data.name,
    coordinates: {x: data.coordinates.x, y: data.coordinates.y},
    salary: data.salary,
    startDate: data.startDate,
    position: data.position ?? null,
    status: data.status,
    organization: {
        fullName: data.organization.fullName,
        employeesCount: data.organization.employeesCount ?? null,
        organizationType: data.organization.organizationType ?? null,
        officialAddress: data.organization.officialAddress ?? null,
    },
});

export default function WorkerModal({
                                        show,
                                        onHide,
                                        worker,
                                        onSave,
                                    }: {
    show: boolean;
    onHide: () => void;
    worker: Worker | null;
    onSave: (worker: Worker) => void;
}) {
    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<WorkerFormInputs, unknown, WorkerFormData>({
        resolver: zodResolver(workerSchema),
        defaultValues: {
            name: "",
            coordinates: {x: "", y: ""},
            salary: "",
            startDate: new Date().toISOString().slice(0, 10),
            status: "HIRED",
            position: undefined,
            organization: {
                fullName: "",
                employeesCount: "",
                organizationType: "",
                officialAddress: "",
            },
        },
    });

    useEffect(() => {
        if (show) {
            if (worker) {
                // Редактирование — загружаем данные
                reset({
                    name: worker.name,
                    coordinates: {
                        x: worker.coordinates.x.toString(),
                        y: worker.coordinates.y.toString(),
                    },
                    salary: worker.salary == null || worker.salary === 0 ? "" : worker.salary.toString(),
                    startDate: worker.startDate.slice(0, 10),
                    position: worker.position ?? "",
                    status: worker.status,
                    organization: {
                        fullName: worker.organization.fullName,
                        employeesCount: worker.organization.employeesCount == null ? "" : worker.organization.employeesCount.toString(),
                        organizationType: worker.organization.organizationType ?? "",
                        officialAddress: worker.organization.officialAddress ?? "",
                    },
                });
            } else {
                reset({
                    name: "",
                    coordinates: {x: "", y: ""},
                    salary: "",
                    startDate: new Date().toISOString().slice(0, 10),
                    position: "",
                    status: undefined,
                    organization: {
                        fullName: "",
                        employeesCount: "",
                        organizationType: "",
                        officialAddress: "",
                    },
                });
            }
        }
    }, [show, worker, reset]); // ← КЛЮЧЕВОЕ: зависимость от show!


    const onSubmit = (data: WorkerFormData) => {
        const { x, y } = data.coordinates;
        const salary = data.salary;

        const MAX_SAFE = 1e16;
        if (Math.abs(x) > MAX_SAFE || Math.abs(y) > MAX_SAFE || (salary != null && Math.abs(salary) > MAX_SAFE)) {
            toast.error("Вы ввели слишком большое число в одно из полей. Попробуйте еще раз с меньшим значением.");
            onHide();
            return;
        }

        onSave(buildWorkerPayload(data, worker));
        onHide();
    };


    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {worker ? "Редактировать работника" : "Новый работник"}
                    {worker && <Badge bg="secondary" className="ms-2">ID: {worker.id}</Badge>}
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body>
                    {/* ФИО + Статус */}
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>ФИО *</Form.Label>
                                <Form.Control {...register("name")} isInvalid={!!errors.name}/>
                                <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Статус *</Form.Label>
                                <Form.Select {...register("status")}>
                                    {statusOptions.map((s) => (
                                        <option key={s} value={s}>{statusLabels[s]}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Координаты + Зарплата */}
                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>X ≤ 950 *</Form.Label>
                                <Form.Control
                                    {...register("coordinates.x")}
                                    isInvalid={!!errors.coordinates?.x}
                                    placeholder="123.45 или 123,45"
                                    maxLength={16}
                                />
                                <Form.Control.Feedback
                                    type="invalid">{errors.coordinates?.x?.message}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Y ≥ -706 *</Form.Label>
                                <Form.Control
                                    {...register("coordinates.y")}
                                    isInvalid={!!errors.coordinates?.y}
                                    placeholder="-500.67"
                                    maxLength={16}
                                />
                                <Form.Control.Feedback
                                    type="invalid">{errors.coordinates?.y?.message}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Зарплата</Form.Label>
                                <Form.Control
                                    type="text"
                                    {...register("salary")}
                                    isInvalid={!!errors.salary}
                                    placeholder="не указана"
                                    maxLength={16}
                                />
                                <Form.Control.Feedback type="invalid">{errors.salary?.message}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Дата приёма *</Form.Label>
                                <Form.Control type="date" {...register("startDate")} isInvalid={!!errors.startDate}/>
                                <Form.Control.Feedback
                                    type="invalid">{errors.startDate?.message}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Должность *</Form.Label>
                                <Form.Select {...register("position")}>
                                    <option value="">— не выбрано —</option>
                                    {positionOptions.map((p) => (
                                        <option key={p} value={p}>{positionLabels[p]}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Организация */}
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Полное название организации *</Form.Label>
                                <Form.Control
                                    {...register("organization.fullName")}
                                    isInvalid={!!errors.organization?.fullName}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.organization?.fullName?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Тип организации</Form.Label>
                                <Form.Select {...register("organization.organizationType")}>
                                    <option value="">— не выбрано —</option>
                                    {organizationTypeOptions.map((t) => (
                                        <option key={t} value={t}>{organizationTypeLabels[t]}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Численность сотрудников (опционально)</Form.Label>
                                <Form.Control
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder="не указано"
                                    maxLength={16}
                                    {...register("organization.employeesCount")}/>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Официальный адрес (опционально)</Form.Label>
                                <Form.Control
                                    {...register("organization.officialAddress")}
                                    isInvalid={!!errors.organization?.officialAddress}
                                    placeholder="не указан"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.organization?.officialAddress?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Отмена
                    </Button>
                    <Button variant="primary" type="submit">
                        {worker ? "Сохранить" : "Создать"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}




