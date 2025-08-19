import { useRef, useEffect, forwardRef, useState } from 'react';
import {
    useTable,
    useSortBy,
    usePagination,
    useRowSelect,
    useGlobalFilter,
    useAsyncDebounce,
    useExpanded,
    TableInstance
} from 'react-table';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

// components
import Pagination from './Pagination';
import Spinner from './Spinner';



type TableProps = {
    isSearchable?: boolean;
    isSortable?: boolean;
    pagination?: boolean;
    isSpinner?:boolean;
    isSearch?:boolean;
    sizePerPageList?: {
        text: string;
        value: number;
    }[];
    columns: {
        Header: any;
        accessor: string;
        sort?: boolean;
        Cell?: any;
        className?: string;
    }[];
    data: any[];
    pageSize?: number;
    searchBoxClass?: string;
    tableClass?: string;
    theadClass?: string;
    pageLimit?: number;
    pageNo?: number;
    recordCount?: number;
    searchQuery?:string;
    setPageLimit: React.Dispatch<React.SetStateAction<number>>;
    setPageNo : React.Dispatch<React.SetStateAction<number>>;
    setRecordCount? : React.Dispatch<React.SetStateAction<number>>;
    setSearchQuery? : (value: string) => void;
};

const TableComponent = (props: TableProps) => {
    const isSearchable = props['isSearchable'] || false;
    const isSortable = props['isSortable'] || false;
    const sizePerPageList = props['sizePerPageList'] || [];
    // const pagination = true;
    const pagination = props['pagination'] || false;
    const [activePage,setActivePage] = useState<number>(props['pageNo'] ||1);
    var recordCount:any = props['recordCount'] ||0;
    var pageLimit:any = props['pageLimit']||5;
    const [tablePageLimit, setTablePageLimit] = useState<number>(props['pageLimit']||5)
    const[pages,setPages] = useState((recordCount%tablePageLimit == 0)?(recordCount/tablePageLimit)-1:Math.floor(recordCount/tablePageLimit))
    let otherProps: any = {};
    // var fromRecord:any = (recordCount==0)?0:1
    const [fromRecord,setFromRecord] = useState((recordCount==0)?0:1)
    const [toRecord,setToRecord] = useState((recordCount==0)?0:props['pageLimit']||tablePageLimit)
    // var toRecord = (recordCount==0)?0:props['pageLimit']||tablePageLimit
    const isSpinner = props['isSpinner']
    const isSearch = props['isSearch']
    const [search, setSearch] = useState('')

    // if (isSearchable) {
    //     otherProps['useGlobalFilter'] = useGlobalFilter;
    // }
    if (isSortable) {
        otherProps['useSortBy'] = useSortBy;
    }

    useEffect(()=>{
        
        setPages((recordCount%tablePageLimit == 0)?(recordCount/tablePageLimit)-1:Math.floor(recordCount/tablePageLimit))
        // console.log(recordCount);
        
        if(recordCount > 0)
        {
            // if(activePage == props['pageNo'])
            // {
            //     setFromRecord((((props['pageNo']==0)?1:props['pageNo'] - 1) * pageLimit)+1)
            //     setToRecord((((((props['pageNo']==0)?1:props['pageNo'] - 1) * pageLimit))+pageLimit < tablePageLimit)?(((props['pageNo'] || 1 - 1) * pageLimit))+pageLimit:(recordCount < tablePageLimit))
            // }
            // else
            // {
                setFromRecord(1)
                setToRecord((recordCount < tablePageLimit)?recordCount:tablePageLimit)
            // }
            
            
            if(isSearch == true)
            {
                setActivePage(1)
            }
            
        }
        
        
    },[props['recordCount'],props['isSearch']])
    const dataTable = useTable(
        {
            columns: props['columns'],
            data: props['data'],
            // initialState: { pageSize: props['pageLimit'] || 5 },
        },
        otherProps.hasOwnProperty('useSortBy') && otherProps['useSortBy'],
        otherProps.hasOwnProperty('useExpanded') && otherProps['useExpanded'],
        otherProps.hasOwnProperty('usePagination') && otherProps['usePagination'],
        otherProps.hasOwnProperty('useRowSelect') && otherProps['useRowSelect'],
    );

    const changePage = (page: number) => {
        setActivePage(page)
        props.setPageNo(page)
        var previous_page = page - 1
        setFromRecord(((previous_page*tablePageLimit+1)<=1)?1:previous_page*tablePageLimit+1)
        // fromRecord = ((previous_page*tablePageLimit+1)<=1)?1:previous_page*tablePageLimit+1
        setToRecord((page*tablePageLimit >= recordCount)?recordCount:page*tablePageLimit)
        // toRecord = (page*tablePageLimit >= recordCount)?recordCount:page*tablePageLimit
        if ((pages+1) === page) {
            return;
        } 
    };

    const handelSearchchange = (value:any)=>{
        setSearch(value);
        props.setSearchQuery?.(value);
        props.setPageNo(0);
        props.setRecordCount?.(0)
        setActivePage(1)
    }


    let rows = dataTable.rows;

    const PageLimitChange = (e:any)=>{
        // setTablePageLimit(e.target.value)
        // props.setPageLimit(e.target.value)
        // console.log(Math.floor(recordCount/e.target.value))
        setPages(Math.floor(recordCount/e.target.value))
        props.setPageNo(1)
        setActivePage(1)
        setFromRecord((recordCount == 0)?0:1)
        // fromRecord = (recordCount == 0)?0:1
        // console.log(recordCount);
        // console.log(e);
        
        setToRecord((recordCount == 0)?0:(recordCount < e.target.value)?recordCount:e.target.value)
        // toRecord = (recordCount == 0)?0:e.target.values
        // props.setPageLimit()
        // console.log(e.target.value);
        
    }

    return (
        <>
            {(isSearchable) && 
            <div >
                <span className="d-flex align-items-center">
                    Search :{' '}
                    <input
                        type="search"
                        value={search || ''}
                        onChange={(e: any) => {
                            handelSearchchange(e.target.value);
                        }}
                        placeholder={`${recordCount} records...`}
                        className="form-control w-auto ms-1"
                    />
                </span>
            </div>}
            
            <div className="table-responsive tableComponent-wrapper">
                <table
                    {...dataTable.getTableProps()}
                    className={classNames('table table-centered react-table', props['tableClass'])}
                >
                    <thead className={props['theadClass']}>
                        {(dataTable.headerGroups || []).map((headerGroup: any) => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {(headerGroup.headers || []).map((column: any) => (
                                    <th
                                        {...column.getHeaderProps(column.sort && column.getSortByToggleProps())}
                                        className={classNames({
                                            sorting_desc: column.isSortedDesc === true,
                                            sorting_asc: column.isSortedDesc === false,
                                            sortable: column.sort === true,
                                        })}
                                    >
                                        {column.render('Header')}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    
                        
                    <tbody {...dataTable.getTableBodyProps()}>
                        {(isSpinner)?
                        <tr>
                            <td colSpan={dataTable.columns.length}>             
                                <div className="d-flex justify-content-center">
                                    <Spinner key={'1'} className="m-2" color={'secondary'} type="bordered" size="lg"/>
                                </div>
                            </td>
                        </tr>
                        :
                        (dataTable['data'].length > 0) ?
                        (rows || []).map((row: any, i: number) => {
                            dataTable.prepareRow(row);
                            return (
                                <tr {...row.getRowProps()}>
                                    {(row.cells || []).map((cell: any) => {
                                        return (
                                            <td
                                                {...cell.getCellProps([
                                                    {
                                                        className: cell.column.className,
                                                    },
                                                ])}
                                            >
                                                {cell.render('Cell')}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        }):
                        <tr style={{borderBottom:'none'}}>
                            <td colSpan={dataTable.columns.length}>             
                                <div className="d-flex justify-content-center">
                                    No Data Found
                                </div>
                            </td>
                        </tr>}
                    </tbody>
                    
                
                
                </table>
                {/* {(isSpinner)?'':
                (dataTable.data.length >0)?'':
                <div className="d-flex justify-content-center">
                    No Data Found
                </div>
                } */}
                
                {/* tablePagination */}
            </div>
            <div className="d-lg-flex align-items-center text-center ">
                            <ul className="pagination pagination-rounded d-inline-flex ms-auto align-item-center mb-0">
                                {/* <li>
                                    {sizePerPageList.length > 0 && (
                                        <div className="d-inline-block me-3">
                                            <label className="me-1">Display :</label>
                                            <select
                                                value={tablePageLimit}
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                    PageLimitChange(e)
                                                    var Limit = Number(e.target.value)
                                                    setTablePageLimit(Limit)
                                                    // props.pageLimit = Number(e.target.value);
                                                    props.setPageLimit(Number(e.target.value))
                                                }}
                                                className="form-select d-inline-block w-auto"
                                            >
                                                {(sizePerPageList || []).map((pageSize, index) => {
                                                    return (
                                                        <option key={index.toString()} value={pageSize.value}>
                                                            {pageSize.text}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    )}
                                </li> */}
                                <li
                                    key="prevpage"
                                    className={classNames('page-item', 'paginate_button', 'previous','pe-2', {
                                        disabled: true,
                                    })}
                                >
                                    <Link to="#" className="page-link">
                                        {fromRecord} - {toRecord} of {recordCount}
                                    </Link>
                                </li>
                                <li
                                    key="prevpage"
                                    className={classNames('page-item', 'paginate_button', 'previous', {
                                        disabled: activePage === 1,
                                    })}
                                    onClick={() => {
                                        if (activePage === 1) return;
                                        changePage(activePage - 1);
                                    }}
                                >
                                    <Link to="#" className="page-link">
                                        <i className="mdi mdi-chevron-left"></i>
                                    </Link>
                                </li>
                                {/* <li
                                    key={page}
                                    className={classNames('page-item', 'd-none', 'd-xl-inline-block', {
                                        active: activePage === page,
                                    })}
                                    onClick={(e: React.FormEvent<HTMLLIElement>) => changePage(page)}
                                >
                                    <Link to="#" className="page-link">
                                        {page}
                                    </Link>
                                </li> */}
                                <li
                                    key="nextpage"
                                    className={classNames('page-item', 'paginate_button', 'next', {
                                        disabled: (activePage === pages+1 || recordCount === 0),
                                    })}
                                    onClick={() => {
                                        if (activePage === pages+1) return;
                                        changePage(activePage + 1);
                                    }}
                                >
                                    <Link to="#" className="page-link">
                                        <i className="mdi mdi-chevron-right"></i>
                                    </Link>
                                </li>
                            </ul>
            </div>
        </>
    );
};

export default TableComponent;
