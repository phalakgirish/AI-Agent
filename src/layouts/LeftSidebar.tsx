import { useEffect, useRef, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames';

// helpers
import { getMenuItems } from '../helpers/menu';

// components
import Scrollbar from '../components/Scrollbar';

import AppMenu from './Menu';

// images
import profileImg from '../assets/images/users/user-1.jpg';
import secureLocalStorage from 'react-secure-storage';

/* user box */
const UserBox = () => {
    const navigate = useNavigate();
    const loginvalue = secureLocalStorage.getItem('login');
    const StorageuserData:any = secureLocalStorage.getItem('userData');
    // const userData = JSON.parse(StorageuserData);
    const userData:any = JSON.parse(StorageuserData);
    
    useEffect(()=>{
        if(loginvalue == null || loginvalue == undefined)
        { 
            navigate('/auth/login');
        }
        else if(StorageuserData == null || StorageuserData == undefined)
        {
            navigate('/auth/login');
        }
    },[])
    

    // get the profilemenu
    const ProfileMenus = [
        {
            label: 'My Account',
            icon: 'fe-user',
            redirectTo: '/apps/contacts/profile',
        },
        {
            label: 'Settings',
            icon: 'fe-settings',
            redirectTo: '#',
        },
        {
            label: 'Lock Screen',
            icon: 'fe-lock',
            redirectTo: '/auth/lock-screen',
        },
        {
            label: 'Logout',
            icon: 'fe-log-out',
            redirectTo: '/auth/logout',
        },
    ];

    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

    /*
     * toggle dropdown
     */
    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <div className="user-box text-center" style={{ backgroundColor: '#e3e9ed' }}>
            {/* <img src={profileImg} alt="" title="Mat Helme" className="rounded-circle img-thumbnail avatar-md" />s */}
            <Dropdown show={dropdownOpen} onToggle={toggleDropdown}>
                <Dropdown.Toggle
                    id="dropdown-notification"
                    to="#"
                    as={Link}
                    onClick={toggleDropdown}
                    className="user-name h5 mt-2 mb-1 d-block"
                    style={{ color: '#000' }}
                >
                    {}
                    {(userData !== null)?userData.client_name:''}
                </Dropdown.Toggle>
                <Dropdown.Menu className="user-pro-dropdown">
                    <div onClick={toggleDropdown}>
                        {(ProfileMenus || []).map((item, index) => {
                            return (
                                <Link
                                    to={item.redirectTo}
                                    className="dropdown-item notify-item"
                                    key={index + '-profile-menu'}
                                >
                                    <i className={classNames(item.icon, 'me-1')}></i>
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </Dropdown.Menu>
            </Dropdown>
            <p className=" left-user-info" style={{ color: '#000' }}> {(userData !== null)?(userData.user_role_type == "0")?"Super User":(userData.user_role_type == "1")?"Client":"Staff":''}</p>

            <ul className="list-inline">
                {/* <li className="list-inline-item">
                    <Link to="#" className="text-muted left-user-info">
                        <i style={{ color: 'white' }}
                            className="mdi mdi-cog"></i>
                    </Link>
                </li> */}

                <li className="list-inline-item">
                    <Link to="#">
                        <i style={{ color: '#000' }}
                            className="mdi mdi-power"></i>
                    </Link>
                </li>
            </ul>
        </div>
    );
};

/* sidebar content */
const SideBarContent = () => {
    return (
        <>
            <UserBox />

            <div id="sidebar-menu" style={{ backgroundColor: '#3b3a39' }}>
                <AppMenu menuItems={getMenuItems()} />
            </div>

            <div className="clearfix" />
        </>
    );
};

type LeftSidebarProps = {
    isCondensed: boolean;
};

const LeftSidebar = ({ isCondensed }: LeftSidebarProps) => {
    const menuNodeRef: any = useRef(null);

    /**
     * Handle the click anywhere in doc
     */
    const handleOtherClick = (e: any) => {
        if (menuNodeRef && menuNodeRef.current && menuNodeRef.current.contains(e.target)) return;
        // else hide the menubar
        if (document.body) {
            document.body.classList.remove('sidebar-enable');
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleOtherClick, false);

        return () => {
            document.removeEventListener('mousedown', handleOtherClick, false);
        };
    }, []);

    return (
        <div className="left-side-menu" ref={menuNodeRef} style={{ backgroundColor: '#e3e9ed' }}>
            {!isCondensed && (
                <Scrollbar style={{ maxHeight: '100%' }}>
                    <SideBarContent />
                </Scrollbar>
            )}
            {isCondensed && <SideBarContent />}
        </div>
    );
};

LeftSidebar.defaultProps = {
    isCondensed: false,
};

export default LeftSidebar;
