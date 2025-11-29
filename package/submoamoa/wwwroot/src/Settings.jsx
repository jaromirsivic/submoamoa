import React from 'react';
import { Outlet } from 'react-router-dom';

const Settings = () => {
    return (
        <div className="page-container">
            <p>Settings page content.</p>
            <Outlet />
        </div>
    );
};

export default Settings;
