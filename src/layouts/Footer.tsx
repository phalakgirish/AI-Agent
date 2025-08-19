import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <Container fluid>
                <Row>
                    <Col md={6}>
                        &copy; {new Date().getFullYear()} All Rights Reserved.
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
