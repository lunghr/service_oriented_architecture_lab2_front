import { createBrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import WorkersPage from './pages/WorkersPage.tsx'
import HRPage from './pages/HRPage.tsx'

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <WorkersPage /> },
            { path: 'hr', element: <HRPage /> },
        ]
    }
])