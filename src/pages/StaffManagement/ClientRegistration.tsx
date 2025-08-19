import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Row, Col, Container, Card, Button, Modal } from 'react-bootstrap';
import url from '../../env';
import { usePageTitle } from '../../hooks';
import secureLocalStorage from 'react-secure-storage';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


interface IFormInput {
    fullname: string;
    email: string;
    client_isemailVerified:string;
    role:string;
    authid:string;
    authtoken:string;
    landline_number: string;
    logo:FileList;
    answer_url:string;
    keywords:string;
}



const ClientRegistration = () => {
    const [staffPancard, setStaffPancard] = useState({});
    const [clientLogo, setClientLogo] = useState({});
    const[clientlogoStatus,setclientlogoStatus] = useState(false);
    const[panFileStatus,setPanFileStatus] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false)
    const [otp,setOtp] = useState(0)
    const [userOtp,setUserOtp] = useState(0)
    const [showModal, setShowModal] = useState(false);
    const [otpErr,setOtpErr] = useState('')
    const [isOtpErr,setIsOtpErr] = useState(false)
    const [phoneNumberLength, setPhoneNumberLength] = useState(0);
    const [phoneNumberValidation, setPhoneNumberValidation] = useState(true);
    const [phoneNo, setPhoneNo] = useState('')
    const navigate = useNavigate();

    const[errFile,setErrFile] = useState(false);
    const[fileName,setFileName] = useState('')

    usePageTitle({
        title: 'Add Clients',
        breadCrumbItems: [
            {
                path: '/forms/validation',
                label: 'Forms',
            },
            {
                path: '/forms/validation',
                label: 'Validation',
                active: true,
            },
        ],
    });

    const schema = yup.object().shape({
        fullname: yup.string().required('Please enter full name'),
        email: yup.string().required('Please enter email').email('Please enter a valid Email'),
        role: yup.string().required('Please select client role'),
        authid: yup.string().required('Please enter auth id'),
        authtoken: yup.string().required('Please enter auth token'),
        landline_number: yup.string().required('Please enter landline number'),
        answer_url:yup.string().required('Please enter answer url.'),
    });


    const { register, handleSubmit, formState: { errors },setValue } = useForm<IFormInput>({
        resolver: yupResolver(schema),
    });

    const handleVerifyCancel = () => {
        setShowModal(false);
        // setSelectedStaffId(null);
    };

    const handleVerifyOpen = () => {
        setShowModal(true);
    };

    const handelotpchange = (otpno:any)=>{
        if(otpno == '')
        {
            setOtpErr('Please Enter OTP.');
            setIsOtpErr(true);
        }
        else
        {
            setOtpErr('');
            setIsOtpErr(false);
            setUserOtp(parseInt(otpno))
        }
    }

    const handleOTPConfirm = async () => {


        if(userOtp != 0)
        {
            if(otp == userOtp)
            {
                setIsEmailVerified(true)
                handleVerifyCancel();
            }
            else
            {
                setOtpErr('Please Enter valid OTP.');
                setIsOtpErr(true);
            }
        }
        else
        {
            setOtpErr('Please Enter OTP.');
            setIsOtpErr(true);
        }
        
    };

    const handelVerifyEmail = async (emailId:any)=>{
        // console.log(emailId);

        try {
            const bearerToken = secureLocalStorage.getItem('login');
            const response = await fetch(`${url.nodeapipath}/staff/verify/${emailId}`,{
                method:'GET',
                headers: {
                    'Content-Type':'application/json',
                    'Access-Control-Allow-Origin':'*',
                    'Authorization': `Bearer ${bearerToken}`
                    }
            });
            const data = await response.json();
            // console.log(data);
            
            if (response.ok) {
                // setDesignation(data.designation || []);
                // console.log(data);
                
                setOtp(data.otp);
                handleVerifyOpen();
            } else {
                console.error('Error fetching otp:', data);
            }
        } catch (error) {
            console.error('Error during API call:', error);
        }
        
    }

    const handlepancardChange = (e:any)=>{
        // console.log(e.target.files);
        if(e.target.files[0] === undefined || e.target.files[0] === null)
        {
            setPanFileStatus(false);
            setErrFile(true);
            setFileName('pancard')
            
        }
        else
        {
            setPanFileStatus(true);
            setErrFile(false);
            setStaffPancard(e.target.files[0])
        }
    }

    const handleLogoChange = (e:any)=>{
        setclientlogoStatus(false)
        if(e.target.files[0] === undefined || e.target.files[0] === null)
        {
            // setAadharFileStatus(false);
            // setErrFile(true);
            setFileName('logo')
                
        }
        else
        {
            // setAadharFileStatus(true);
            // setErrFile(false);
            setClientLogo(e.target.files[0])
    //         const img = new Image();
    //         img.src = URL.createObjectURL(e.target.files[0]);

    //         img.onload = () => {
    //         console.log({ width: img.width, height: img.height });
    //         if(img.width > 240 || img.height > 70)
    //         {
    //             setclientlogoStatus(true)
    //         }
            
    //         // URL.revokeObjectURL(img.src); // cleanup
    // };
        }
    }

    const logout =()=>{
        secureLocalStorage.removeItem('login');
        secureLocalStorage.removeItem('userData')
        navigate('/auth/login');
    }

    const onSubmit = async (data: IFormInput) => {
        // console.log(data);
        // return;

            // console.log(data);
            // console.log(formData);
            // if(clientlogoStatus != true)
            // {
                const formData = new FormData();
                formData.append('client_name', data.fullname);
                formData.append('client_emailId', data.email);
                formData.append('client_isemailVerified', isEmailVerified.toString());
                formData.append('client_role_type', data.role);
                formData.append('client_authid', data.authid);
                formData.append('client_authtoken', data.authtoken);
                formData.append('client_landline_number', data.landline_number);
                formData.append('client_logo', data.logo[0]);
                formData.append('client_answer_url', data.answer_url);
                formData.append('client_keywords', data.keywords);


                

                try {
                    const bearerToken = secureLocalStorage.getItem('login');
                    const response = await fetch(`${url.nodeapipath}/client`, {
                        body: formData,
                        method: 'POST',
                        headers: {
                            // 'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin':'*',
                            'Authorization': `Bearer ${bearerToken}`
                        },
                        
                    });
                    const result = await response.json();
                    if(response.ok)
                    {
                        // console.log('Registration successful:', result);
                        var toasterMessage = `${result.message}, User email Id: ${result.usesCreatedData.client_email_id} and Password: ${result.usesCreatedData.password}`
                        toast.success( toasterMessage || 'Client added successfully');
                        navigate('/clients')
                    }
                    else
                    {
                        

                        if(response.status == 401 && response.statusText == 'Unauthorized' && result.code == 401)
                        {
                            logout();
                            toast.warning('Session Expired.');
                        }
                        else
                        {
                            toast.error(result.message || 'Failed to Client.');
                        }
                    }
                    
                } catch (error) {
                    // console.error('Error during registration:', error);
                    toast.error(`Error during registration:${error}`);
                }
            // }
            
        
    };



    return (
        <Container>
            <Row className="justify-content-center">
                <Col>
                    <Card className="import-record-card">
                        <Card.Body>
                            <div className='d-flex'>
                                <div className="text-md-end mb-0" style={{width:'100%'}}>
                                    <Button variant="dark" type="reset" onClick={()=>{navigate('/clients')}}>
                                        Back
                                    </Button>
                                </div>
                            </div>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <Row>
                                    <Col md={6}>
                                        <div className="mb-3">
                                            <label htmlFor="fullname" className="form-label">Full Name</label>
                                            <input
                                                type="text"
                                                id="fullname"
                                                placeholder="Enter Full Name"
                                                className="form-control"
                                                {...register('fullname')}
                                            />
                                            {errors.fullname && <div className="invalid-feedback d-block">{errors.fullname.message}</div>}
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="logo" className="form-label">Logo (Size: 240px x 70px)</label>
                                            <input
                                                type="file"
                                                id="aadharcard"
                                                className="form-control"
                                                {...register('logo')}
                                                onChange={(e)=>{handleLogoChange(e)}}

                                            />
                                            {/* {clientlogoStatus && <div className="invalid-feedback d-block">Uploded image is too large</div>} */}
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="authid" className="form-label">Auth Id</label>
                                            <input
                                                type="text"
                                                id="authid"
                                                placeholder="Enter Auth Id"
                                                className="form-control"
                                                {...register('authid')}
                                            />
                                            {errors.authid && <div className="invalid-feedback d-block">{errors.authid.message}</div>}
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="answer_url" className="form-label">Answer URL</label>
                                            <input
                                                type="text"
                                                id="answer_url"
                                                placeholder="Enter Answer URL"
                                                className="form-control"
                                                {...register('answer_url')}
                                            />
                                            {errors.answer_url && <div className="invalid-feedback d-block">{errors.answer_url.message}</div>}
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="Keywords" className="form-label">Keywords</label>
                                            <input
                                                type="text"
                                                id="keywords"
                                                placeholder="Enter Keywords"
                                                className="form-control"
                                                {...register('keywords')}
                                            />
                                        </div>
                                        
                                    </Col>

                                    <Col md={6}>
                                        <div className="mb-3">
                                            <label htmlFor="email" className="form-label">Email</label>
                                            <div className='d-flex'>
                                            <input
                                                type="email"
                                                id="email"
                                                placeholder="Enter Email"
                                                className="form-control"
                                                {...register('email')}
                                                disabled = {(isEmailVerified)?true:false}
                                                // onBlur={async(e)=>{await handelVerifyEmail(e.target.value)}}
                                                // style={{width:'87%'}}
                                            />
                                            {/* {(isEmailVerified)?<span className="badge badge-soft-success pt-2" style={{width:'13%',fontSize: '85%'}}>Verified</span>:<span className="badge badge-soft-danger pt-2" style={{width:'13%',fontSize: '85%'}}>Unverified</span>} */}
                                            </div>
                                            {errors.email && <div className="invalid-feedback d-block">{errors.email.message}</div>}
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="landline_number" className="form-label">Landline Number</label>
                                            <input
                                                type="text"
                                                id="landline_number"
                                                placeholder="Enter Auth Id"
                                                className="form-control"
                                                {...register('landline_number')}
                                            />
                                            {errors.landline_number && <div className="invalid-feedback d-block">{errors.landline_number.message}</div>}
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="authtoken" className="form-label">Auth Token</label>
                                            <input
                                                type="text"
                                                id="authtoken"
                                                placeholder="Enter Auth Id"
                                                className="form-control"
                                                {...register('authtoken')}
                                            />
                                            {errors.authtoken && <div className="invalid-feedback d-block">{errors.authtoken.message}</div>}
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="role" className="form-label">Role</label>
                                            <select
                                                id="role"
                                                className="form-control"
                                                {...register('role')}
                                            >
                                                <option value="">Select Role</option>
                                                <option value="0">Super User</option>
                                                <option value="1">Client</option>
                                            </select>
                                            {errors.role && <div className="invalid-feedback d-block">{errors.role.message}</div>}
                                        </div>
                                    </Col>
                                </Row>

                                <div className="text-md-end mb-0">
                                    <Button variant="primary" className="me-1" type="submit">
                                        Submit
                                    </Button>
                                    <Button variant="secondary" type="reset">
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </Card.Body>
                    </Card>
                </Col>
            <ToastContainer />
            <Modal show={showModal} onHide={handleVerifyCancel} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Verify OTP</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <label htmlFor="OTP" className="form-label">Enter OTP For Verification</label>
                            <input
                                type="text"
                                id="otp"
                                placeholder="Enter OTP"
                                className="form-control"
                                onChange={(e)=>{handelotpchange(e.target.value)}}
                            />
                            {(isOtpErr) && <div className="invalid-feedback d-block">{otpErr}</div>}
                    </div></Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleVerifyCancel}>
                        Cancel
                    </Button>
                    <Button variant="success" onClick={handleOTPConfirm}>
                        Verify
                    </Button>
                </Modal.Footer>
            </Modal>
            </Row>
        </Container>
        
    );
};

export default ClientRegistration;