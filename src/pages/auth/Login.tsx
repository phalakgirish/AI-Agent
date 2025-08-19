import { useEffect, useState } from 'react';
import { Button, Alert, Row, Col } from 'react-bootstrap';
import { Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// hooks
import { useRedux } from '../../hooks/';

import url from '../../env';
// actions
import { resetAuth, loginUser } from '../../redux/actions';

// components
import { VerticalForm, FormInput } from '../../components/form/';
import Loader from '../../components/Loader';

import AuthLayout from './AuthLayout';

import  secureLocalStorage  from  "react-secure-storage";
import axios from "axios";
import jwtDecode from 'jwt-decode';

type LocationState = {
    from?: Location;
};

type UserData = {
    email: string;
    password: string;
};

/* bottom links */
const BottomLink = () => {
    const { t } = useTranslation();

    return (
        <Row className="mt-3">
            <Col xs={12} className="text-center">
                <p className="text-muted">
                    <Link to="/auth/forget-password" className="text-muted ms-1">
                        <i className="fa fa-lock me-1"></i>
                        {t('Forgot your password?')}
                    </Link>
                </p>
                {/* <p className="text-muted">
                    {t("Don't have an account?")}{' '}
                    <Link to={'/auth/register'} className="text-dark ms-1">
                        <b>{t('Sign Up')}</b>
                    </Link>
                </p> */}
            </Col>
        </Row>
    );
};

const Login = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { dispatch, appSelector } = useRedux();
    const [rememberMe,setRememberMe] = useState(false)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMessge] = useState(null)
    var rememberData:any 

    const { user, userLoggedIn, loading, error } = appSelector((state) => ({
        user: state.Auth.user,
        loading: state.Auth.loading,
        error: state.Auth.error,
        userLoggedIn: state.Auth.userLoggedIn,
    }));

    useEffect(() => {
        dispatch(resetAuth());
    }, [dispatch]);

    /*
    form validation schema
    */
    const schemaResolver = yupResolver(
        yup.object().shape({
            email: yup.string(),
            password: yup.string(),
        })
    );

    const handleChangeEmail = (event:any) => {
        
        const value = event.target.value;
        setEmail(value);
      };
      
      const handleChangePassword = (event:any) => {
        const value = event.target.value;
        setPassword(value);
      };

    useEffect(() => {
         
        // secureLocalStorage.removeItem('login');
        // secureLocalStorage.removeItem('userData')
        var localStorageData:any = secureLocalStorage.getItem('rememberMe')
        const loginvalue = secureLocalStorage.getItem('login');
        const StorageuserData:any = secureLocalStorage.getItem('userData');
        // var loginStorageData:any = secureLocalStorage.getItem('login')

        // console.log(loginStorageData);
        
        var rememberMe_Data:any = JSON.parse(localStorageData);
        // console.log(rememberMe_Data);
        
        if(localStorageData != null || localStorageData != undefined)
        {
            setEmail(rememberMe_Data.email);
            setPassword(rememberMe_Data.password);
            setRememberMe(rememberMe_Data.rememberMe);
            // rememberData = rememberMe_Data
            // console.log(rememberData);
            
        }

        if((loginvalue != null || loginvalue != undefined) && (StorageuserData != null || StorageuserData != undefined))
        { 
            navigate('/dashboard');
        }

    }, []);

    /*
    handle form submission
    */
    const onSubmit = (formData: UserData,event:any) => {
        event.preventDefault();
        // dispatch(loginUser(formData['email'], formData['password']));
        // console.log(formData);
        
        let baseURL = url.nodeapipath+'/login'
        // console.log(baseURL);
        
        var datatoPost = {
            user_emailid: (formData['email'] == '')?email:formData['email'],
            user_password: (formData['password'] == '')?password:formData['password']
        };

        fetch(baseURL,{
            method:'POST',
            body:JSON.stringify(datatoPost),
            headers: {
                'Content-Type':'application/json',
                'Access-Control-Allow-Origin':'*'
                }
        })
        .then(response => response.json())
        .then(val =>{

            // console.log(val);
            
            if(val.token !==  undefined)
            {
                // console.log(val.token);
                
                secureLocalStorage.setItem("login",val.token);
                if(rememberMe == true)
                {
                    secureLocalStorage.setItem("rememberMe",JSON.stringify({email:datatoPost.user_emailid,password:datatoPost.user_password,rememberMe:rememberMe}));
                }
                else
                {
                    secureLocalStorage.removeItem("rememberMe");
                }

                var decode:any = jwtDecode(val.token);
                // console.log(decode);
                
                secureLocalStorage.setItem('userData',JSON.stringify(decode.data));
                setErrorMessge(null);
                navigate('/dashboard');
            }
            else
            {
                setErrorMessge(val.msg);
                
            }
        })
    };

    const location = useLocation();
    let redirectUrl = '/';

    if (location.state) {
        const { from } = location.state as LocationState;
        redirectUrl = from ? from.pathname : '/';
    }

    return (
        <>
            {/* {userLoggedIn && user && <Navigate to={redirectUrl} replace />} */}

            <AuthLayout bottomLinks={<BottomLink />}>
                <div className="text-center mb-4">
                    <h4 className="text-uppercase mt-0" style={{color:'#fff'}}>{t('Sign In')}</h4>
                </div>

                {errorMsg && (
                    <Alert variant="danger" className="my-2">
                        {errorMsg}
                    </Alert>
                )}
                {loading && <Loader />}

                <VerticalForm
                    onSubmit={onSubmit}
                    // resolver={schemaResolver}
                    // defaultValues={{ email: email, password: password }}
                >
                    <FormInput
                        type="email"
                        name="email"
                        value={email}
                        label={t('Email address')}
                        placeholder={t('hello@coderthemes.com')}
                        onChange={handleChangeEmail}
                        containerClass={'mb-3'}
                    />
                    <FormInput
                        label={t('Password')}
                        type="password"
                        name="password"
                        value={password}
                        placeholder="Enter your password"
                        onChange={handleChangePassword}
                        containerClass={'mb-3'}
                    ></FormInput>

                    <FormInput
                        type="checkbox"
                        name="checkbox"
                        label={t('Remember me')}
                        containerClass={'mb-3'}
                        checked={rememberMe}
                        onChange={()=>{setRememberMe(!rememberMe)}}
                    />

                    <div className="text-center d-grid mb-3">
                        <Button variant="secondary" type="submit" disabled={loading}>
                            {t('Log In')}
                        </Button>
                    </div>
                </VerticalForm>
                <ToastContainer />
            </AuthLayout>
        </>
    );
};

