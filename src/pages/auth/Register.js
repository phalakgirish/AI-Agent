import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button, Alert, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import url from '../../env'; // Adjust the import according to your project structure

// actions
import { resetAuth, signupUser } from '../../redux/actions';

// components
import Loader from '../../components/Loader';
import AuthLayout from './AuthLayout';

const BottomLink = () => {
    const { t } = useTranslation();

    return (
        <Row className="mt-3">
            <Col xs={12} className="text-center">
                <p className="text-muted">
                    {t('Already have an account?')}{' '}
                    <Link to={'/auth/login'} className="text-dark fw--medium ms-1">
                        <b>{t('Sign In')}</b>
                    </Link>
                </p>
            </Col>
        </Row>
    );
};

const Register = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { loading, userSignUp, error } = useSelector(state => ({
        loading: state.Auth.loading,
        error: state.Auth.error,
        userSignUp: state.Auth.userSignUp,
    }));

    const { register, handleSubmit, formState: { errors }, watch } = useForm({
        resolver: yupResolver(
            yup.object().shape({
                fullname: yup.string().required(t('Please enter Fullname')),
                email: yup.string().required(t('Please enter Email')).email(t('Please enter a valid Email')),
                password: yup.string().required(t('Please enter Password')),
                dob: yup.string().required(t('Please enter Date of Birth')),
                mobile_number: yup.string().required(t('Please enter Mobile Number')),
                gender: yup.string().required(t('Please select Gender')),
                pancard: yup.mixed().required(t('Please upload PAN Card')),
                aadharcard: yup.mixed().required(t('Please upload Aadhar Card')),
                department: yup.string().required(t('Please enter Department')),
                designation: yup.string().required(t('Please enter Designation')),
                branch: yup.string().required(t('Please enter Branch')),
                doj: yup.string().required(t('Please enter Date of Joining')),
                checkboxsignup: yup.bool().oneOf([true], t('Must accept Terms and Conditions')),
            })
        ),
    });

    const onSubmit = async (data) => {
        console.log(data);
    
        const formData = new FormData();
        formData.append('staff_name', data.fullname);
        formData.append('staff_dob', data.dob);
        formData.append('staff_password', data.password);
        formData.append('staff_mobile_number', data.mobile_number);
        formData.append('staff_emailId', data.email);
        formData.append('staff_gender', data.gender);
        formData.append('staff_pancard', data.pancard[0]);
        formData.append('staff_addharcard', data.aadharcard[0]);
        formData.append('staff_department', data.department);
        formData.append('staff_designation', data.designation);
        formData.append('staff_branch', data.branch);
        formData.append('staff_doj', data.doj);
        formData.append('staff_role_type', 'superadmin');
    
        // Log FormData entries
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }
    
        try {
            const response = await fetch(`${url.nodeapipath}/staff/`, {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            console.log('pppppppppppppp', result);
    
            if (result.success) {
                dispatch(signupUser(data.fullname, data.email, data.password));
            } else {
                throw new Error(result.message || 'Failed to sign up');
            }
        } catch (error) {
            console.error('Error during signup:', error);
            dispatch({ type: 'SIGNUP_FAILURE', payload: error.message });
        }
    };
    

    // useEffect(() => {
    //     dispatch(resetAuth());
    // }, [dispatch]);

    if (userSignUp) {
        return <Navigate to={'/auth/confirm'} replace />;
    }

    return (
        <AuthLayout bottomLinks={<BottomLink />}>
            <div className="text-center mb-4">
                <h4 className="text-uppercase mt-0">{t('Register')}</h4>
            </div>

            {error && (
                <Alert variant="danger" className="my-2">
                    {error}
                </Alert>
            )}

            {loading && <Loader />}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                    <label htmlFor="fullname" className="form-label">{t('Fullname')}</label>
                    <input
                        type="text"
                        id="fullname"
                        className="form-control"
                        {...register('fullname')}
                    />
                    {errors.fullname && <div className="invalid-feedback d-block">{errors.fullname.message}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="email" className="form-label">{t('Email')}</label>
                    <input
                        type="email"
                        id="email"
                        className="form-control"
                        {...register('email')}
                    />
                    {errors.email && <div className="invalid-feedback d-block">{errors.email.message}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label">{t('Password')}</label>
                    <input
                        type="password"
                        id="password"
                        className="form-control"
                        {...register('password')}
                    />
                    {errors.password && <div className="invalid-feedback d-block">{errors.password.message}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="dob" className="form-label">{t('Date of Birth')}</label>
                    <input
                        type="date"
                        id="dob"
                        className="form-control"
                        {...register('dob')}
                    />
                    {errors.dob && <div className="invalid-feedback d-block">{errors.dob.message}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="mobile_number" className="form-label">{t('Mobile Number')}</label>
                    <input
                        type="text"
                        id="mobile_number"
                        className="form-control"
                        {...register('mobile_number')}
                    />
                    {errors.mobile_number && <div className="invalid-feedback d-block">{errors.mobile_number.message}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="gender" className="form-label">{t('Gender')}</label>
                    <select
                        id="gender"
                        className="form-control"
                        {...register('gender')}
                    >
                        <option value="">{t('Select Gender')}</option>
                        <option value="male">{t('Male')}</option>
                        <option value="female">{t('Female')}</option>
                        <option value="other">{t('Other')}</option>
                    </select>
                    {errors.gender && <div className="invalid-feedback d-block">{errors.gender.message}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="pancard" className="form-label">{t('PAN Card')}</label>
                    <input
                        type="file"
                        id="pancard"
                        className="form-control"
                        {...register('pancard')}
                    />
                    {errors.pancard && <div className="invalid-feedback d-block">{errors.pancard.message}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="aadharcard" className="form-label">{t('Aadhar Card')}</label>
                    <input
                        type="file"
                        id="aadharcard"
                        className="form-control"
                        {...register('aadharcard')}
                    />
                    {errors.aadharcard && <div className="invalid-feedback d-block">{errors.aadharcard.message}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="department" className="form-label">{t('Department')}</label>
                    <input
                        type="text"
                        id="department"
                        className="form-control"
                        {...register('department')}
                    />
                    {errors.department && <div className="invalid-feedback d-block">{errors.department.message}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="designation" className="form-label">{t('Designation')}</label>
                    <input
                        type="text"
                        id="designation"
                        className="form-control"
                        {...register('designation')}
                    />
                    {errors.designation && <div className="invalid-feedback d-block">{errors.designation.message}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="branch" className="form-label">{t('Branch')}</label>
                    <input
                        type="text"
                        id="branch"
                        className="form-control"
                        {...register('branch')}
                    />
                    {errors.branch && <div className="invalid-feedback d-block">{errors.branch.message}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="doj" className="form-label">{t('Date of Joining')}</label>
                    <input
                        type="date"
                        id="doj"
                        className="form-control"
                        {...register('doj')}
                    />
                    {errors.doj && <div className="invalid-feedback d-block">{errors.doj.message}</div>}
                </div>

                <div className="mb-3">
                    <div className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="checkboxsignup"
                            {...register('checkboxsignup')}
                        />
                        <label className="form-check-label" htmlFor="checkboxsignup">
                            {t('I accept')} <Link to="#" className="text-dark">{t('Terms and Conditions')}</Link>
                        </label>
                        {errors.checkboxsignup && <div className="invalid-feedback d-block">{errors.checkboxsignup.message}</div>}
                    </div>
                </div>

                <div className="mb-3 text-center">
                    <Button variant="primary" type="submit" disabled={loading}>
                        {t('Sign Up')}
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
};

export default Register;
