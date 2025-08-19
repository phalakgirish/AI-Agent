import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Button, Form, Modal } from 'react-bootstrap';
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
interface User {
    _id:string;
    user_emailId: string;
    user_role_type: string;
    client_name: string;
    user_branch: string;
    user_status: string;
    client_isemailVerified: Boolean;
    client_id: string;
}

interface DataResponse {
    users: User[];
}

const UserManagement = () => {
    const [data, setData] = useState<any[]>([]);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showToggleStatusModal, setShowToggleStatusModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedUserStatus, setSelectedUserStatus] = useState<boolean | null>(null);
    const [actionType, setActionType] = useState<'changePassword' | 'toggleStatus' | null>(null);

    const StorageuserData:any = secureLocalStorage.getItem('userData');
    const userData:any = JSON.parse(StorageuserData);
    const [isRefreshed,setIsRefreshed] = useState('false');
    const navigate = useNavigate();

    const handleCloseModal = () => {
        setShowChangePasswordModal(false);
        setShowToggleStatusModal(false);
    };

    const handleOpenChangePasswordModal = (userId: string,verifiedStatus:boolean) => {
        console.log(verifiedStatus);
        
        if(verifiedStatus)
        {
            setSelectedUserId(userId);
            setActionType('changePassword');
            setShowChangePasswordModal(true);
        }
        else
        {
            toast.error('User Email Id is unverified!. Please Verify email!');
        }
        
    };

    const handleOpenToggleStatusModal = (userId: string, userStatus: boolean) => {
        setSelectedUserId(userId);
        setSelectedUserStatus(userStatus);
        setActionType('toggleStatus');
        setShowToggleStatusModal(true);
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
                    FetchUserData();
                    var toasterMessage = `${data.message}, User email Id: ${data.usesCreatedData.staff_email_id} and Password: ${data.usesCreatedData.password}`
                    toast.success( toasterMessage || 'Staff added successfully');
                    setIsRefreshed('true')
                }
                else 
                {
                    console.error('Error fetching user details:', data);
                }
            }
            catch(error){
                console.error('Error during API call:', error);
            }finally{
                setSelectedUserId(null)
                setShowChangePasswordModal(false)
            }
    };

    usePageTitle({
        title: 'User Management',
        breadCrumbItems: [
            {
                path: '/user-management',
                label: 'User Management',
                active: true,
            },
        ],
    });

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
                    FetchUserData();
                    toast.success(`User ${newStatus ? 'Activated' : 'Inactivated'} successfully`);
                    setIsRefreshed('true')
                }
                else 
                {
                    console.error('Error fetching user details:', data);
                }
            }
            catch(error){
                console.error('Error during API call:', error);
            }finally{
                setSelectedUserStatus(null)
                setShowToggleStatusModal(false);
            }
    }

    useEffect(() => {
        FetchUserData();
    }, []);

    const FetchUserData = ()=>{
        try
        {
            const bearerToken = secureLocalStorage.getItem('login');
            fetch(`${url.nodeapipath}/users`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Authorization': `Bearer ${bearerToken}`,
                },
            })
                .then((response) => response.json())
                .then((data: DataResponse) => {
                    
                    const formattedData = data.users.map((user, index) => ({
                        srNo: index + 1,
                        ...user,
                    }));
                    setData(formattedData);
                })
                .catch((error) => console.error('Error fetching user data:', error));
        }
        catch(error)
        {
            console.error('Error during API call:', error);
        }
        
    }

    const sizePerPageList = [
        { text: '5', value: 5 },
        { text: '10', value: 10 },
        { text: '25', value: 25 },
        { text: 'All', value: data.length },
    ];

    const columns = [
        {
            Header: 'Sr. No',
            accessor: 'srNo',
            sort: true,
        },
        {
            Header: 'User Email ID',
            accessor: 'user_emailId',
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
            Header: 'User Role',
            accessor: 'user_role_type',
            sort: true,
            Cell: ({ value }: { value:string }) => (value== '0' ? 'Super User' : (value == '1')?'Client':'Staff'),
        },
        {
            Header: 'Status',
            accessor: 'user_status',
            Cell: ({ row }: { row: any }) => ( row.original.user_role_type == '0'?'':
                <Form.Check
                    type="switch"
                    id={`status-switch-${row.original._id}`}
                    checked={row.original.user_status}
                    onChange={(e) => handleOpenToggleStatusModal(row.original._id,row.original.user_status)}
                />
            ),
            sort: true,
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }: { row: any }) => (
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div
                        style={{
                            borderRadius: '25%',
                            backgroundColor: '#007bff',
                            width: '30px',
                            height: '30px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            cursor: 'pointer',
                        }}
                        onClick={() => handleOpenChangePasswordModal(row.original._id,row.original.staff_isemailVerified)}
                    >
                        <i className="mdi mdi-key" style={{ color: '#fff' }}></i>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <Row>
            <Col>
                <Card>
                    <Card.Body>
                        <div className="d-flex justify-content-between mb-4">
                            <div>
                                <h4 className="header-title">User Management</h4>
                                <p className="text-muted font-14 mb-4">A table showing all registered users</p>
                            </div>
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

                        {/* Change Password Modal */}
            <Modal show={showChangePasswordModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Change Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to change the password for this user?
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

export default UserManagement;
