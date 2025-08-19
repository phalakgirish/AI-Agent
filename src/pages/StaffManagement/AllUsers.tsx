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
import TableComponent from '../../components/TableComponent';

// Define types
interface Clients {
    _id: string;
    client_id: string;
    client_name: string;
    client_emailId: string;
    client_lindline_number: string;

}

interface DataResponse {
    client: Clients[];
}

const AllStaffs = () => {
    const [data, setData] = useState<any>([]);
    const [isRefreshed,setIsRefreshed] = useState(false)
    const [showModal, setShowModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showToggleStatusModal, setShowToggleStatusModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedUserStatus, setSelectedUserStatus] = useState<boolean | null>(null);
    const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
    const [actionType, setActionType] = useState<'changePassword' | 'toggleStatus' | null>(null);
    const navigate = useNavigate();
    const [isSpinner,setIsSpinner] = useState(false)
    const [pagelimit,setPagelimit] = useState(3)
    const [pageNo,setPageNo] = useState(1)
    const [recordCount,setRecordCount] = useState<any>()
    const [searchquery,setSearchQuery] = useState<any>('')
    const [isSearch, setIsSearch] = useState(false);

    // Define handleEdit function
    const handleEdit = (id: string) => {
        navigate(`/edit-client/${id}`);
    };

    const handleDeleteClick = (id: string) => {
        setSelectedStaffId(id);
        setShowModal(true);
    };

    const handleOpenToggleStatusModal = (userId: string, userStatus: boolean) => {
        setSelectedUserId(userId);
        setSelectedUserStatus(userStatus);
        setActionType('toggleStatus');
        setShowToggleStatusModal(true);
    };

    const handleOpenChangePasswordModal = (userId: string,verifiedStatus?:boolean) => {
            
        // if(verifiedStatus)
        // {
            setSelectedUserId(userId);
            setActionType('changePassword');
            setShowChangePasswordModal(true);
        // }
        // else
        // {
        //     toast.error('User Email Id is unverified!. Please Verify email!');
        // }
            
        };

    const handleCloseModal = () => {
        setShowChangePasswordModal(false);
        setShowToggleStatusModal(false);
    };

    const handleChangePassword = async() => {
        if (!selectedUserId) return;
        
        // navigate(`/change-password/${id}`);

            try
            {
                const bearerToken = secureLocalStorage.getItem('login');
                const response = await fetch(`${url.nodeapipath}/users/changepassword/${selectedUserId}`,{
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Authorization': `Bearer ${bearerToken}`,
                    },
                })
                const data = await response.json();

                
                if (response.ok)
                {
                    // console.log(data);
                    // FetchUserData();
                    var toasterMessage = `${data.message}, Client email Id: ${data.usesCreatedData.client_email_id} and Password: ${data.usesCreatedData.password}`
                    toast.success( toasterMessage || 'Change Password successfully');
                    // setIsRefreshed(true)
                }
                else 
                {
                    console.error('Error fetching Client details:', data);
                }
            }
            catch(error){
                console.error('Error during API call:', error);
            }finally{
                setSelectedUserId(null)
                setShowChangePasswordModal(false)
            }
    };

    const handleToggleStatus = async ()=>{
            // console.log(e.target.value);
    
            // var userStatus = (e.target.value == 'on')?true:false
    
            if (selectedUserId === null || selectedUserStatus === null) return;
    
            const newStatus = !selectedUserStatus;
    
                try
                {
                    const bearerToken = secureLocalStorage.getItem('login');
                    const response = await fetch(`${url.nodeapipath}/users/all/${selectedUserId}`,{
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                            'Authorization': `Bearer ${bearerToken}`,
                        },
                        body:JSON.stringify({ user_status: newStatus })
                    })
                    const data = await response.json();
                    if (response.ok)
                    {
                        // console.log(data);
                        // FetchUserData();
                        toast.success(`Client ${newStatus ? 'Activated' : 'Inactivated'} successfully`);
                        setIsRefreshed(!isRefreshed)
                    }
                    else 
                    {
                        console.error('Error fetching client details:', data);
                    }
                }
                catch(error){
                    console.error('Error during API call:', error);
                }finally{
                    setSelectedUserStatus(null)
                    setShowToggleStatusModal(false);
                }
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
       fetchClient()
    }, [isRefreshed,searchquery,pageNo]);

    const fetchClient = ()=>{
        setIsSpinner(true);   
        try {
            const bearerToken = secureLocalStorage.getItem('login');
            if(pageNo == 0)
            {
                setPageNo(1);
                return;
            }
            var offset = (pageNo - 1)*pagelimit
            // console.log(offset);
            
            fetch(`${url.nodeapipath}/client?searchquery=${searchquery}&limit=${pagelimit}&offset=${offset}`,{
                method:'GET',
                headers: {
                    'Content-Type':'application/json',
                    'Access-Control-Allow-Origin':'*',
                    'Authorization': `Bearer ${bearerToken}`
                    }
            })
                .then((response) => response.json())
                .then((data: any) => {
                    console.log(data);
                    
                    const formattedData = data.client.map((client:any, index:any) => ({
                        srNo: offset+index + 1,
                        ...client,
                    }));
                    setData(formattedData);
                    setRecordCount(data.clientCount)
                    setIsSpinner(false)
                })
                .catch((error) => {setIsSpinner(false);console.error('Error fetching clients data:', error)});
        } catch (error) {
            setIsSpinner(false);
                console.error('Error during API call:', error);
        }
    }

    const sizePerPageList = [
        { text: '5', value: 5 },
        { text: '10', value: 10 },
        { text: '25', value: 25 },
        { text: 'All', value: data.length },
    ];

    const handleAddClient = () => {
        navigate('/add-client');
    };

    const handleDeleteConfirm = async () => {
        if (selectedStaffId) {
            
            const bearerToken = secureLocalStorage.getItem('login');
            try{
                fetch(`${url.nodeapipath}/client/${selectedStaffId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin':'*',
                        'Authorization': `Bearer ${bearerToken}`
                    }
                })
                .then((response) => response.json())
                .then((data) => {

                    if (data.status) {
                        // setData(data.filter(sip => sip._id !== id)); // Remove deleted SIP from state
                        // console.log('SIP deleted successfully:', result);
                        toast.success(data.message || 'Client deleted successfully');
                        setIsRefreshed(true)  
                    } else {
                        // console.error('Error deleting SIP:', result);
                        toast.error('Failed to delete Client');
                        }
                    
                })
                .catch((error) => {
                    // console.error('Error deleting Staff data:', error);
                    toast.error('An error occurred while deleting the client');

                });
            }
            catch(error)
            {
                toast.error('An error occurred while deleting the client');

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
            Header: 'Client Id',
            accessor: 'client_id',
            sort: true,
        },
        {
            Header: 'Name',
            accessor: 'client_name',
            sort: true,
        },
        {
            Header: 'Email ID',
            accessor: 'client_emailId',
            sort: true,
        },
                {
            Header: 'Landline Number',
            accessor: 'client_landline_number',
            sort: true,
        },
        {
            Header: 'Status',
            accessor: 'client_status',
            Cell: ({ row }: { row: any }) => ( row.original.user_role_type == '0'?'':
                <Form.Check
                    type="switch"
                    id={`status-switch-${row.original._id}`}
                    checked={row.original.client_status}
                    onChange={(e) => handleOpenToggleStatusModal(row.original._id,row.original.client_status)}
                />
            ),
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
                        key={'change-password'}
                        placement={'right'}
                        overlay={
                        <Tooltip id={`tooltip-${'right'}`}>
                            Change Password
                        </Tooltip>
                    }
                >
                    <Button
                        variant="warning"
                        onClick={() => handleOpenChangePasswordModal(row.original._id)}
                        style={{borderRadius: '35px',
                            width: '38px',
                            padding: '7px 7px'}}
                    >
                        <i className="mdi mdi-key" style={{ color: '#fff' }} />
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
                <Card>
                    <Card.Body>
                        <div className="d-flex justify-content-between mb-4">
                            <div>
                                <h4 className="header-title">All Client</h4>
                                <p className="text-muted font-14 mb-4">A table showing all clients</p>
                            </div>
                            <Button style={{ height: '40px', backgroundColor: '#3b3a39' }} onClick={handleAddClient}>
                                Add Client
                            </Button>
                        </div>

                        {/* <Table
                            columns={columns}
                            data={data}
                            pageSize={5}
                            sizePerPageList={sizePerPageList}
                            isSortable={true}
                            pagination={true}
                            isSearchable={true}
                        /> */}
                        <TableComponent
                            columns={columns}
                            data={data}
                            pageSize={5}
                            sizePerPageList={sizePerPageList}
                            isSortable={true}
                            isSearch={isSearch}
                            isSearchable={true}
                            pagination={false}
                            isSpinner={isSpinner}
                            pageLimit = {pagelimit}
                            pageNo = {pageNo}
                            recordCount = {recordCount}
                            setPageLimit = {setPagelimit}
                            setPageNo = {setPageNo}
                            setRecordCount = {setRecordCount}
                            setSearchQuery = {setSearchQuery}
                        />
                    </Card.Body>
                </Card>
            </Col>
            <ToastContainer />

            <Modal show={showModal} onHide={handleDeleteCancel} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this client?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleDeleteCancel}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteConfirm}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showChangePasswordModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Change Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to change the password for this client?
                </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={handleChangePassword}>
                            Change Password
                        </Button>
                    </Modal.Footer>
            </Modal>
            {/* Toggle Status Modal */}
            <Modal show={showToggleStatusModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Change User Status</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to {selectedUserStatus ? 'Deactivate' : 'Activate'} this user?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleToggleStatus}>
                            {selectedUserStatus ? 'Deactivate' : 'Activate'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Row>
    );
};

export default AllStaffs;
