import React from "react";
import { commonsNotJoined } from "main/utils/commonsUtils";
// import NotFoundPage from "main/pages/NotFoundPage";
import { useBackend } from "main/utils/useBackend";
import { useParams, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCurrentUser } from "main/utils/currentUser";

const useUserInCommons = (commonsId) => {

    // these lines are defining commonsjoined and setCommonsJoined
    // Stryker disable next-line all: it is acceptable to exclude useState calls from mutation testing
    const [commonsJoined, setCommonsJoined] = useState([]);
    const { data: currentUser } = useCurrentUser();

    // Stryker disable all : TODO: restructure this code to avoid the need for this disable
    // this does something for setCommonsJoined... not sure what 
    useEffect( 
        () => {
        if (currentUser?.root?.user?.commons) {
            setCommonsJoined(currentUser.root.user.commons);
        }
        }, [currentUser]
    );

    // Stryker disable all : it is acceptable to exclude useBackend calls from mutation testing
    // this is for commons ?
    const { data: commons } =
        useBackend(
            ["/api/commons/all"],
            { url: "/api/commons/all" },
            []
    );

    // create the not joined list to reference 
    const commonsNotJoinedList = commonsNotJoined(commons, commonsJoined);

    // return true if joined, false if not joined 
    return !commonsNotJoinedList.includes(commonsId);
};

// this function will take in the page to deploy and info about current user in curuser object 
const ProtectedRoute = ({ element: Component, currentUser }) => { 
    const { commonsId } = useParams();

    if (!useUserInCommons(currentUser, commonsId)) {
        return <Navigate to="/notfound" replace />;
    }

    return <Component />;
};

export default ProtectedRoute;
