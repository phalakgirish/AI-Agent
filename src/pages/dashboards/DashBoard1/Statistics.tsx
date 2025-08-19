import { Col, Row } from 'react-bootstrap';

// component
import StatisticsWidget1 from '../../../components/StatisticsWidget1';
import StatisticsWidget2 from '../../../components/StatisticsWidget2';
import { useEffect, useState } from 'react';
import url from '../../../env';
import secureLocalStorage from 'react-secure-storage';


const Statistics = () => {

    const[thisMonthMember,setThisMonthMember] = useState<number>(0)
    const[thisMonthMemberPer,setThisMonthMemberPer] = useState<number>(0)
    const[totalSIPMembers,setTotalSIPMember] = useState<number>(0)



    useEffect(()=>{
        const bearerToken = secureLocalStorage.getItem('login');
        const fetchDashboard = async()=>{
            try {
                const response = await fetch(`${url.nodeapipath}/dashboard`,{
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
                        // console.log(data);
                        setThisMonthMember(data.thisMemberCount);
                        setThisMonthMemberPer(data.thisMonthMemberPer);
                        setTotalSIPMember(data.totalSIPMember);

                        
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
        <Row>
            <Col xl={3} md={6}>
                <StatisticsWidget1
                    title="This Month Member"
                    data={thisMonthMemberPer}
                    stats={thisMonthMember}
                    color={'#f05050'}
                    subTitle=""
                />
            </Col>
            <Col xl={3} md={6}>
                <StatisticsWidget2
                    variant="success"
                    title="Total SIP Member"
                    trendValue="32%"
                    trendIcon="mdi mdi-trending-up"
                    stats={totalSIPMembers}
                    subTitle=""
                    progress={77}
                />
            </Col>
            <Col xl={3} md={6}>
                <StatisticsWidget1
                    title="This Month Collection"
                    color={'#ffbd4a'}
                    data={80}
                    stats={4569}
                    subTitle=""
                />
            </Col>
            <Col xl={3} md={6}>
                <StatisticsWidget2
                    variant="pink"
                    title="Today's Collection"
                    trendValue="32%"
                    trendIcon="mdi mdi-trending-up"
                    stats={158}
                    subTitle=""
                    progress={77}
                />
            </Col>
        </Row>
    );
};

export default Statistics;
