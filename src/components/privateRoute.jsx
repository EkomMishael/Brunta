import { Route, Navigate } from 'react-router-dom';

function PrivateRoute({ path, element, user }) {
    // Check if the user is authenticated
    if (user) {
        // Render the given element if user is authenticated
        return <Route path={path} element={element} />;
    } else {
        // Redirect to login page if user is not authenticated
        return <Navigate to="/login" replace />;
    }
}

export default PrivateRoute;
