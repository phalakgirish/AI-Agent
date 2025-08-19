import { Card, Col, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';

// hooks
import { usePageTitle } from '../../../hooks';

// component
import Statistics from './Statistics';
import SalesChart from './SalesChart';
import StatisticsChart from './StatisticsChart';
import RevenueChart from './RevenueChart';
import Users from './Users';
import Inbox from './Inbox';
import Projects from './Projects';
import url from '../../../env';
import Spinner from '../../../components/Spinner';

// dummy data
import { messages, projectDetails } from './data';
import secureLocalStorage from 'react-secure-storage';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ExpiringScheme from './ExpiringScheme';
import { Link } from 'react-router-dom';
import Table from '../../../components/Table';

const DashBoard1 = () => {
    // set pagetitle
    const navigate = useNavigate();
    const [totalClient, setTotalClient] = useState(0)
    const [totalCalls, setTotalCalls] = useState(0) 
    const [totalTodayCalls, setTotalTodayCalls] = useState(0)
    const [totalAnswerdCalls, setTotalAnswerdCalls] = useState(0) 
    const [totalTodayAnsweredCalls, setTotalTodayAnsweredCalls] = useState(0)
    const StorageuserData:any = secureLocalStorage.getItem('userData');
    var usersData:any = JSON.parse(StorageuserData) || null
    const [role, setRole] = useState((usersData != null)? usersData.user_role_type.toString():'')
    const [isSpinner,setIsSpinner] = useState(false)
    const [consumptionDetails,setConsumptionDetails] = useState([])
    const [hotLeads,setHotLeads] = useState(0)
    const [todayHotLeads,setTodayHotLeads] = useState(0)
    const [totalMin,setTotalMin] = useState(0)
    const [totalAvailableMin,setTotalAvailableMin] = useState(0)

    const [consumedMin,setConsumedMin] = useState(0)
    const [remainingMin,setRemainingMin] = useState(0)


    // console.log(role);
    
    useEffect(()=>{
    
    let loginvalue = secureLocalStorage.getItem('login');
    let StorageuserData:any = secureLocalStorage.getItem('userData');
    if(loginvalue == null || loginvalue == undefined)
    {
        navigate('/auth/login');
    }
    else if(StorageuserData == null || StorageuserData == undefined)
    {
        navigate('/auth/login');
    }
    },[])

    const [data,setData] = useState<any>([]);

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
    }

    const logout =()=>{
        secureLocalStorage.removeItem('login');
        secureLocalStorage.removeItem('userData')
        navigate('/auth/login');
    }

    useEffect(()=>{
            const bearerToken = secureLocalStorage.getItem('login');
            const StorageUserData:any = secureLocalStorage.getItem('userData');
            const userData:any = JSON.parse(StorageUserData)
            
            // if(userData.user_role_type)
            
            if(userData == null) return;
            const fetchuser = async()=>{
                try {
                    const response = await fetch(`${url.nodeapipath}/client`,{
                        method:'GET',
                        headers: {
                            'Content-Type':'application/json',
                            'Access-Control-Allow-Origin':'*',
                            'Authorization': `Bearer ${bearerToken}`
                            }
                    });
                    const data = await response.json();  
                    
                    if (response.ok) {
                        setTotalClient(data.client.length)
                            
                    } else {
                        // console.error('Error fetching Clients:', data);
                        if(response.status == 401 && response.statusText == 'Unauthorized' && data.code == 401)
                        {
                            toast.warning('Session Expired.');
                            logout();
                        }
                        // console.log(response);
                        
                    }
                } catch (error) {
                    console.error('Error during API call:', error);
                }
            }
            fetchuser()
            const fetchTotalCall = async()=>{
                try {
                    setIsSpinner(true)
                    let queryString = ''
                    if(userData.user_role_type != 0)
                    {
                        queryString = `client_id=${userData.client_id}`
                    }
                    
                    // const response = await fetch(`${url.plivoapipath}/${userData.client_authid}/Call?${queryString}`,{
                    //     method:'GET',
                    //     headers: {
                    //         'Content-Type':'application/json',
                    //         'Access-Control-Allow-Origin':'*',
                    //         'Authorization': 'Basic ' + btoa(`${userData.client_authid}:${userData.client_authtoken}`),
                    //         }
                    // });

                    const response = await fetch(`${url.nodeapipath}/conversation?${queryString}`, {
                        method: 'GET',
                        headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Authorization': `Bearer ${bearerToken}`
                        },
                    });
                    const data = await response.json();
                    
                    if (response.ok) {
                        var answeredcall = data.conversation_details.map((item:any)=> item.call_state == 'ANSWER')
                        setTotalCalls(data.conversation_details_count)
                        setTotalAnswerdCalls(answeredcall.length)
                        var hot_calls = data.conversation_details.filter((item:any)=> item.call_lead == true)
                        setHotLeads(hot_calls.length)
                        setIsSpinner(false)    
                    } else {
                        // console.error('Error fetching branches:', data);
                        if(response.status == 401 && response.statusText == 'Unauthorized' && data.code == 401)
                        {
                            toast.warning('Session Expired.');
                            logout();
                        }
                    }
                } catch (error) {
                    console.error('Error during API call:', error);
                }
            }
            fetchTotalCall()
            const fetchTotalTodaysCall = async()=>{
                try {
                    var todayDate = new Date()
                    todayDate.setMinutes(todayDate.getMinutes()+330)
                    var todays_Date = (todayDate.toISOString()).split('T')
                    let fromDate = `${todays_Date[0]} 00:00`
                    let toDate = `${todays_Date[0]} 23:59`
                    
                    let queryString:any = ''

                    if(userData.user_role_type != 0)
                    {
                        queryString = `client_id=${userData.client_id}`
                    }


                    // const response = await fetch(`${url.plivoapipath}/${userData.client_authid}/Call?${queryString}`,{
                    //     method:'GET',
                    //     headers: {
                    //         'Content-Type':'application/json',
                    //         'Access-Control-Allow-Origin':'*',
                    //         'Authorization': 'Basic ' + btoa(`${userData.client_authid}:${userData.client_authtoken}`),
                    //         }
                    // });

                    const response = await fetch(`${url.nodeapipath}/conversation/all/todays?${queryString}`, {
                        method: 'GET',
                        headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Authorization': `Bearer ${bearerToken}`
                        },
                    });
                    const data = await response.json(); 
                    
                    if (response.ok) {
                        var hot_calls = data.conversation_details.filter((item:any)=> item.call_lead == true)
                        setTodayHotLeads(hot_calls.length)
                        setTotalTodayCalls(data.conversation_details_count)
                            
                    } else {
                        // console.error('Error fetching branches:', data);
                    }
                } catch (error) {
                    console.error('Error during API call:', error);
                }
            }
            fetchTotalTodaysCall()
            const fetchClientMinutesConsumption = async()=>{
                try {
                    var todayDate = new Date()
                    todayDate.setMinutes(todayDate.getMinutes()+330)
                    var todays_Date = (todayDate.toISOString()).split('T')
                    let fromDate = `${todays_Date[0]} 00:00`
                    let toDate = `${todays_Date[0]} 23:59`
                    
                    let queryString:any = ''

                    if(userData.user_role_type != 0)
                    {
                        queryString = `client_id=${userData.client_id}`
                    }


                    // const response = await fetch(`${url.plivoapipath}/${userData.client_authid}/Call?${queryString}`,{
                    //     method:'GET',
                    //     headers: {
                    //         'Content-Type':'application/json',
                    //         'Access-Control-Allow-Origin':'*',
                    //         'Authorization': 'Basic ' + btoa(`${userData.client_authid}:${userData.client_authtoken}`),
                    //         }
                    // });

                    const response = await fetch(`${url.nodeapipath}/client/all/client-consumption`, {
                        method: 'GET',
                        headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Authorization': `Bearer ${bearerToken}`
                        },
                    });
                    const data = await response.json(); 
                    
                    if (response.ok) {

                        var formatedDate = data.client_consumptionDetails.map((val:any,index:any)=>({
                            srNo:index+1,
                            client_id:val.client_id,
                            client_name:val.client_name,
                            client_allocated_minutes:val.client_allocated_minutes,
                            client_available_minutes:val.client_total_avaialble_minutes,
                            client_consumed_minutes:val.client_consumed_minutes,
                            client_remaning_minutes:val.client_remaning_minutes,
                            client_consumed_per:(val.client_allocated_minutes == 0)?0:((val.client_consumed_minutes/val.client_allocated_minutes)*100).toFixed(2)
                    }))
                        // console.log(data);
                    setConsumptionDetails(formatedDate)
                        
                            
                    } else {
                        // console.error('Error fetching branches:', data);
                        if(response.status == 401 && response.statusText == 'Unauthorized' && data.code == 401)
                        {
                            // toast.error('Session Expired.');
                            // logout();
                        }
                    }
                } catch (error) {
                    console.error('Error during API call:', error);
                }
            }
            fetchClientMinutesConsumption()

            const fetchMinutesConsumption = async()=>{
                try {
                    var todayDate = new Date()
                    todayDate.setMinutes(todayDate.getMinutes()+330)
                    var todays_Date = (todayDate.toISOString()).split('T')
                    let fromDate = `${todays_Date[0]} 00:00`
                    let toDate = `${todays_Date[0]} 23:59`
                    
                    let queryString:any = ''

                    if(userData.user_role_type != 0)
                    {
                        queryString = `client_id=${userData.client_id}`
                    }


                    // const response = await fetch(`${url.plivoapipath}/${userData.client_authid}/Call?${queryString}`,{
                    //     method:'GET',
                    //     headers: {
                    //         'Content-Type':'application/json',
                    //         'Access-Control-Allow-Origin':'*',
                    //         'Authorization': 'Basic ' + btoa(`${userData.client_authid}:${userData.client_authtoken}`),
                    //         }
                    // });

                    const response = await fetch(`${url.nodeapipath}/client/all/clientwise/${userData.client_id}`, {
                        method: 'GET',
                        headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Authorization': `Bearer ${bearerToken}`
                        },
                    });
                    const data = await response.json(); 
                    
                    if (response.ok) {
                        // console.log(data);
                    // setConsumptionDetails(formatedDate)
                        setTotalMin(data.client_consumptionDetails.client_allocated_minutes)
                        setConsumedMin(data.client_consumptionDetails.client_consumed_minutes)
                        setRemainingMin(data.client_consumptionDetails.client_remaning_minutes)
                        setTotalAvailableMin(data.client_consumptionDetails.client_total_avaialble_minutes)


                            
                    } else {
                        // console.error('Error fetching branches:', data);
                        if(response.status == 401 && response.statusText == 'Unauthorized' && data.code == 401)
                        {
                            // toast.error('Session Expired.');
                            // logout();
                        }
                    }
                } catch (error) {
                    console.error('Error during API call:', error);
                }
            }
            fetchMinutesConsumption()
        },[])
    

    usePageTitle({
        title: 'DashBoard',
        breadCrumbItems: [
            {
                path: '/dashboard',
                label: 'DashBoard',
                active: true,
            },
        ],
    });

    const sizePerPageList = [
        { text: '5', value: 5 },
        { text: '10', value: 10 },
        { text: '25', value: 25 },
        { text: 'All', value: consumptionDetails.length },
    ];

    const columns = [
        {
            Header: 'Sr. No',
            accessor: 'srNo',
            sort: true,
        },
        {
            Header: 'Client Id',
            accessor: 'client_id',
            sort: true,
        },
        {
            Header: 'Client Name',
            accessor: 'client_name',
            sort: true,
        },
        {
            Header: 'New Allocated Minutes',
            accessor: 'client_allocated_minutes',
            sort: true,
        },
        {
            Header: 'Available Minutes',
            accessor: 'client_available_minutes',
            sort: true,
        },
        {
            Header: 'Consumed Minutes',
            accessor: 'client_consumed_minutes',
            sort: true,
        },
        {
            Header: 'Remaning Minutes',
            accessor: 'client_remaning_minutes',
            sort: true,
        },
        {
            Header: 'Consumed Minutes Per.(%)',
            accessor: 'client_consumed_per',
            sort: true,
        },
    ];

    return (
        <>
        {/* <h1 style={{ color: 'white' }}>Dashboard</h1> */}

            {/* <Statistics /> */}

            {/* <Row>
                <Col xl={3}>
                <Card>
                    <Card.Body>
                        <h4 className="header-title  mt-0 mb-2">This Month Member</h4>
                        {(data.length > 0)?
                            <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                                {data.length}
                            </div>
                            
                        :<div className="d-flex justify-content-center dashboard-scheme-not-found-wrapper">
                            0
                        </div> }   
                    </Card.Body>
                </Card>
                </Col>
                 <Col xl={3}>
                    <StatisticsChart />
                </Col>
                <Col xl={3}>
                    <RevenueChart />
                </Col>
                <Col xl={3}>
                    <RevenueChart />
                </Col>
                <ToastContainer />
            </Row> */}

            {/* <Users /> */}
            <ToastContainer />
            <Row className='dashobard-card-row'>
                {/* <Col xl={4}>
                    <Inbox messages={messages} />
                </Col> */}
                {
                ( role == '0')?<Col xl={4}>
                <Link to={'#'}>
                    <Card className='dashboar-card'>
                        <Card.Body>
                            <h4 className="header-title  mt-0 mb-2">Total Clients</h4>
                            {(isSpinner)?
                            <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                                <Spinner key={'1'} className="m-2" color={'secondary'} type="bordered" size="md"/>
                            </div>:
                            (totalClient > 0)?
                                <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                                    {totalClient}
                                </div>   
                            :<div className="d-flex justify-content-center dashboard-scheme-not-found-wrapper">
                                0
                            </div> }   
                        </Card.Body>
                    </Card>
                </Link>
                </Col>:''}
                <Col xl={4}>
                    <Link to={'/all-conversationlist'}>
                        <Card className='dashboar-card'>
                            <Card.Body>
                                <h4 className="header-title  mt-0 mb-2">Total Calls</h4>
                                {(isSpinner)?
                                <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                                    <Spinner key={'1'} className="m-2" color={'secondary'} type="bordered" size="md"/>
                                </div>:
                                (totalCalls > 0)?
                                    <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                                        {totalCalls}
                                    </div>
                                    
                                :<div className="d-flex justify-content-center dashboard-scheme-not-found-wrapper">
                                    0
                                </div> }   
                            </Card.Body>
                        </Card>
                    </Link>
                </Col>
                {/* <Col xl={3}>
                    <Link to={'/all-conversationlist'}>
                        <Card className='dashboar-card'>
                            <Card.Body>
                                <h4 className="header-title  mt-0 mb-2">Total Answered Calls</h4>
                                {(isSpinner)?
                                <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                                    <Spinner key={'1'} className="m-2" color={'secondary'} type="bordered" size="md"/>
                                </div>:
                                (totalCalls > 0)?
                                    <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                                        {totalAnswerdCalls}
                                    </div>
                                    
                                :<div className="d-flex justify-content-center dashboard-scheme-not-found-wrapper">
                                    0
                                </div> }   
                            </Card.Body>
                        </Card>
                    </Link>
                </Col> */}
                <Col xl={4}>
                    <Link to={'/todays-conversationlist'}>
                        <Card className='dashboar-card'>
                            <Card.Body>
                                <h4 className="header-title  mt-0 mb-2">Today's Total Call</h4>
                                {(isSpinner)?
                                <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                                    <Spinner key={'1'} className="m-2" color={'secondary'} type="bordered" size="md"/>
                                </div>:
                                (totalTodayCalls > 0)?
                                    <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                                        {totalTodayCalls}
                                    </div>
                                    
                                :<div className="d-flex justify-content-center dashboard-scheme-not-found-wrapper">
                                    0
                                </div> }   
                            </Card.Body>
                        </Card>
                    </Link>
                </Col>
                {
                ( role != '0')?<Col xl={4}>
                    <Link to={'/all-conversationhotlist'}>
                        <Card className='dashboar-card'>
                            <Card.Body>
                                <h4 className="header-title  mt-0 mb-2">Total Hot Leads</h4>
                                {(isSpinner)?
                                    <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                                        <Spinner key={'1'} className="m-2" color={'secondary'} type="bordered" size="md"/>
                                    </div>:
                                    (hotLeads > 0)?
                                        <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                                            {hotLeads}
                                        </div>   
                                    :<div className="d-flex justify-content-center dashboard-scheme-not-found-wrapper">
                                        0
                                </div> }   
                            </Card.Body>
                        </Card>
                    </Link>
                </Col>:''}
            </Row>
            {( role != '0')?
                <>
                    <Row className='dashobard-card-row'>
                        <Col xl={4}>
                            <Link to={'/todays-conversationhotlist'}>
                                <Card className='dashboar-card'>
                                    <Card.Body>
                                        <h4 className="header-title  mt-0 mb-2">Toady's Hot Leads</h4>
                                        {(isSpinner)?
                                        <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                                            <Spinner key={'1'} className="m-2" color={'secondary'} type="bordered" size="md"/>
                                        </div>:
                                        (todayHotLeads > 0)?
                                            <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                                                {todayHotLeads}
                                            </div>   
                                        :<div className="d-flex justify-content-center dashboard-scheme-not-found-wrapper">
                                            0
                                        </div> }   
                                    </Card.Body>
                                </Card>
                            </Link>
                        </Col>
                        <Col xl={4}>
                            <Link to={'#'}>
                                <Card className='dashboar-card'>
                                    <Card.Body>
                                        <h4 className="header-title  mt-0 mb-2"> New Allocated Minutes</h4>
                                        {(isSpinner)?
                                        <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                                            <Spinner key={'1'} className="m-2" color={'secondary'} type="bordered" size="md"/>
                                        </div>:
                                        ( totalMin > 0)?
                                            <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                                                {totalMin}
                                            </div>   
                                        :<div className="d-flex justify-content-center dashboard-scheme-not-found-wrapper">
                                            0
                                        </div> }   
                                    </Card.Body>
                                </Card>
                            </Link>
                        </Col>
                        <Col xl={4}>
                            <Link to={'#'}>
                                <Card className='dashboar-card'>
                                    <Card.Body>
                                        <h4 className="header-title  mt-0 mb-2"> Available Minutes
                                            &nbsp;<OverlayTrigger
                                                key={'info-right'}
                                                placement={'right'}
                                                overlay={
                                                <Tooltip id={`tooltip-${'right'}`}>
                                                    Previous Remaining Min. + New Allocated Min.
                                                </Tooltip>
                                            }
                                        ><i className='fe-info'/></OverlayTrigger></h4>
                                        {(isSpinner)?
                                        <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                                            <Spinner key={'1'} className="m-2" color={'secondary'} type="bordered" size="md"/>
                                        </div>:
                                        ( totalAvailableMin > 0)?
                                            <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                                                {totalAvailableMin}
                                            </div>   
                                        :<div className="d-flex justify-content-center dashboard-scheme-not-found-wrapper">
                                            0
                                        </div> }   
                                    </Card.Body>
                                </Card>
                            </Link>
                        </Col>
                        
                    </Row>
                    <Row className='dashobard-card-row'>
                        <Col xl={4}>
                            <Link to={'#'}>
                                <Card className='dashboar-card'>
                                    <Card.Body>
                                        <h4 className="header-title  mt-0 mb-2">Consumed Minutes</h4>
                                        {(isSpinner)?
                                        <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                                            <Spinner key={'1'} className="m-2" color={'secondary'} type="bordered" size="md"/>
                                        </div>:
                                        ( consumedMin > 0)?
                                            <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                                                {consumedMin}
                                            </div>   
                                        :<div className="d-flex justify-content-center dashboard-scheme-not-found-wrapper">
                                            0
                                        </div> }   
                                    </Card.Body>
                                </Card>
                            </Link>
                        </Col>
                        <Col xl={4}>
                            <Link to={'#'}>
                                <Card className='dashboar-card'>
                                    <Card.Body>
                                        <h4 className="header-title  mt-0 mb-2">Remaining Minutes
                                            &nbsp;<OverlayTrigger
                                                key={'info-right'}
                                                placement={'right'}
                                                overlay={
                                                <Tooltip id={`tooltip-${'right'}`}>
                                                    Available Min. - Consumed Min.
                                                </Tooltip>
                                            }
                                        ><i className='fe-info'/></OverlayTrigger>
                                        </h4>
                                        {(isSpinner)?
                                        <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                                            <Spinner key={'1'} className="m-2" color={'secondary'} type="bordered" size="md"/>
                                        </div>:
                                        ( remainingMin > 0)?
                                            <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                                                {remainingMin}
                                            </div>   
                                        :<div className="d-flex justify-content-center dashboard-scheme-not-found-wrapper">
                                            0
                                        </div> }   
                                    </Card.Body>
                                </Card>
                            </Link>
                        </Col>
                        <Col xl={4}>
                            <Link to={'#'}>
                                <Card className='dashboar-card'>
                                    <Card.Body>
                                        <h4 className="header-title  mt-0 mb-2">Consumed Minutes Per.(%)</h4>
                                        {(isSpinner)?
                                        <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                                            <Spinner key={'1'} className="m-2" color={'secondary'} type="bordered" size="md"/>
                                        </div>:
                                        ( totalMin > 0)?
                                            <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                                                {((consumedMin/totalMin)*100).toFixed(2)}
                                            </div>   
                                        :<div className="d-flex justify-content-center dashboard-scheme-not-found-wrapper">
                                            0
                                        </div> }   
                                    </Card.Body>
                                </Card>
                            </Link>
                        </Col>
                    </Row>
                </>:''}
                {/* <Col xl={3}>
                    <Link to={'/todays-conversationlist'}>
                        <Card className='dashboar-card'>
                            <Card.Body>
                                <h4 className="header-title  mt-0 mb-2">Today's Total Answered Call</h4>
                                {(isSpinner)?
                                <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                                    <Spinner key={'1'} className="m-2" color={'secondary'} type="bordered" size="md"/>
                                </div>:
                                (totalTodayCalls > 0)?
                                    <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                                        {totalTodayCalls}
                                    </div>
                                    
                                :<div className="d-flex justify-content-center dashboard-scheme-not-found-wrapper">
                                    0
                                </div> }   
                            </Card.Body>
                        </Card>
                    </Link>
                </Col> */}
            
            {( role == '0')?
            
            <Row className='dashobard-card-table-row'>
                <Col xl={12}>
                    <Card className='dashboar-card-table'>
                        <Card.Body>
                            <h4 className="header-title  mt-0 mb-2">Client's Minutes Consumption</h4>
                            {(consumptionDetails.length > 0)?
                                // <div className='d-flex justify-content-center dashboard-scheme-wrapper-table'>
                                //     <table className="mb-0 project-info table">
                                //         <thead style={{ position: 'sticky', top: 0, backgroundColor: '#F9FAFD' }}>
                                //             <tr>
                                //                 <th>#</th>
                                //                 <th>Client Id</th>
                                //                 <th>Client Name</th>
                                //                 <th>Allocated Min.</th>
                                //                 <th>Consumed Min.</th>
                                //                 <th>Remaning Min.</th>
                                //                 <th>Consumed Min. Percentage(%)</th>

                                //             </tr>
                                //         </thead>
                                //         <tbody>
                                //             {(consumptionDetails || []).map((clientdetails:any, index:any) => {
                                //                 return (
                                //                     <tr key={index.toString()}>
                                //                         <td>{index+1}</td>
                                //                         <td>{clientdetails.client_id}</td>
                                //                         <td>{clientdetails.client_name}</td>
                                //                         <td>{clientdetails.client_allocated_minutes}</td>
                                //                         <td>{clientdetails.client_consumed_minutes}</td>
                                //                         <td>{clientdetails.client_remaning_minutes}</td>
                                //                         <td>{clientdetails.client_remaning_minutes}</td>

                                //                     </tr>
                                //                 );
                                //             })}
                                //         </tbody>
                                //     </table>
                                //     {/* {data.length} */}
                                // </div>

                                <Table
                                    columns={columns}
                                    data={consumptionDetails}
                                    pageSize={5}
                                    sizePerPageList={sizePerPageList}
                                    isSortable={true}
                                    pagination={true}
                                    isSearchable={true}
                        />
                                
                            :<div className="d-flex justify-content-center dashboard-scheme-not-found-wrapper">
                                No Data Found
                            </div> }   
                        </Card.Body>
                    </Card>
                </Col>
            </Row>:''
            }
        </>
    );
};

export default DashBoard1;
