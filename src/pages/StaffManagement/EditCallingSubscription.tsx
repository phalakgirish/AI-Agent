import { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Form, FormText } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import jsPDF from 'jspdf'; // To generate PDF
import url from '../../env';
// hooks
import { usePageTitle } from '../../hooks';
import secureLocalStorage from 'react-secure-storage';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import moment from 'moment';
import { Typeahead } from 'react-bootstrap-typeahead';

// Define types
type subscriptionData = {
    client_sub_id:string;
    client_id: string;
    client_allocated_minutes:number;
    client_subscription_date: string;
    client_subscription_remarks:string;
};



type Option = string | Record<string, any>;

// Define the type for Client data
type client = {
    _id: string;
    client_id: string;
    client_name: string
};




// Validation schema
const schema = yup.object().shape({
    client_id: yup.string().required('Select client'),
    client_allocated_minutes: yup.number().required(' Allocated min. is required').min(1,'Allocated min. is greater than 0'),
});

const CallingSubscriptionForm = () => {
    const StorageuserData:any = secureLocalStorage.getItem('userData');
    const userData:any = JSON.parse(StorageuserData);
    
    const { id } = useParams<{ id: string }>();
    const [clients, setClients] = useState<client[]>([]);
    const [clientbranch, setClientBranch] = useState('');
    const [branchErr,setBranchErr] = useState(false);
    const navigate = useNavigate();
    const [clientName,setClientName] = useState('');
    const [client_id,setClient_id] = useState('')
    const [singleSelections, setSingleSelections] = useState<Option[]>([]);
    const [todayDate,setTodayDate] = useState<Date>()
    const [expirationDate,setExpirationDate] = useState<Date>()
    // const [sipmember_month,setSipmember_month] = useState('')
    // var today = new Date();
    // var TodayDate = today.toISOString().split('T')[0];
    // var expiration = new Date(today.setDate(365))
    // var ExpirationDate = expiration.toISOString().split('T')[0];

    const { control, handleSubmit, reset,formState: { errors }, setValue } = useForm<subscriptionData>({
        resolver: yupResolver(schema),
    });
    var Months = [{value:'January',lable:'January'},
        {value:'February',lable:'February'},
        {value:'March',lable:'March'},
        {value:'April',lable:'April'},
        {value:'May',lable:'May'},
        {value:'June',lable:'June'},
        {value:'July',lable:'July'},
        {value:'August',lable:'August'},
        {value:'September',lable:'September'},
        {value:'October',lable:'October'},
        {value:'November',lable:'November'},
        {value:'December',lable:'December'}
    ]

    const logout =()=>{
        secureLocalStorage.removeItem('login');
        secureLocalStorage.removeItem('userData')
        navigate('/auth/login');
    }
    
    const toDatetimeLocal = (date:any) => {
        if (!date) return '';
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // adjust to local
        return d.toISOString().slice(0, 16);
    }

    const onSubmit = async(formData: subscriptionData) => {
        // console.log('Form data:', formData);



            var dataToPost = {
                client_sub_id:formData.client_sub_id,
                client_id: formData.client_id,
                client_name: clientName,
                client_allocated_minutes: formData.client_allocated_minutes,
                client_subscription_date: formData.client_subscription_date,
                client_subscription_remarks: (formData.client_subscription_remarks)?formData.client_subscription_remarks:'',
            }

            try {
                const bearerToken = secureLocalStorage.getItem('login');
                const response = await fetch(`${url.nodeapipath}/calling-subscription/${id}`, {
                    body: JSON.stringify(dataToPost),
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin':'*',
                        'Authorization': `Bearer ${bearerToken}`
                    },
                    
                });
                const result = await response.json();
                if(response.ok)
                {   
                    // generatePDF(result.sipPaymentReciept[0]);
                    toast.success(result.message || 'subscription Updated Successfully.')
                    navigate('/all-subscription')
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
                        toast.error(result.message || 'Failed To update subscription.')
                    }
                    
                }
                
            } catch (error) {
                // console.error('Error during Payment:', error);
                toast.error('Error updating subscription');
            }        
    };

    useEffect(()=>{
        const bearerToken = secureLocalStorage.getItem('login');
        // Fetch branches from the backend
        var clientsData:any
        const fetchClients = async () => {
            try {
                const bearerToken = secureLocalStorage.getItem('login');
                const response = await fetch(`${url.nodeapipath}/client`,{
                    method:'GET',
                    headers: {
                        'Content-Type':'application/json',
                        'Access-Control-Allow-Origin':'*',
                        'Authorization': `Bearer ${bearerToken}`
                        }
                });

                const data = await response.json();

                clientsData = data.client
                if (response.ok) {
                    setClients(data.client || []);

                } else {
                    if(response.status == 401 && response.statusText == 'Unauthorized' && data.code == 401)
                    {
                        logout();
                        toast.warning('Session Expired.');
                        
                    }
                    else
                    {
                        console.error('Error fetching branches:', data);
                    }
                    
                }
            } catch (error) {
                console.error('Error during API call:', error);
            }
        };

        // fetchClients();

        const fetchSubscriptionData = async ()=>{
            const response = await fetch(`${url.nodeapipath}/calling-subscription/${id}`,{
            method:'GET',
                headers: {
                    'Content-Type':'application/json',
                    'Access-Control-Allow-Origin':'*',
                    'Authorization': `Bearer ${bearerToken}`
                    }
            });


            const data = await response.json();
            // console.log(data);
            if(response.ok)
            {
                if (data && data.client_sub ) {
                const subscription_data = data.client_sub; // Access the first element in the branch array
                        
                // Set form values using branchData
                await fetchClients();
                var clientname = await clientsData.filter((item:any)=> item._id == subscription_data.client_id)
                setSingleSelections([{value:subscription_data.client_id,label:`${clientname[0].client_id}-${clientname[0].client_name}`}])
        
                for (const key in subscription_data) {
                    if (subscription_data.hasOwnProperty(key)) {
                        setValue(key as keyof subscriptionData, subscription_data[key]);
                    }
                }
                var todays_date = toDatetimeLocal(subscription_data.client_subscription_date)
                setValue('client_subscription_date',todays_date)
                // setReceivedDate(refSchPaymentData.ref_payment_receivedDate.split('T')[0])
                // setExpiredDate(refSchPaymentData.ref_payment_expirationDate.split('T')[0])
                setClientName(clientname[0].client_name)
                } else {
                    throw new Error('Subscription data is empty or invalid');
                } 
            }
            else
            {
                if(response.status == 401 && response.statusText == 'Unauthorized' && data.code == 401)
                {
                    logout();
                    toast.warning('Session Expired.');  
                }
            }
                     
        }
        fetchSubscriptionData();

    },[])




    const handleClientChange = (e:any)=>{
        setSingleSelections(e)
        if(e.length>0)
        {
            var clientname = clients.filter((item)=> item._id == e[0].value)
            setClientName(clientname[0].client_name);
            setValue('client_id',e[0].value);
        }
        else
        {
            setClientName('');
            setValue('client_id','');

        }
    }



    

    return (
        <Card>
            <Card.Body>
                <div className='d-flex'>
                    <div className="text-md-end mb-0" style={{width:'100%'}}>
                        <Button variant="dark" type="reset" onClick={()=>{navigate('/all-subscription')}}>
                            Back
                        </Button>
                    </div>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label> Subscription Id.</Form.Label>
                                <Controller
                                    name="client_sub_id"
                                    control={control}
                                    render={({ field }) => <Form.Control {...field} placeholder="Enter Payment Ref. No." disabled={true}/>}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label>Client ID</Form.Label>
                                <Controller
                                    name="client_id"
                                    control={control}
                                    render={({ field }) => (
                                    // <Form.Select
                                    // {...field}
                                    // isInvalid={!!errors.client_id}
                                    // onChange={(e)=>{field.onChange(e.target.value); handleClientChange(e)}}
                                    // >
                                    //     <option>Select Client</option>
                                    //     {clients.map((client) => (
                                    //          <option key={client._id} value={client._id}>
                                    //              {`${client.client_id}, ${client.client_name}`}
                                    //          </option>
                                    //          ))}
                                    // </Form.Select>
                                    <Typeahead
                                    id="select2"
                                    labelKey={'label'}
                                    {...field}
                                    multiple={false}
                                    isInvalid={!!errors.client_id}
                                    // {...register('client_id')}
                                    onChange={(e)=>{handleClientChange(e)}}
                                    options={clients.map((client:any) => (
                                        {value:`${client._id}`,label:`${client.client_id}-${client.client_name}`}
                                    ))}
                                    placeholder="select Client"
                                    selected={singleSelections}
                                />
                                    )}
                                />
                                {errors.client_id && <div className="invalid-feedback d-block">{errors.client_id.message}</div>}
                                {/* <Form.Control.Feedback type="invalid">
                                    {errors.client_id?.message}
                                </Form.Control.Feedback> */}
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label>Client Name</Form.Label>
                                <Form.Control placeholder="Enter Name" value={clientName} disabled={true}/>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label>Allocated Minutes</Form.Label>
                                <Controller
                                    name="client_allocated_minutes"
                                    control={control}
                                    defaultValue={0}
                                    rules={{
                                        min: { value: 1, message: "Minutes must be greater than 0" } // Additional validation rule
                                    }}
                                    render={({ field }) => <Form.Control type="number" {...field} value={field.value || ''} onChange={(e)=>{field.onChange(e.target.value)}} isInvalid={!!errors.client_allocated_minutes} placeholder="Enter Allocated Minutes" />}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.client_allocated_minutes?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                     <Row>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label>Subscription Date</Form.Label>
                                <Controller
                                    name="client_subscription_date"
                                    control={control}
                                    // defaultValue={todayDate}
                                    render={({ field }) => <Form.Control type="datetime-local" {...field} onChange={(e)=>{field.onChange(e.target.value);}} />}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label>Remark</Form.Label>
                                    <Controller
                                        name="client_subscription_remarks"
                                        control={control}
                                        render={({ field }) => <Form.Control type="text" {...field} value={field.value || ''} onChange={(e)=>{field.onChange(e.target.value)}} placeholder="Enter Allocated Minutes" />}
                                    />
                                </Form.Group>
                            </Col>
                    </Row>
                    <div className="text-md-end mb-0">
                        <Button variant="primary" className="me-1" type="submit">
                            Save
                        </Button>
                        <Button variant="secondary" type="button" onClick={() => reset()}>
                            Reset
                        </Button>
                    </div>
                </form>
            </Card.Body>
        </Card>
    );
};

const EditCallingSubscription = () => {
    usePageTitle({
        title: 'Reference Scheme Payment',
        breadCrumbItems: [
            {
                path: '/forms/payment-receipt',
                label: 'Forms',
            },
            {
                path: '/forms/payment-receipt',
                label: 'Payment Receipt',
                active: true,
            },
        ],
    });

    return (
        <>
            <Row style={{ marginTop: '25px' }}>
                <Col lg={12}>
                    <CallingSubscriptionForm />
                </Col>
            </Row>
        </>
    );
};

export default EditCallingSubscription;
