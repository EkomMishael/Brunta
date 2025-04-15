import React from 'react';
import AdminDashboard from './adminDashboard';
import PageNotFound from '../pages/pageNotFound';

function ProtectedRoute({ path, element, allowedRoles, user }) {
    const p=[path, element, allowedRoles, user ]
    console.log('ProtectedRoute',p)
    let returnValue
    user.status===allowedRoles? returnValue=<AdminDashboard /> : returnValue=<PageNotFound /> 
    return returnValue
}

export default ProtectedRoute;
