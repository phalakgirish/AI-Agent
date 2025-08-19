import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import url from '../../env';  // Adjust the import path as necessary
import secureLocalStorage from 'react-secure-storage';
import Table from '../../components/Table';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer , toast} from 'react-toastify';
import { usePageTitle } from '../../hooks';
import TableComponent from '../../components/TableComponent';
import Spinner from '../../components/Spinner';

// Define types
interface Client {
    client_name : string;
    client_email: string;
    client_dob : string; 
    client_mobile_number : string;
    client_gender: string;
    client_country: string;
    client_state: string;   
    client_role:string;
    client_authid:string;
    client_authtoken:string;
    client_landline_number: string;
}

interface DataResponse {
    // department: any;
    client: Client[];
}



const ImportCallOutbound = () => {
    const [clients, setClients] = useState<any>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<string | null>(null);
    const [pageClient, setPageClients] = useState<any>([]);
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


    // useEffect(() => {
    //     const bearerToken = secureLocalStorage.getItem('login');

    //     fetch(`${url.nodeapipath}/client`,{
    //         method:'GET',
    //         headers: {
    //             'Content-Type':'application/json',
    //             'Access-Control-Allow-Origin':'*',
    //             'Authorization': `Bearer ${bearerToken}`
    //             }
    //     })
    //         .then((response) => response.json())
    //         .then((data: DataResponse) => {
    //             // You can format data if needed
    //             console.log(data);
                
    //             const formattedData = data.client.map((client:any, index:any) => ({
    //                 srNo: index + 1,
    //                 ...client,
    //             }));
    //             setClients(formattedData);
    //         })
    //         .catch((error) => console.error('Error fetching client data:', error));
    // }, [isRefreshed]);


    const handleOpenDeleteModal = (id: string) => {
        setClientToDelete(id);
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setErrmsg('');
    };

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
                    // setExcelData(data);
                    const formattedData = data.map((client:any, index:any) => ({
                        srNo: index + 1,
                        lead_name: client.lead_name,
                        to_number: `+${client.to_number}`,
                        use_case: client.use_case,

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


    const onImport = async(ev:any) =>{
        ev.preventDefault();
        // return;
        const StorageUserData:any = secureLocalStorage.getItem('userData')
        const userData:any = JSON.parse(StorageUserData)
        if(userData.client_answer_url != '' || userData.client_answer_url != undefined || userData.client_answer_url != null)
        {
            if(!isImported)
            {
                setIsLoader(true);
                // if(isVerified)
                // {
                    
                    var ImportedClients = []    
                    for(let i of clients){   
                    try{
                        

                        const DataToPost = {
                            lead_name: i['lead_name'],  // Your Plivo number
                            to: i['to_number'],    // Destination number
                            use_case:i['use_case']
                        }
                        // console.log(DataToPost);

                        // const response = await fetch(userData.client_answer_url, {
                        //     body: JSON.stringify(DataToPost),
                        //      method: 'POST',
                        //     headers: {
                        //         'Content-Type': 'application/json',
                        //         'Access-Control-Allow-Origin': '*',
                        //         'Authorization': 'Basic ' + btoa(`${userData.client_authid}:${userData.client_authtoken}`)
                        //     },
                        // });
                        // const data: any = await response.json();
                        // console.log(response);
                        
                        await fetch(userData.client_answer_url,{
                            body: JSON.stringify(DataToPost),
                            method:"POST",
                            headers:{
                                "Content-Type":"application/json",
                                'Access-Control-Allow-Origin':'*',
                                'Authorization': 'Basic ' + btoa(`${userData.client_authid}:${userData.client_authtoken}`)
                            }
                        })
                        .then(res=>res.json())
                        .then(result=>{
                            console.log(result);
                            
                            if(result.message != '' && result.message != undefined)
                            {  
                                i['msg'] = result.message
                                i['request_id'] = result.request_uuid  
                                ImportedClients.push(i)   
                            }
                            else
                            {
                                i['msg'] = result.error
                                i['request_id'] = ''
                                ImportedClients.push(i)
                            }    
                        })
                    }
                    catch(error:any)
                    {
                        console.log(error);
                        
                        i['msg'] = error.message
                        i['request_id'] = ''
                        ImportedClients.push(i)
                    }
                    
                    }
                    setClients(ImportedClients); 
                    setIsImported(true);
                    setIsLoader(false);

                // }
                // else
                // {
                //     setErrmsg('Please Verify uploaded data.');
                //     handleOpenDeleteModal('1');
                // }
            }
            else
            {
                setErrmsg('Uploaded Data Imported Already.');
                handleOpenDeleteModal('1');
            }  
        }
        else
        {
            setErrmsg('Answer URL is required.');
            handleOpenDeleteModal('1');
        }
          
    }


    const columns = [
        { Header: 'Sr. No', accessor: 'srNo',sort: true, },
        { Header: 'Lead Name', accessor: 'lead_name', sort: true,},
        {
            Header: 'To Number',
            accessor: 'to_number',
            sort: true,
        },
        {
            Header: 'Use Case',
            accessor: 'use_case',
            sort: true,
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
            title: 'Import To Make Call',
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
                                <h4 className="header-title">Import To Make Call</h4>
                                <p className="text-muted font-14 mb-4">A table showing all list To Make Call</p>
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
                                            <Form.Label style={{width:'48%',color:'#3b3a39',paddingLeft:'8%',fontSize:'100%'}} onClick={(e)=>{window.location.href=`${url.nodeapipath}/sample/Import Make Call.xlsx`}}><b>Sample Excel Format</b></Form.Label>
                                        </Form.Group>
                                    </div>
                                    <div style={{ textAlign:'end',width:"30%" }}>
                                        {/* <Button style={{ height: '40px', backgroundColor: '#3b3a39'}} onClick={(e)=>onVerify(e)}>
                                                Verify
                                        </Button>
                                        &nbsp; */}
                                        <Button style={{ height: '40px', backgroundColor: '#3b3a39'}} onClick={(e)=>onImport(e)}>
                                                Make Calls
                                        </Button>
                                    </div>
                                </Row>
                        </div>
                        <hr />
                        {!(isLoader) ?
                        (clients.length > 0)?
                            // <Table
                            // columns={columns}
                            // data={clients}
                            // // pageSize={5}
                            // // sizePerPageList={sizePerPageList}
                            // isSortable={true}
                            // // pagination={true}
                            // // isSearchable={true}
                            // // isSelectable={true}
                            // />
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
                        </div>:
                        

                        <div className="d-flex justify-content-center import-record-loader">
                            <Spinner key={'1'} className="m-2" color={'secondary'} type="bordered" size="lg"/>
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

export default ImportCallOutbound;
