import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Button, Form, FormText, InputGroup, Tab, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../../hooks';
import url from '../../env';
import secureLocalStorage from 'react-secure-storage';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import TableComponent from '../../components/TableComponent';
import SoftRoundedButton from '../uikit/Buttons/SoftRoundedButton';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
// import '../../assets/scss/style.scss'
import CallDetailsModal from './CallDetailsModel';
import AudioPlayerComponents from '../../components/AudioPlayerComponent';
type Option = string | Record<string, any>;

const AllConversationHotLeadList = () => {

    const [data, setData] = useState<any>([]);
    const navigate = useNavigate();
    const StorageuserData:any = secureLocalStorage.getItem('userData');
    const userData:any = JSON.parse(StorageuserData);

    const [toNumber, setToNumber] = useState('')
    const [startDate, setStartDate] = useState<string>('');
    const [startSelectedDate, setStartSelectedDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [endSelectedDate, setEndSelectedDate] = useState<string>('');
    const [showPicker, setShowPicker] = useState<boolean>(false);
    const [isSpinner,setIsSpinner] = useState(false)
    const [pagelimit,setPagelimit] = useState(20)
    const [pageNo,setPageNo] = useState(1)
    const [recordCount,setRecordCount] = useState<any>()
    const [isAudioplayer,setIsAudioPlayer] = useState(false)
    const [audioSrc,setAudioSrc] = useState<string>('')
    const [callDetailsModel,setCallDetailsModal] = useState(false)
    const [call_uuid, setCall_uuid] = useState('')
    const [to_number, setTo_Number] = useState('')
    const boxRef = useRef<HTMLDivElement>(null);
    const [isSearch, setIsSearch] = useState(false);
    const [transcript, setTranscript] = useState<string>('');
    const [conversationId, setConversationId] = useState('')

    const logout =()=>{
        secureLocalStorage.removeItem('login');
        secureLocalStorage.removeItem('userData')
        navigate('/auth/login');
    }

    const togglecallDetailsModel = (call_uuid:any,to_number:any,conversation_id:any)=>{
        setCall_uuid(call_uuid)
        setTo_Number(to_number)
        setConversationId(conversation_id)
        setCallDetailsModal(!callDetailsModel)
    }

    const columns:any = [
        {
            Header: 'Sr. No',
            accessor: 'srNo',
            sort: true,
        },
        {
            Header: 'Contact Number',
            accessor: 'to_number',
            sort: true,
            Cell: ({ row }: { row: any }) => (
                <>
                    <span
                        onClick={() => togglecallDetailsModel(row.original.call_uuid,row.original.to_number,row.original._id)}
                        className='to-number'
                    >
                        {row.original.to_number}
                    </span>
                </>
            ),
        },
                {
            Header: 'Call Direction',
            accessor: 'call_direction',
            sort: true,
        },
        {
            Header: 'Call State',
            accessor: 'call_state',
            sort: true,
        },
        {
            Header: 'Call Initiation Time',
            accessor: 'initiation_time',
            sort: true,
        },
        {
            Header: 'Call Answer Time',
            accessor: 'answer_time',
            sort: true,
        },
        {
            Header: 'Call End Time',
            accessor: 'end_time',
            sort: true,
        },
        {
            Header: 'Call Duration',
            accessor: 'call_duration',
            sort: true,
        },
        {
            Header: 'Note',
            accessor: 'note',
            sort: true,
        },
        {
            Header: 'Recording',
            accessor: 'recording',
            Cell: ({ row }: { row: any }) => (
                // (row.original.call_duration == '00:00' || row.original.hangup_source == 'Plivo' || row.original.hangup_source == 'Error')?'':
                <>
                    <Button
                        variant="primary"
                        onClick={() => handlePlay(row.original._id,row.original.to_number)}
                        style={{borderRadius: '35px',
                            width: '38px',
                            padding: '7px 7px'}}
                    >
                        <i className='fe-play' style={{padding:'17% 24%'}}/>
                    </Button>
                </>
            ),
        },
    ];

    const handlePlay = async (call_uuid:string,to_number:string)=>{
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

                const data: any = await response.json();
                // console.log(data.conversation_details);
                // setIsSpinner(false)
                
                if (response.ok) {
                    
                    if(data.conversation_details != undefined)
                    {
                        //${url.nodeapipath}
                        // console.log(`${url.nodeapipath}/recording/${data.conversation_details.recording_url}`);
                        
                        setAudioSrc(`${url.servernodeapipath}/recording/${data.conversation_details.recording_url}`);
                        setTo_Number(to_number)
                        setTranscript((data.conversation_details.transcription ?? '').replace(/\[Customer\]/g, '<b>[Customer]:</b>')
    .replace(/\[Ai_Agent\]/g, '<b>[Ai_Agent]:</b>').replace(/\n/g,'<br><br>'))
                        setIsAudioPlayer(true)
                    }
                    else
                    {
                        toast.error('Recording Not found');
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
                        toast.error('Recording Not found');
                    }
                    
                }
            } catch (error) {
                // console.error('Error during API call:', error);
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
    //                 // console.log(data);
    //                 // setIsSpinner(false)
                    
    //                 if (response.ok) {
    //                     if(data.objects.length >0)
    //                     {
    //                         setAudioSrc(data.objects[0].recording_url);
    //                         setTo_Number(data.objects[0].to_number)
    //                         setTranscript('')
    //                         setIsAudioPlayer(true)
    //                     }
    //                     else
    //                     {
    //                         setIsAudioPlayer(false)
    //                         toast.error('Recording Not found');
    //                     }
                        
    //                     // setIsAudioPlayer(true)
    //                 } else {
    //                     console.error('Error fetching payments:', data);
    //                 }
    //             } catch (error) {
    //                 console.error('Error during API call:', error);
    //             }
            
    // }

    const convertSecondIntoMinutes = (sec:any)=>{
        const minutes = Math.floor(sec / 60); // 2
        const seconds = sec % 60;             // 47

        const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        return formatted
    }

    const Excelcolumns:any = ['Sr. No','Contact Number','Call Direction','Call State','Call Initiation Time','Call Answer Time','Call End Time','Call Duration','Note']

    const togglePicker = () => setShowPicker(!showPicker);

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {     
            setStartDate(`${e.target.value}`);
            setStartSelectedDate(e.target.value)
            // setData([]);
        };
    
        const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setEndDate(`${e.target.value}`);
            setEndSelectedDate(e.target.value)
            // setData([]);
        };
    
        const handleClear = () => {
            setStartDate('');
            setEndDate('');
            setShowPicker(false);
            setData([]);
            setPageNo(0)
        };

        const handelAudioPlayEnd = ()=>{
            setIsAudioPlayer(false)
            setAudioSrc('')
        }

    usePageTitle({
        title: 'All Hot Lead Conversations',
        breadCrumbItems: [
            {
                path: '/all-conversationhotlist',
                label: 'Conversion List',
                active: true,
            },
        ],
    });

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
    }
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

    // useEffect(() => {
    //     fetchPayments();
    // }, []);

    useEffect(()=>{
        // const bearerToken = secureLocalStorage.getItem('login');
        // document.addEventListener('click', handelAudioPlayEnd);

        const handleClickOutside = (event: MouseEvent) => {
            if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
                handelAudioPlayEnd();
            }
        };

        document.addEventListener('click', handleClickOutside);
        
        fetchCallList(false);

        // fetchCallexcelList()
 
    },[pagelimit,pageNo])

    // const handleClientChange = (e:any)=>{
    //     handleFetchSIPMember(e.target.value);
    //     var clientname = clients.filter((item)=> item._id == e.target.value)
    //     setClientsName((clientname.length>0)?clientname[0].client_name:'');
    // }

    const handleNumberChange = (e:any)=>{
        if(e.target.value.length>0)
        {
            setToNumber(e.target.value);
            // setPageNo(0);
        }
        else
        {
            setToNumber('');
            setData([]);
            setPageNo(0);
            
        } 
    }

    const fetchCallList = async (search?:any) => {
        setIsSpinner(true);   
        try {
                
            const bearerToken:any = secureLocalStorage.getItem('login');
            const StorageUserData:any = secureLocalStorage.getItem('userData')
            const userData:any = JSON.parse(StorageUserData)
            // console.log(userData);
            
            var queryString:any = ''
            if(search == true)
            {
                if(pageNo != 1)
                {
                    setPageNo(1);
                    return;
                }
                
            }

            if(pageNo == 0)
            {
                setPageNo(prev => prev === 1?1:1)
                return;
            }
            
            var offset:any = (pageNo-1)*pagelimit
            queryString = `${queryString}client_id=${userData.client_id}&call_lead=true&limit=${pagelimit}&offset=${offset}`
            
            if(toNumber !== '')
            {
                queryString = `${queryString}&to_number=${toNumber}`
            }
            if(endDate !== '' && startDate !== '')
            { 
                queryString = `${queryString}&startDate=${startDate}&endDate=${endDate}`
            }


                // const response = await fetch(`${url.plivoapipath}/${userData.client_authid}/Call?${queryString}`, {
                //     method: 'GET',
                //     headers: {
                //         'Content-Type': 'application/json',
                //         'Access-Control-Allow-Origin': '*',
                //         'Authorization': 'Basic ' + btoa(`${userData.client_authid}:${userData.client_authtoken}`),
                //     },
                // });

                const response = await fetch(`${url.nodeapipath}/conversation?${queryString}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Authorization': `Bearer ${bearerToken}`
                    },
                });

                const data: any = await response.json();
                // setIsSpinner(false)
                // console.log(data.conversation_details);
                
                
                if (response.ok) {
                    const formattedData = data.conversation_details.map((call:any, index:any,) => ({
                        srNo: offset+index+ 1,
                        _id:call._id,
                        to_number:`${call.to_number}`,
                        call_state:call.call_state,
                        initiation_time:formatMonthDate(call.initiation_time),
                        call_direction:call.call_direction,
                        answer_time:(call.answer_time == null)?'':formatMonthDate(call.answer_time),
                        end_time:(call.end_time == null)?'':formatMonthDate(call.end_time),
                        call_duration:convertSecondIntoMinutes(call.call_duration),
                        call_uuid:call.call_uuid,
                        note:call.note
                        // hangup_source:call.hangup_source
                    }));

                    setRecordCount(data.conversation_details_count)

                    setData(formattedData);

                    setIsSpinner(false);
                } else {
                    if(response.status == 401 && response.statusText == 'Unauthorized' && data.code == 401)
                    {
                        logout();
                        toast.warning('Session Expired.');
                        
                    }
                    else
                    {
                        console.error('Error fetching payments:', data);
                    }
                    
                }
            } catch (error) {
                console.error('Error during API call:', error);
            }
    };

    // const fetchCallexcelList = async () => {
    //     try {

    //             const response = await fetch(`https://dev.matdata.co/v2/registration/excel/voters?searchquery=pravin`, {
    //                 method: 'GET',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'Access-Control-Allow-Origin': '*',
    //                 },
    //             });
                
    //             if (response.ok) {

    //                     console.log(response.body);
                        
    //                     const blob = await response.blob();
    //                     console.log(blob);
                        
    //                     const url = window.URL.createObjectURL(blob);
    //                     const link = document.createElement("a");
    //                     link.href = url;
    //                     link.setAttribute("download", "export.xlsx"); // file name
    //                     document.body.appendChild(link);
    //                     link.click();
    //                     link.remove();
    //                     window.URL.revokeObjectURL(url);
    //             } else {
    //                 console.error('Error fetching payments:', data);
    //             }
    //         } catch (error) {
    //             console.error('Error during API call:', error);
    //         }
    // };

        const handleSearchPayment = ()=>{
            setData([])
            setIsSearch(true)
            fetchCallList(true);
        }
        const handleExportPayment = ()=>{
            if(data.length == 0)
                return;

            exportToExcel(columns,Excelcolumns,data,`All Conversion List${(toNumber != '')?`-${toNumber}`:''}.xlsx`)
        }

    const sizePerPageList = [
        { text: '5', value: 5 },
        { text: '10', value: 10 },
        { text: '15', value: 15 },
        { text: '20', value: 20 },
    ];



    const exportToExcel = (columns:any,columnHeader:any, data:any, fileName:any) => {
        // console.log(data);
        
        // Create a new workbook
        const workbook = XLSX.utils.book_new();
    
        // Map the data to an array of objects with the specified column names
        const worksheetData = data.map((item:any) =>
            columns.reduce((acc:any, column:any) => {
                acc[column.Header] = item[column.accessor];
                return acc;
            }, {})
        );
    
        // Convert the data to a worksheet
        const worksheet = XLSX.utils.json_to_sheet(worksheetData, { header: columnHeader });
    
        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
        // Generate Excel file and download it
        XLSX.writeFile(workbook, fileName);
    };

    return (
        <Row style={{ marginTop: '25px' }}>
            <Col>
                <Card className='' style={{boxShadow: 'none !important'}}>
                    <Card.Body>
                        {/* <div className="d-flex justify-content-between">
                            <div>
                                <h4 className="header-title">All Conversations List</h4>
                                <p className="text-muted font-14">A table showing all conversations list report</p>
                            </div>
                        </div>
                        <hr /> */}
                        <div className="mb-1">
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-2 d-flex">
                                            <Form.Label style={{width:'25%'}}>Contact Number</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter To Contact Number"
                                                onChange={(e)=>{handleNumberChange(e)}}
                                                style={{width:'85%'}}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-2 d-flex">
                                            <Form.Label style={{width:'10%'}}>Date</Form.Label>
                                            <InputGroup style={{width:'90   %'}}>
                                                <Form.Control
                                                type="text"
                                                placeholder="Select date range"
                                                value={startDate && endDate ? `${startDate} to ${endDate}` : ''}
                                                readOnly
                                                onClick={togglePicker}
                                                style={{zIndex:0}}
                                                />
                                                <Button variant="outline-secondary" onClick={handleClear}>
                                                Clear
                                                </Button>
                                            </InputGroup>

                                            {showPicker && (
                                                <div className="mt-2 border p-3" style={{    
                                                    position: "absolute",
                                                width: "43%",
                                                right: "1.9%",
                                                top: "3.2%",
                                                background: '#fff',
                                                zIndex: '2'}}>
                                                <div className='d-flex'>
                                                    <Form.Group style={{width:'50%'}}>
                                                        <Form.Label>Start Date</Form.Label>
                                                        <Form.Control
                                                        type="datetime-local"
                                                        value={startSelectedDate}
                                                        onChange={handleStartDateChange}
                                                        />
                                                    </Form.Group>
                                                    <Form.Group style={{width:'50%'}}>
                                                        <Form.Label>End Date</Form.Label>
                                                        <Form.Control
                                                        type="datetime-local"
                                                        value={endSelectedDate}
                                                        onChange={handleEndDateChange}
                                                        // min={startDate} // Prevent selecting an end date before the start date
                                                        />
                                                    </Form.Group>
                                                </div>
                                                <Button
                                                    className="mt-3"
                                                    variant="primary"
                                                    onClick={() => setShowPicker(false)}
                                                >
                                                    Done
                                                </Button>
                                                </div>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                    </Col>
                                    <Col md={6} style={{ textAlign:'end' }}>
                                        <Button style={{ height: '40px', backgroundColor: '#3b3a39'}} onClick={handleSearchPayment}>
                                                Search
                                        </Button>
                                        &nbsp;
                                        <Button style={{ height: '40px', backgroundColor: '#05711e'}} onClick={handleExportPayment}>
                                                Export
                                        </Button>
                                    </Col>
                                </Row>
                        </div>
                        <TableComponent
                            columns={columns}
                            data={data}
                            pageSize={5}
                            sizePerPageList={sizePerPageList}
                            isSortable={true}
                            isSearch={isSearch}
                            isSearchable={false}
                            pagination={false}
                            isSpinner={isSpinner}
                            pageLimit = {pagelimit}
                            pageNo = {pageNo}
                            recordCount = {recordCount}
                            setPageLimit = {setPagelimit}
                            setPageNo = {setPageNo}
                            setRecordCount = {setRecordCount}
                        />
                        {(isAudioplayer) &&
                        <>
                        <div className='audio-player-div' ref={boxRef}>
                            {/* <AudioPlayer
                                autoPlay
                                src={audioSrc}
                                onPlay={(e:any) => console.log("onPlay")}
                                onEnded={handelAudioPlayEnd}
                                // other props here                  
                            /> */}
                            <AudioPlayerComponents src={audioSrc} transcript={transcript} fileName={`${to_number}-recording`} autoPlay={'true'} transcriptClass={'transcript-div'} onEnded={handelAudioPlayEnd}/>
                        </div>
                        </>
                        }

                        {callDetailsModel   && <CallDetailsModal callDetailsModel={callDetailsModel} togglecallDetailsModel={togglecallDetailsModel} call_uuid={call_uuid} toNumber={to_number} conversationId={conversationId}/>}
                    </Card.Body>
                </Card>
            </Col>
            <ToastContainer/>
        </Row>
    );
};

export default AllConversationHotLeadList;
