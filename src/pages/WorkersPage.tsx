import { Suspense, lazy } from 'react'
import { Card, Spinner } from 'react-bootstrap'

const WorkersPageContent = lazy(() => import('./WorkersPageContent'))

export default function WorkersPage() {
    return (
        <Suspense
            fallback={
                <Card className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <div className="mt-3">Загрузка модуля...</div>
                </Card>
            }
        >
            <WorkersPageContent />
        </Suspense>
    )
}