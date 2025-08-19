import React, { useEffect, useRef } from 'react';
import { Card, Col, Row, Button, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { OrgChart } from 'd3-org-chart';

interface OrgChartProps {
  data: any;
}

interface HierarchyNode<T> {
    data: T;
    children: HierarchyNode<T>[];
    depth: number;
    parent: HierarchyNode<T> | null;
  }

interface OrgChartData {
    id: string;
    parentId: string | null;
    name: string;
    totalInvestedAmount: number;
    totalRecurringCommission: number;
    totalSpotCommission: number;
    sipJoinDate: string;
    months: number;
  } 

const transformDataForOrgChart = (data: any): OrgChartData[] => {
    // console.log(data)
    return data.map((item:any) => ({
      id: item._id,
      parentId: (item.generation >0)?item.referredClient_id:null,
      name: `${item.client_id}, ${item.client_name}`,
      totalInvestedAmount: item.total_invested_amount,
      totalRecurringCommission: item.total_recurring_commission,
      totalSpotCommission: item.total_spot_commission,
      sipJoinDate: item.sipJoinDate,
      months: item.months,
    }));
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
}
const OrganizationalChart: React.FC<OrgChartProps> = ({ data }) => {
    const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartContainerId = 'chart-container';

  const transformedData = transformDataForOrgChart(data);
// console.log(transformedData);

  

  useEffect(() => {
    // if (chartContainerRef.current) {
      const chart = new OrgChart()
        .container(`#${chartContainerId}`)
        .data(transformedData)
        .nodeWidth(() => 250)
        .nodeHeight(() => 80)
        .nodeContent((node:any)=>{
            const d = node.data;
            return (`<div style="padding: 2px; border: 1px solid #ccc; border-radius: 5px; text-align:center;background-color:#fff">
                <h4>${d.name}</h4>
                <p><span>${formatDate(new Date(d.sipJoinDate))}</span>, <span>${d.totalInvestedAmount}</span>, <span>${d.totalSpotCommission}</span>, 
                <span>${d.totalRecurringCommission}</span></p>
              </div>`)
            }
        )
        .render();
    // }
  }, [transformedData]);

  return <div ref={chartContainerRef} id={chartContainerId} style={{ width: '100%', height: 'auto' }}></div>;
};

export default OrganizationalChart;
