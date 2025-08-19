import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Button, Modal, OverlayTrigger, Tooltip, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// hooks
import { usePageTitle } from '../../hooks';
import url from '../../env';

// component
import Table from '../../components/Table';
import secureLocalStorage from 'react-secure-storage';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Define types
interface ClientSub {
    _id: string;
    client_sub_id: string;
    client: string;
    client_allocated_minutes: string;
    client_subscription_date: string;
    client_subscription_remarks: string;

}

interface DataResponse {
    client: ClientSub[];
}

const AllClientSub = () => {
    const [data, setData] = useState<ClientSub[]>([]);
    const [isRefreshed,setIsRefreshed] = useState(false)
    const [showModal, setShowModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showToggleStatusModal, setShowToggleStatusModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedUserStatus, setSelectedUserStatus] = useState<boolean | null>(null);
    const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
    const [actionType, setActionType] = useState<'changePassword' | 'toggleStatus' | null>(null);
    const navigate = useNavigate();

    const logout =()=>{
        secureLocalStorage.removeItem('login');
        secureLocalStorage.removeItem('userData')
        navigate('/auth/login');
    }
    // Define handleEdit function
    const handleEdit = (id: string) => {
        navigate(`/edit-subscription/${id}`);
    };

    const handleDeleteClick = (id: string) => {
        setSelectedStaffId(id);
        setShowModal(true);
    };


    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // 24-hour format
        }).replace(',', '');
    }

    // Set page title
    usePageTitle({
        title: 'Clients',
        breadCrumbItems: [
            {
                path: '/clients',
                label: 'Clients',
                active: true,
            },
        ],
    });

    useEffect(() => {
        const fetch_subscription = async ()=>{
            try{
                const bearerToken = secureLocalStorage.getItem('login');
                const response = await fetch(`${url.nodeapipath}/calling-subscription/`,{
                    method:'GET',
                    headers: {
                        'Content-Type':'application/json',
                        'Access-Control-Allow-Origin':'*',
                        'Authorization': `Bearer ${bearerToken}`
                        }
                })
                const data = await response.json();

                if(response.ok)
                {
                    const formattedData = data.client_sub.map((client:any, index:any) => ({
                            srNo: index + 1,
                            _id:client._id,
                            client_sub_id:client.client_sub_id,
                            client:`${client.client.client_id}, ${client.client.client_name}`,
                            client_allocated_minutes: client.client_allocated_minutes,
                            client_subscription_date: formatDate(new Date(client.client_subscription_date)),
                            client_subscription_remarks: client.client_subscription_remarks,
                        }));
                        setData(formattedData);
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
            catch(error)
            {
                console.error('Error fetching clients data:', error)
            }
        
        }
        fetch_subscription()
    }, [isRefreshed]);

    const sizePerPageList = [
        { text: '5', value: 5 },
        { text: '10', value: 10 },
        { text: '25', value: 25 },
        { text: 'All', value: data.length },
    ];

    const handleAddSubscription = () => {
        navigate('/add-subscription');
    };

    const handleDeleteConfirm = async () => {
        if (selectedStaffId) {
            
            const bearerToken = secureLocalStorage.getItem('login');
            try{
                const response = await fetch(`${url.nodeapipath}/calling-subscription/${selectedStaffId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin':'*',
                        'Authorization': `Bearer ${bearerToken}`
                    }
                })

                const data = await response.json()

                if(response.ok)
                {
                    if (data.status) {
                        // setData(data.filter(sip => sip._id !== id)); // Remove deleted SIP from state
                        // console.log('SIP deleted successfully:', result);
                        toast.success(data.message || 'Client deleted successfully');
                        setIsRefreshed(prev => !prev)  
                    } else {
                        // console.error('Error deleting SIP:', result);
                        toast.error('Failed to delete Client');
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
            catch(error)
            {
                toast.error(`An error occurred while deleting the client: ${error}`);

            }finally{
                setShowModal(false);
                setSelectedStaffId(null);
            }
        }
    };

    const handleDeleteCancel = () => {
        setShowModal(false);
        setSelectedStaffId(null);
    };

    const columns = [
        {
            Header: 'Sr. No',
            accessor: 'srNo',
            sort: true,
        },
        {
            Header: 'Client Sub Id',
            accessor: 'client_sub_id',
            sort: true,
        },
        {
            Header: 'Client',
            accessor: 'client',
            sort: true,
        },
        {
            Header: 'Subscription Allocated Minutes',
            accessor: 'client_allocated_minutes',
            sort: true,
        },
        
        {
            Header: 'Subscription Date',
            accessor: 'client_subscription_date',
            sort: true,
        },
                {
            Header: 'Remarks',
            accessor: 'client_subscription_remarks',
            sort: true,
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }: { row: any }) => (
                <>
                <OverlayTrigger
                        key={'edit-right'}
                        placement={'right'}
                        overlay={
                        <Tooltip id={`tooltip-${'right'}`}>
                            Edit
                        </Tooltip>
                    }
                >
                    <Button
                        variant="primary"
                        onClick={() => handleEdit(row.original._id)}
                        style={{borderRadius: '35px',
                            width: '38px',
                            padding: '7px 7px'}}
                    >
                        <i className='fe-edit-2'/>
                    </Button>
                </OverlayTrigger>
                &nbsp;
                <OverlayTrigger
                        key={'delete-right'}
                        placement={'right'}
                        overlay={
                        <Tooltip id={`tooltip-${'right'}`}>
                            Delete
                        </Tooltip>
                    }
                >
                    <Button
                    variant="danger"
                    onClick={() => handleDeleteClick(row.original._id)}
                    style={{borderRadius: '35px',
                        width: '38px',
                        padding: '7px 7px'}}
                    >
                    <i className='fe-trash-2'/> 
                    </Button>
            </OverlayTrigger>
        </>
            ),
        },
    ];


    return (
        <Row style={{marginTop:'25px'}}>
            <Col>
                <Card className='import-record-card'>
                    <Card.Body>
                        <div className="d-flex justify-content-end">
                            <Button style={{ height: '40px', backgroundColor: '#3b3a39' }} onClick={handleAddSubscription}>
                                Add Subscription
                            </Button>
                        </div>

                        <Table
                            columns={columns}
                            data={data}
                            pageSize={5}
                            sizePerPageList={sizePerPageList}
                            isSortable={true}
                            pagination={true}
                            isSearchable={true}
                        />
                    </Card.Body>
                </Card>
            </Col>
            <ToastContainer />

            <Modal show={showModal} onHide={handleDeleteCancel} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this record?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleDeleteCancel}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteConfirm}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

        </Row>
    );
};

export default AllClientSub;
