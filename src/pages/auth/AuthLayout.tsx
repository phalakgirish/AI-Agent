import { useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// images
// import LogoDark from '../../assets/images/logo-dark.png';
// import LogoDark from '../../assets/images/aiagent-login-logo.webp';
import LogoDark from '../../assets/images/aiagent-login-logo.png';
// import LogoLight from '../../assets/images/aiagent-login-logo.webp';
import LogoLight from '../../assets/images/aiagent-login-logo.png';


// import LogoLight from '../../assets/images/logo-light.png';

type AccountLayoutProps = {
    hasLogo?: boolean;
    bottomLinks?: any;
    children?: React.ReactNode;
};

const AuthLayout = ({ hasLogo, bottomLinks, children }: AccountLayoutProps) => {
    const { t } = useTranslation();

    useEffect(() => {
        if (document.body) {
            document.body.classList.add('authentication-bg');
        }
        return () => {
            if (document.body) {
                document.body.classList.remove('authentication-bg');
            }
        };
    }, []);

    return (
        <div className="account-pages my-4">
            <Container>
                <Row className="justify-content-center">
                    <Col md={8} lg={6} xl={4}>
                        {hasLogo && (
                            <div className="text-center">
                                <div className="auth-logo">
                                    <Link to="/" className="logo logo-dark text-center">
                                        <span className="logo-lg">
                                            <img src={LogoDark} alt="" style={{width:'40%'}} />
                                        </span>
                                    </Link>

                                    <Link to="/" className="logo logo-light text-center">
                                        <span className="logo-lg">
                                            {/* <img src={LogoLight} alt="" height="80" /> */} LOGO
                                        </span>
                                    </Link>
                                </div>
                                <p className="text-muted mt-2 mb-2">{t('')}</p>
                            </div>
                        )}
                        <Card style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)',color: '#fff'}}>
                            <Card.Body className="p-4" >{children}</Card.Body>
                        </Card>

                        {/* bottom links */}
                        {/* {bottomLinks} */}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

AuthLayout.defaultProps = {
    hasLogo: true,
};

export default AuthLayout;
