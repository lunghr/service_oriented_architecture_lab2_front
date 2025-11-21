import { Container, Navbar, Nav } from 'react-bootstrap'
import { Link, Outlet } from 'react-router-dom'

export default function App() {
    return (
        <>
            <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
                <Container>
                    <Navbar.Brand as={Link} to="/">Worker Admin</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Список работников</Nav.Link>
                        <Nav.Link as={Link} to="/hr">HR-операции</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>

            <Container className="py-4">
                <Outlet />
            </Container>
        </>
    )
}