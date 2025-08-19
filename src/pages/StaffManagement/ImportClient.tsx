import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import url from '../../env';  // Adjust the import path as necessary
import secureLocalStorage from 'react-secure-storage';
import Table from '../../components/Table';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { ToastContainer , toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePageTitle } from '../../hooks';
import TableComponent from '../../components/TableComponent';
import Spinner from '../../components/Spinner';



const ImportClient = () => {
    const [clients, setClients] = useState<any>([]);
    const [pageClient, setPageClients] = useState<any>([]);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<string | null>(null);
    const [isRefreshed,setIsRefreshed] = useState(false)
    const[fileStatus,setFileStatus] = useState(false);
    const[errFile,setErrFile] = useState(false);
    var fileRecord = null;
    const[excelData,setExcelData] = useState([]);
    const[excelFileType,setExcelFileType] = useState(false);
    const[excelFile,setExcelFile] = useState(null);
    const[errmsg,setErrmsg] = useState(" ");
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [file, setFile] = useState<File | null>(null);
    const [isVerified, setIsVerified] = useState(false);
    const [isImported, setIsImported] = useState(false);
    const [isSpinner,setIsSpinner] = useState(false)
    const [pagelimit,setPagelimit] = useState(20)
    const [pageNo,setPageNo] = useState(1)
    const [isLoader,setIsLoader] = useState(false)

    const handleOpenDeleteModal = (id: string) => {
        setClientToDelete(id);
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setClientToDelete(null);
    };

    const logout =()=>{
        secureLocalStorage.removeItem('login');
        secureLocalStorage.removeItem('userData')
        navigate('/auth/login');
    }

    useEffect(()=>{

        if(clients.length >0)
        {
            var offset:any = (pageNo-1)*pagelimit
            var limitclients = clients.slice(offset,offset+pagelimit)
            setPageClients(limitclients);
        }
        
    },[clients,pageNo])


    const sizePerPageList = [
        {
            text: '5',
            value: 5,
        },
        {
            text: '10',
            value: 10,
        },
        {
            text: '25',
            value: 25,
        },
        {
            text: 'All',
            value: clients.length,
        },
    ];

    const onVerify = async (ev:any) =>{
        // console.log(clients);
        
        ev.preventDefault();
        if(clients.length >0)
        {
            setIsLoader(true);
            try{
                const bearerToken = secureLocalStorage.getItem('login');
                const response = await fetch(`${url.nodeapipath}/client/verify-data`,{
                    body: JSON.stringify(clients),
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                        'Access-Control-Allow-Origin':'*',
                        'Authorization': `Bearer ${bearerToken}`
                    }
                })

                const result = await response.json();

                if(response.ok)
                {
                    if(result.status === true)
                    {  
                        setClients(result.client);  
                        setIsVerified(true)
                        setIsImported(false)
                        setIsLoader(false);
                    }
                }
                else
                {
                    if(response.status == 401 && response.statusText == 'Unauthorized' && result.code == 401)
                    {
                        logout();
                        toast.warning('Session Expired.');
                        
                    }
                }
            }
            catch(error)
            {
                toast.error(`error while verifiyng data.${error}`);
            }
        }
        else
        {
            setErrmsg('Please Upload Data first.');
            setFile(null)
            setIsLoader(false);
            handleOpenDeleteModal('1');
        }
    }

    var selectFile = (ev:any)=>{
        // console.log(ev.target.files[0]);
        setIsVerified(false)
        setIsImported(false)
        if(ev.target.files[0] === undefined || ev.target.files[0] === null)
        {
            setFileStatus(false);
        }
        else
        {
            setIsLoader(true);
            setFile(ev.target.files[0]);
            setFileStatus(true);
            setErrFile(false);
            // setFileRecord(ev.target.files[0])
            fileRecord = ev.target.files[0]
            // console.log(fileRecord);
            
            const fileTypes = ['application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/csv'];

            if(fileTypes.includes(fileRecord.type))
            {
                setExcelFileType(true);
                // message.current.className = '';
                setErrmsg('');

                let reader = new FileReader();
                reader.readAsArrayBuffer(fileRecord);
                reader.onload = (ev:any) =>{
                    // console.log(ev.target);
                    // setExcelFile(ev.target.result);
                    // console.log(ev.target);

                    const workbook = XLSX.read(ev.target.result,{type:'buffer'});
                    // console.log(workbook);
                    const workSheetName = workbook.SheetNames[0];
                    // console.log(workSheetName);
                    const worksheet = workbook.Sheets[workSheetName];
                    // console.log(worksheet);
                    const data:any = XLSX.utils.sheet_to_json(worksheet);
                    // console.log(data);
                    // setExcelData(data);
                    const formattedData = data.map((client:any, index:any) => ({
                        srNo: index + 1,
                        client_name : client.client_name,
                        client_emailId: client.client_emailId,
                        client_landline_number: client.client_landline_number,
                        client_authid: client.client_authid,
                        client_authtoken: client.client_authtoken,
                        client_answer_url:(client.client_answer_url == undefined)?'':client.client_answer_url
                    }));
                    setClients(formattedData)
                    setIsLoader(false);
                    setErrmsg('');
                };
            }
            else
            {
                setExcelFileType(false);
                // setExcelData(null);
                // message.current.className = 'alert alert-danger';
                setErrmsg('Please Select Only Excel File Types.');
                setFile(null)
                handleOpenDeleteModal('1');
            }
        }          
    }

    

    const onImport = async (ev:any) =>{
        ev.preventDefault();
        if(!isImported)
        {
            if(isVerified)
            {
                setIsLoader(true);
                try{
                    const bearerToken = secureLocalStorage.getItem('login');
                    const response = await fetch(`${url.nodeapipath}/client/import-data`,{
                        body: JSON.stringify(clients),
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json",
                            'Access-Control-Allow-Origin':'*',
                            'Authorization': `Bearer ${bearerToken}`
                        }
                    })

                    const result  = await response.json();

                    if(response.ok)
                    {
                        if(result.status === true)
                        {  
                            setClients(result.client); 
                            setIsImported(true); 
                            setIsLoader(false);  
                        }
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
                            toast.error('Error While importing data.');
                        }
                    }
                }
                catch(error)
                {
                    toast.error(`Error While importing data.${error}`);
                }
            }
            else
            {
                setErrmsg('Please Verify uploaded data.');
                handleOpenDeleteModal('1');
            }
        }
        else
        {
            setErrmsg('Uploaded Data Imported Already.');
            handleOpenDeleteModal('1');
        }    
    }


    const columns = [
        { Header: 'Sr. No', accessor: 'srNo',sort: true, },
        { Header: 'Name', accessor: 'client_name', sort: true,},
        { Header: 'Email Id', accessor: 'client_emailId', sort: true,},
        { Header: 'Landline number', accessor: 'client_landline_number', sort: true,},
        { Header: 'Auth Id', accessor: 'client_authid', sort: true,},
        { Header: 'Auth Token', accessor: 'client_authtoken', sort: true,},
        { Header: 'Answer URL', accessor: 'client_answer_url', sort: true,},

        {
            Header: 'Verify Status',
            accessor: 'status',
            sort: true,
            Cell: ({ value }: { value: any })=>(value) ? 'Valid' : (value == 0)?'Invalid':''
        },
        {
            Header: 'Message',
            accessor: 'msg',
            sort: true,
        },
        
    ];

    const handleAddClient = ()=>{
        navigate('/add-client');
    }

    usePageTitle({
            title: 'Client',
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

    const clearFile = () => {
        setFile(null)  
        setClients([]); 
        setIsVerified(false); 
        setIsImported(false); 
      };

    return (
        <Row style={{marginTop:'25px'}}>
            <Col>
                <Card className='import-record-card'>
                    <Card.Body>
                        {/* <div className="d-flex justify-content-between mb-4">
                            <div>
                                <h4 className="header-title">Import Clients</h4>
                                <p className="text-muted font-14 mb-4">Upload flie to import clients</p>
                            </div>
                            <Button style={{ height: '40px', backgroundColor: '#3b3a39' }} onClick={handleAddClient}>
                                Add Client
                            </Button>
                        </div> */}
                        {/* <Table striped bordered hover>
                            <thead>
                                <tr>
                                    {columns.map((column) => (
                                        <th key={column.Header}>{column.Header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody> */}
                                {/* {clients.map((client, index) => (
                                    <tr key={client._id}>
                                        {columns.map((column) => (
                                            <td key={column.accessor}>
                                                {column.accessor === 'aadharFile' || column.accessor === 'panFile' ? (
                                                    <a href={client[column.accessor as keyof Client]} target="_blank" rel="noopener noreferrer">
                                                        View File
                                                    </a>
                                                ) : (
                                                    client[column.accessor as keyof Client]
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))} */}
                                <div className="mb-1">
                                <Row>
                                    <div style={{width:"70%"}}>
                                        <Form.Group className="mb-2 d-flex">
                                            <Form.Label style={{width:'20%'}}>Upload File</Form.Label>
                                            <input type="file"  className="form-control" style={{ height: '38px'}} placeholder="Select Month" value={file ? undefined : ""} onChange={(e)=>{selectFile(e)}}/>
                                            <Button style={{ height: '38px', backgroundColor: '#f2f2f2',color:'#7e7e7e',border:'1px solid #7e7e7e' }} onClick={(e)=>clearFile()}>
                                                Clear
                                            </Button>
                                            <Form.Label style={{width:'48%',color:'#3b3a39',paddingLeft:'8%',fontSize:'100%'}} onClick={(e)=>{window.location.href=`${url.nodeapipath}/sample/Import client.xlsx`}}><b>Sample Excel Format</b></Form.Label>
                                        </Form.Group>
                                    </div>
                                    <div style={{ textAlign:'end',width:"30%" }}>
                                        <Button style={{ height: '40px', backgroundColor: '#3b3a39'}} onClick={(e)=>onVerify(e)}>
                                                Verify
                                        </Button>
                                        &nbsp;
                                        <Button style={{ height: '40px', backgroundColor: '#3b3a39'}} onClick={(e)=>onImport(e)}>
                                                Import
                                        </Button>
                                    </div>
                                </Row>
                        </div>
                        <hr />
                        {!(isLoader)?'':
                            <div className="d-flex justify-content-center import-record-loader">
                                <Spinner key={'1'} className="m-2" color={'secondary'} type="bordered" size="lg"/>
                            </div>   
                        }
                        {(clients.length > 0)?
                        <TableComponent
                            columns={columns}
                            data={pageClient}
                            pageSize={5}
                            sizePerPageList={sizePerPageList}
                            isSortable={true}
                            pagination={false}
                            isSpinner={isSpinner}
                            pageLimit = {pagelimit}
                            pageNo = {pageNo}
                            recordCount = {clients.length}
                            setPageLimit = {setPagelimit}
                            setPageNo = {setPageNo}
                        />
                        :<div className="d-flex justify-content-center">
                                    No Data Found
                        </div>
                        }
                                                
                                    
                            {/* </tbody>
                        </Table> */}
                    </Card.Body>
                </Card>
            </Col>
            <ToastContainer />

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Alert</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errmsg}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDeleteModal}>
                        Ok
                    </Button>
                </Modal.Footer>
            </Modal>
        </Row>
    );
};

export default ImportClient;