export default Login;

// import { useEffect } from 'react';
// import { Button, Alert, Row, Col } from 'react-bootstrap';
// import { Navigate, Link, useLocation } from 'react-router-dom';
// import * as yup from 'yup';
// import { yupResolver } from '@hookform/resolvers/yup';
// import { useTranslation } from 'react-i18next';

// // hooks
// import { useRedux } from '../../hooks/';

// // actions
// import { resetAuth, loginUser } from '../../redux/actions';

// // components
// import { VerticalForm, FormInput } from '../../components/form/';
// import Loader from '../../components/Loader';
// import url from '../../env'; // Adjust the import according to your project structure

// import AuthLayout from './AuthLayout';

// type LocationState = {
//     from?: Location;
// };

// type UserData = {
//     email: string;
//     password: string;
// };

// /* bottom links */
// const BottomLink = () => {
//     const { t } = useTranslation();

//     return (
//         <Row className="mt-3">
//             <Col xs={12} className="text-center">
//                 <p className="text-muted">
//                     <Link to="/auth/forget-password" className="text-muted ms-1">
//                         <i className="fa fa-lock me-1"></i>
//                         {t('Forgot your password?')}
//                     </Link>
//                 </p>
//                 <p className="text-muted">
//                     {t("Don't have an account?")}{' '}
//                     <Link to={'/auth/register'} className="text-dark ms-1">
//                         <b>{t('Sign Up')}</b>
//                     </Link>
//                 </p>
//             </Col>
//         </Row>
//     );
// };

// const Login = () => {
//     const { t } = useTranslation();
//     const { dispatch, appSelector } = useRedux();

//     const { user, userLoggedIn, loading, error } = appSelector((state) => ({
//         user: state.Auth.user,
//         loading: state.Auth.loading,
//         error: state.Auth.error,
//         userLoggedIn: state.Auth.userLoggedIn,
//     }));

//     useEffect(() => {
//         dispatch(resetAuth());
//     }, [dispatch]);

//     /*
//     form validation schema
//     */
//     const schemaResolver = yupResolver(
//         yup.object().shape({
//             email: yup.string().required(t('Please enter Email')).email(t('Please enter valid Email')),
//             password: yup.string().required(t('Please enter Password')),
//         })
//     );

//     /*
//     handle form submission
//     */
//     const onSubmit = async (formData: UserData) => {
//         console.log(formData);
//         try {
//             const response = await fetch(`${url.nodeapipath}/login/`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     staff_emailId: formData.email,
//                     staff_password: formData.password,
//                 }),
//             });

//             const result = await response.json();
//             console.log(result);

//             if (result.status) {
//                 dispatch(loginUser(formData.email, formData.password));
//             } else {
//                 throw new Error(result.message || 'Failed to login');
//             }
//         } catch (error) {
//             console.error('Error during login:', error);
//         }
//     };

//     const location = useLocation();
//     let redirectUrl = '/';

//     if (location.state) {
//         const { from } = location.state as LocationState;
//         redirectUrl = from ? from.pathname : '/';
//     }

//     return (
//         <>
//             {userLoggedIn && user && <Navigate to={redirectUrl} replace />}

//             <AuthLayout bottomLinks={<BottomLink />}>
//                 <div className="text-center mb-4">
//                     <h4 className="text-uppercase mt-0">{t('Sign In')}</h4>
//                 </div>

//                 {error && (
//                     <Alert variant="danger" className="my-2">
//                         {error}
//                     </Alert>
//                 )}
//                 {loading && <Loader />}

//                 <VerticalForm<UserData>
//                     onSubmit={onSubmit}
//                     resolver={schemaResolver}
//                     defaultValues={{ email: 'adminto@coderthemes.com', password: 'test' }}
//                 >
//                     <FormInput
//                         type="email"
//                         name="email"
//                         label={t('Email address')}
//                         placeholder={t('hello@coderthemes.com')}
//                         containerClass={'mb-3'}
//                     />
//                     <FormInput
//                         label={t('Password')}
//                         type="password"
//                         name="password"
//                         placeholder="Enter your password"
//                         containerClass={'mb-3'}
//                     ></FormInput>

//                     <FormInput
//                         type="checkbox"
//                         name="checkbox"
//                         label={t('Remember me')}
//                         containerClass={'mb-3'}
//                         defaultChecked
//                     />

//                     <div className="text-center d-grid mb-3">
//                         <Button variant="primary" type="submit" disabled={loading}>
//                             {t('Log In')}
//                         </Button>
//                     </div>
//                 </VerticalForm>
//             </AuthLayout>
//         </>
//     );
// };

// export default Login;
