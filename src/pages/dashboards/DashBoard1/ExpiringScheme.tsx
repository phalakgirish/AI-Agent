import { Badge, Card, Dropdown, Table } from 'react-bootstrap';

// type
import { ProjectDetail } from './types';
import { useEffect, useState } from 'react';
import url from '../../../env';
import secureLocalStorage from 'react-secure-storage';
type ProjectsProps = {
    projectDetails: ProjectDetail[];
};

const ExpiringScheme = ({ projectDetails }: ProjectsProps) => {
    const [data,setData] = useState<any>([]);

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
    }

    useEffect(()=>{
            const bearerToken = secureLocalStorage.getItem('login');
            const fetchDashboard = async()=>{
                try {
                    const response = await fetch(`${url.nodeapipath}/report/expiring-scheme`,{
                        method:'GET',
                        headers: {
                            'Content-Type':'application/json',
                            'Access-Control-Allow-Origin':'*',
                            'Authorization': `Bearer ${bearerToken}`
                            }
                    });
                    const data = await response.json();
                    // console.log(data);   
                    
                    if (response.ok) {
                            console.log(data);

                            const formattedData = data.referenceSchemepayment_dts.map((payment:any, index:any) => ({
                                srNo: index + 1,
                                client_id:payment.client_id,
                                client_name:payment.client_name,
                                reference_scheme:payment.reference_scheme,
                                reference_category:payment.reference_category,
                                ref_payment_expirationDate: formatDate(new Date(payment.ref_payment_expirationDate)),
                            }));

                            setData(formattedData);
    
                            
                    } else {
                        console.error('Error fetching branches:', data);
                    }
                } catch (error) {
                    console.error('Error during API call:', error);
                }
            }
            fetchDashboard()
        },[])
    return (
        <Card>
            <Card.Body>
                <h4 className="header-title  mt-0 mb-2">count of expiring clients schemes in 1 month</h4>
                {(data.length > 0)?
                    <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
                        {/* <table className="mb-0 project-info table">
                            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#F9FAFD' }}>
                                <tr>
                                    <th>#</th>
                                    <th>Client Id</th>
                                    <th>Client Name</th>
                                    <th>Scheme</th>
                                    <th>Scheme Category</th>
                                    <th>Expiring Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data || []).map((projectDetail:any, index:any) => {
                                    return (
                                        <tr key={index.toString()}>
                                            <td>{projectDetail.srNo}</td>
                                            <td>{projectDetail.client_id}</td>
                                            <td>{projectDetail.client_name}</td>
                                            <td>{projectDetail.reference_scheme}</td>
                                            <td>{projectDetail.reference_category}</td>
                                            <td>{projectDetail.ref_payment_expirationDate}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table> */}
                        {data.length}
                    </div>
                    
                :<div className="d-flex justify-content-center dashboard-scheme-not-found-wrapper">
                    0
                </div> }   
            </Card.Body>
        </Card>
    );
};

export default ExpiringScheme;
