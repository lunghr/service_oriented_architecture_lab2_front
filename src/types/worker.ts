export type Position = 'LABORER' | 'HUMAN_RESOURCES' | 'HEAD_OF_DIVISION' | 'HEAD_OF_DEPARTMENT' | 'CLEANER'
export type Status = 'HIRED' | 'RECOMMENDED_FOR_PROMOTION' | 'PROBATION' | 'FIRED'
export type OrganizationType = 'PUBLIC' |'TRUST' | 'PRIVATE_LIMITED_COMPANY' | 'OPEN_JOINT_STOCK_COMPANY'

export interface Coordinates {
    x: number
    y: number
}

export interface Organization {
    fullName: string
    employeesCount: number | null
    organizationType: OrganizationType | null
    officialAddress?: string | null
}

export interface Worker {
    id: number
    name: string
    coordinates: Coordinates
    salary: number | null
    startDate: string
    creationDate: string
    position: Position | null
    status: Status
    organization: Organization
}


export type NewWorker = Omit<Worker, 'id'> & {
    startDate: string
}

export type WorkerUpdate = Partial<Omit<Worker, 'id'>>


export interface WorkerResponse {
    content: Worker[]
    totalElements: number
    totalPages: number
    page: number
    size: number
    first: boolean
    last: boolean
}