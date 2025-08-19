import React, { useEffect, useState,useContext } from 'react'
import { Accordion, Badge, Button, Card, Col, Dropdown, Modal, Row, Table,useAccordionButton,AccordionContext, Form } from 'react-bootstrap';
import close from '../../assets/images/close.png';
import url from '../../env';
import secureLocalStorage from 'react-secure-storage';
import AudioPlayerComponents from '../../components/AudioPlayerComponent';
import classNames from 'classnames';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type CallDetailsProps = {
    callDetailsModel: boolean;
    togglecallDetailsModel:Function,
    call_uuid?:any,
    toNumber?:any,
    conversationId?:any
};


export default function CallDetailsModal({callDetailsModel,togglecallDetailsModel,call_uuid,toNumber,conversationId}:CallDetailsProps) {



    // const[ManagerUserId, setManagerUserId] = useState(MangerInfoData['user_id']);

    // setManagerUserId(MangerInfoData['user_id']);
    const [audioSrc,setAudioSrc] = useState<string>('')
    const [calls_uuid, setCalls_uuid] = useState(call_uuid)
    const [to_Number, setTo_Number] = useState(toNumber)
    const [from_Number, setFrom_Number] = useState('')
    const StorageData:any = secureLocalStorage.getItem('userData')
    const usersData:any = JSON.parse(StorageData)
    const [isPlayerDis,setIsPlayerDis] = useState(false)
    const [transcript, setTranscript] = useState<string>('');
    const [showNotesForm, setShowNotesForm] = useState(false);
    const [contanctNotes, setContactNotes] = useState('');
    const [conversationNoteLog, setConversationNoteLog] = useState([])
    const [isLogRefersh, setisLogRefresh] = useState(false);
    const navigate = useNavigate();

    const logout =()=>{
        secureLocalStorage.removeItem('login');
        secureLocalStorage.removeItem('userData')
        navigate('/auth/login');
    }
    
    const CustomToggle = ({ children, eventKey, containerClass, linkClass, callback }: any) => {
        const { activeEventKey } = useContext(AccordionContext);

        const decoratedOnClick = useAccordionButton(eventKey, () => callback && callback(eventKey));

        const isCurrentEventKey = activeEventKey === eventKey;

        return (
            <h5 className={containerClass}>
                <Link
                    to="#"
                    className={classNames(linkClass, {
                        collapsed: !isCurrentEventKey,
                    })}
                    onClick={decoratedOnClick}
                >
                    {children}
                </Link>
            </h5>
        );
    };


    useEffect(()=>{
        const StorageUserData:any = secureLocalStorage.getItem('userData')
        const userData:any = JSON.parse(StorageUserData)
        //   const handlePlay = async (calls_uuid:string)=>{
        // // console.log(call_uuid);
        //     try {
                    
        //         // const bearerToken:any = secureLocalStorage.getItem('login');
        //         const StorageUserData:any = secureLocalStorage.getItem('userData')
        //         const userData:any = JSON.parse(StorageUserData)

        //             const response = await fetch(`${url.plivoapipath}/${userData.client_authid}/Recording?call_uuid=${calls_uuid}`, {
        //                 method: 'GET',
        //                 headers: {
        //                     'Content-Type': 'application/json',
        //                     'Access-Control-Allow-Origin': '*',
        //                     'Authorization': 'Basic ' + btoa(`${userData.client_authid}:${userData.client_authtoken}`),
        //                 },
        //             });
        //             const data: any = await response.json();
        //             // console.log(data);
        //             // setIsSpinner(false)
                    
        //             if (response.ok) {
        //                 if(data.objects.length >0)
        //                 {
        //                     setAudioSrc(data.objects[0].recording_url);
        //                     setFrom_Number(data.objects[0].from_number)
        //                     setIsPlayerDis(true)
        //                 }
        //                 else
        //                 {
        //                     setIsPlayerDis(false)
        //                 }
                        
        //                 // setIsAudioPlayer(true)
        //             } else {
        //                 console.error('Error fetching payments:', data);
        //             }
        //         } catch (error) {
        //             console.error('Error during API call:', error);
        //         }
            
        // }
        

        const handlePlay = async (call_uuid:string)=>{
        // console.log(call_uuid);
        try {
                
            const bearerToken:any = secureLocalStorage.getItem('login');
            const StorageUserData:any = secureLocalStorage.getItem('userData')
            const userData:any = JSON.parse(StorageUserData)
                

            const response = await fetch(`${url.nodeapipath}/conversation/call/${call_uuid}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Authorization': `Bearer ${bearerToken}`
                },
            });
            // if (response.status === 401 && response.statusText == 'Unauthorized') {
            //     // Handle session expiration silently
            //     toast.warning('Session Expired.');
            //     logout();
            // }
            const data: any = await response.json();
                // console.log(data.conversation_details);
                // setIsSpinner(false)
                
            if (response.ok) {
                    
                if(data.conversation_details != undefined)
                {
                    //${url.nodeapipath}
                    // console.log(`${url.nodeapipath}/recording/${data.conversation_details.recording_url}`);
                        
                    setAudioSrc(`${url.servernodeapipath}/recording/${data.conversation_details.recording_url}`);
                        // setTo_Number(to_number)
                    setTranscript((data.conversation_details.transcription ?? '').replace(/\[Customer\]/g, '<b>[Customer]:</b>')
    .replace(/\[Ai_Agent\]/g, '<b>[Ai_Agent]:</b>').replace(/\n/g,'<br><br>'))
                    setFrom_Number(data.conversation_details.from_number)
                    setIsPlayerDis(true)
                }
                else
                {
                    // toast.error('Recording Not found');
                }
                    
            } else {
                // console.error('Error fetching recording:', data);
                // handlePlivoPlay(call_uuid);
                // toast.error('Recording Not found');
                if(response.status == 401 && response.statusText == 'Unauthorized' && data.code == 401)
                {
                    logout();
                    toast.warning('Session Expired.');
                    
                }
                else
                {
                    // toast.error('Recording Not found');
                    setIsPlayerDis(false)
                }
                
            }
            } catch (error) {
                console.error('Error during API call:', error);
            }
        
        }

    // const handlePlivoPlay = async (calls_uuid:string)=>{
    //         try {
                    
    //             // const bearerToken:any = secureLocalStorage.getItem('login');
    //             const StorageUserData:any = secureLocalStorage.getItem('userData')
    //             const userData:any = JSON.parse(StorageUserData)

    //                 const response = await fetch(`${url.plivoapipath}/${userData.client_authid}/Recording?call_uuid=${calls_uuid}`, {
    //                     method: 'GET',
    //                     headers: {
    //                         'Content-Type': 'application/json',
    //                         'Access-Control-Allow-Origin': '*',
    //                         'Authorization': 'Basic ' + btoa(`${userData.client_authid}:${userData.client_authtoken}`),
    //                     },
    //                 });
    //                 const data: any = await response.json();
    //                 console.log(data);
    //                 // setIsSpinner(false)
                    
    //                 if (response.ok) {
    //                     if(data.objects.length >0)
    //                     {
    //                         setAudioSrc(data.objects[0].recording_url);
    //                         setTo_Number(data.objects[0].to_number)
    //                         setTranscript('')
    //                         setIsPlayerDis(true)
    //                     }
    //                     else
    //                     {
    //                         setIsPlayerDis(false)
    //                         // toast.error('Recording Not found');
    //                     }
                        
    //                     // setIsAudioPlayer(true)
    //                 } else {
    //                     console.error('Error fetching payments:', data);
    //                 }
    //             } catch (error) {
    //                 console.error('Error during API call:', error);
    //             }
            
    // }
    handlePlay(conversationId);
    },[])

    const formatMonthDate = (dateString:any)=> {

        const date = new Date(dateString);
        date.setMinutes(date.getMinutes()+330);
        // Format components
        const day = String(date.getUTCDate()).padStart(2, '0');
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const month = monthNames[date.getUTCMonth()];
        const year = date.getUTCFullYear();

        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');

        // Final formatted string
        const formatted = `${day}-${month}-${year} ${hours}:${minutes}`;
        return formatted;
    }

    useEffect(()=>{
        const StorageUserData:any = secureLocalStorage.getItem('userData')
        const userData:any = JSON.parse(StorageUserData)
        

        const handleGetConversationLog = async (call_uuid:string)=>{
        // console.log(call_uuid);
        try {
                
            const bearerToken:any = secureLocalStorage.getItem('login');
            const StorageUserData:any = secureLocalStorage.getItem('userData')
            const userData:any = JSON.parse(StorageUserData)
                
// `${url.nodeapipath}/report/commission`

                const response = await fetch(`${url.nodeapipath}/conversation-log/${call_uuid}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Authorization': `Bearer ${bearerToken}`
                    },
                });
                // if (response.status === 401 && response.statusText == 'Unauthorized') {
                //     // Handle session expiration silently
                //     toast.warning('Session Expired.');
                //     logout();
                // }
                const data: any = await response.json();
                // console.log(data.conversation_details);
                // setIsSpinner(false)
                
                if (response.ok) {
                    
                    if(data.conversation_note_log != undefined)
                    {
                        // console.log(data.conversation_note_log);
                        const formatedData = data.conversation_note_log.map((call:any)=>({
                            _id:call._id,
                            conversation_note:call.conversation_note,
                            conversation_note_date:formatMonthDate(call.conversation_note_date),
                            conversation_note_by:call.LoggedBy,
                            conversation_dts_id:call.conversation_dts_id

                        }))
                        // console.log(formatedData);
                        
                        setConversationNoteLog(formatedData)
                    }
                    else
                    {
                        // toast.error('Recording Not found');
                    }
                    
                } else {
                    // console.error('Error fetching recording:', data);
                    // handlePlivoPlay(call_uuid);
                    // toast.error('Recording Not found');
                    if(response.status == 401 && response.statusText == 'Unauthorized' && data.code == 401)
                    {
                        // logout();
                        // toast.warning('Session Expired.');
                        
                    }
                    else
                    {
                        // toast.error('Recording Not found');
                        setIsPlayerDis(false)
                    }
                
                }
            } catch (error) {
                console.error('Error during API call:', error);
            }
        
        }

        handleGetConversationLog(conversationId);
    },[isLogRefersh])

    const handleNotesChange = (e:any)=>{

    }

    const handleNotesSubmit = async ()=>{
        try{
                
            const bearerToken:any = secureLocalStorage.getItem('login');
            const StorageUserData:any = secureLocalStorage.getItem('userData')
            const userData:any = JSON.parse(StorageUserData)
            
            const todaydate = new Date()

            const DataToPost = {
                conversation_note:contanctNotes,
                conversation_note_date:todaydate.toISOString(),
                conversation_note_by:userData.client_id,
                conversation_dts_id:conversationId
            }
            
            const response = await fetch(`${url.nodeapipath}/conversation-log/`, {
                method: 'POST',
                body:JSON.stringify(DataToPost),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Authorization': `Bearer ${bearerToken}`
                },
            });
            // if (response.status === 401 && response.statusText == 'Unauthorized') {
            //     // Handle session expiration silently
            //     toast.warning('Session Expired.');
            //     logout();
            // }
            const data: any = await response.json();
            // console.log(data.conversation_details);
            // setIsSpinner(false)
                
            if (response.ok) {
                    
                if(data.conversation_note_log != undefined)
                {
                    setContactNotes('')
                    setShowNotesForm(!showNotesForm)
                    setisLogRefresh((prev)=> !prev)
                    toast.success(data.message);
                }
                else
                {
                    // toast.error('Recording Not found');
                }
                    
            } else {
                    // console.error('Error fetching recording:', data);
                    // handlePlivoPlay(call_uuid);
                    if(response.status == 401 && response.statusText == 'Unauthorized' && data.code == 401)
                    {
                        logout();
                        toast.warning('Session Expired.');
                        
                    }
                    else
                    {
                        // toast.error('Recording Not found');
                        toast.error('failed To Add notes');

                    }
                // setIsPlayerDis(false)
            }
        } catch (error) {
            console.error('Error during API call:', error);
            // toast.error(error);
        }
    }

  return (
    <>
    <Modal show={callDetailsModel} onHide={()=> togglecallDetailsModel()} className='CallDetailsModal-lg'>
            <div className='CallDetails-header'>
                <Row>
                    <div className='CallDetails-header-lable text-center'>{toNumber} Call Details</div>
                    <div className='CallDetails-header-btn' onClick={()=>togglecallDetailsModel()}><img src={close}/></div>
                    <div className='CallDetails-body'>
                        <Row>
                            
                            <Col xl={7}>
                            <Card>
                                <Card.Body className='CallDetails-info'>
                                    <div className='conversations-info'> Start of the conversations</div> 

                                    <div className='conversations-info'> Call <b>intiated</b> from <b>{from_Number}</b> to <b>{toNumber}</b>.</div>
                                    {(isPlayerDis) && <AudioPlayerComponents src={audioSrc} transcript={transcript} autoPlay={'false'} fileName={`${toNumber}-recording`} /> }
                                </Card.Body>
                            </Card>
                            </Col>
                            <Col xl={5}>
                                <Card >
                                    <Card.Body className='CallDetails-card'>
                                        <h4 className="ContanctDetials-title mt-0 mb-1 ps-2"><b><i className='fas fa-user'/> CONTACT DETAILS</b></h4>
                                        <Table responsive hover className="mb-1">
                                            <tbody>
                                            <tr>
                                                    <td className='info-dts-lable'>First Name</td>
                                                    <td className='info-dts-data'>-</td>
                                                </tr>
                                                <tr>
                                                    <td className='info-dts-lable'>Last Name</td>
                                                    <td className='info-dts-data'>-</td>
                                                </tr>
                                                <tr>
                                                    <td className='info-dts-lable'>Email</td>
                                                    <td className='info-dts-data'>-</td>
                                                </tr>
                                                <tr>
                                                    <td className='info-dts-lable'>Phone Number</td>
                                                    <td className='info-dts-data'>{toNumber}</td>
                                                </tr>
                                                {/* <tr>
                                                    <td className='info-dts-lable'>Total Orders</td>
                                                    <td className='info-dts-data'>-</td>
                                                </tr>
                                                <tr>
                                                    <td className='info-dts-lable'>Address Line</td>
                                                    <td className='info-dts-data'>-</td>
                                                </tr> */}
                                            </tbody>
                                        </Table> 
                                        <div className="transcript-toggle">
                                            <button onClick={() => setShowNotesForm(!showNotesForm)}>
                                                {showNotesForm ? 'Add Note ▲' : 'Add Note ▼'}
                                            </button>
                                        </div>
                                        <div>
                                            {showNotesForm && <div className="transcript-toggle">
                                                <Row>
                                                    <Col md={12}>
                                                        <Form.Group className="mb-2 d-flex">
                                                            {/* <Form.Label style={{width:'25%'}}>Contact Number</Form.Label> */}
                                                            <Form.Control
                                                                type="text"
                                                                placeholder="Enter Note Here"
                                                                value={contanctNotes}
                                                                onChange={(e)=>{setContactNotes(e.target.value);
                                                                }}
                                                                style={{width:'100%'}}
                                                            />
                                                        </Form.Group>
                                                    </Col>                                
                                                </Row>
                                                <Row>
                                                    <Col md={6}>
                                                    </Col>
                                                        <Col md={6} style={{ textAlign:'end' }}>
                                                        <Button style={{ height: '40px', backgroundColor: '#3b3a39',color:'#fff'}} onClick={handleNotesSubmit}>
                                                            Submit
                                                        </Button>
                                                        </Col>
                                                    </Row>
                                            </div>}
                                                {/* [Transcription goes here...] */}
                                        </div>
                                        <br/>
                                        <Accordion className="custom-accordion mb-1" defaultActiveKey="notes" id="accordion">
                                            <Card className="mb-0" key={'notes'}>
                                                <Card.Header>
                                                    <CustomToggle
                                                        eventKey={String('notes')}
                                                        containerClass="m-0 position-relative"
                                                        linkClass="custom-accordion-title text-reset d-block"
                                                    >
                                                        NOTES
                                                        <i className="mdi mdi-chevron-down accordion-arrow"></i>
                                                    </CustomToggle>
                                                </Card.Header>
                                                <Accordion.Collapse eventKey={String('notes')}>
                                                    <Card.Body>{(conversationNoteLog.length >0)?
                                                    conversationNoteLog.map((log:any)=>(
                                                        <>
                                                            <div style={{fontSize:'70%'}}>{log.conversation_note_date} by {log.conversation_note_by}</div>
                                                            <div><b>{log.conversation_note}</b></div>
                                                            <br />    
                                                        </>

                                                    ))
                                                    
                                                    :'No notes available for this contact.'}</Card.Body>
                                                </Accordion.Collapse>
                                            </Card>
                                        </Accordion> 
                                        {/* <Accordion className="custom-accordion mb-1" defaultActiveKey="0" id="accordion">
                                            <Card className="mb-0" key={'tasks'}>
                                                <Card.Header>
                                                    <CustomToggle
                                                        eventKey={String('tasks')}
                                                        containerClass="m-0 position-relative"
                                                        linkClass="custom-accordion-title text-reset d-block"
                                                    >
                                                        TASKS
                                                        <i className="mdi mdi-chevron-down accordion-arrow"></i>
                                                    </CustomToggle>
                                                </Card.Header>
                                                <Accordion.Collapse eventKey={String('tasks')}>
                                                    <Card.Body>No tasks available for this contact.</Card.Body>
                                                </Accordion.Collapse>
                                            </Card>
                                        </Accordion>    */}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    
                    </div>
                </Row>
            </div>    
    </Modal>
    </>
  )
}
