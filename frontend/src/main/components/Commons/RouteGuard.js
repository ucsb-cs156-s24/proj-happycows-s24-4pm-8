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
    // Stryker disable all : it is acceptable to exclude useBackend calls from mutation testing
    const { data: commons } =
        useBackend(
            ["/api/commons/all"],
            { url: "/api/commons/all" },
            []
    );

    // Stryker disable all : TODO: restructure this code to avoid the need for this disable
    useEffect(() => {
        if (currentUser?.root?.user?.commons) {
            setCommonsJoined(currentUser.root.user.commons);
        }
        }, [currentUser]);

    // create the not joined list to reference 
    const commonsNotJoinedList = commonsNotJoined(commons, commonsJoined); // - FAILING HERE, LIST IS EMPTY
    console.log('Commons not joined:', commonsNotJoinedList);

    // return true if joined, false if not joined - 
    const isInCommons = !commonsNotJoinedList.includes(commonsId);
    console.log('Is in commons:', isInCommons);

    return isInCommons;
};

// this function will take in the page to deploy and info about current user in curuser object 
const ProtectedRoute = ({ element: Component }) => { 
    const { commonsId } = useParams();
    const isInCommons = useUserInCommons(commonsId);
    //console.log('is in commons:', isInCommons);

    if (!isInCommons) {
        return <Navigate to="/notfound" replace />;
    }

    return <Component />;
};

export default ProtectedRoute;
