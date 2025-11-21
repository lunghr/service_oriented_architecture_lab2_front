import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router.tsx'

import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
        <ToastContainer
            position="top-right"
            autoClose={3000}
            theme="light"
        />
    </React.StrictMode>
)