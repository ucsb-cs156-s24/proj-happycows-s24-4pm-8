import React from "react";
import { commonsNotJoined } from "main/utils/commonsUtils";
import { useBackend } from "main/utils/useBackend";
import { useParams, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCurrentUser } from "main/utils/currentUser";

const useUserInCommons = (commonsId) => {

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


    const commonsNotJoinedList = commonsNotJoined(commons, commonsJoined);
    console.log('Commons not joined:', commonsNotJoinedList);

    let isInCommons = true;
    for (let i = 0; i < commonsNotJoinedList.length; i++) {
        if (commonsNotJoinedList[i].id == commonsId) {
            isInCommons = false;
        }
    }
    //const isInCommons = commonsNotJoinedList.some(map => map.id === commonsId)
    console.log('Is in commons:', isInCommons);

    return isInCommons;
};

const CheckUserInCommons = ({ element: Component }) => { 
    const { commonsId } = useParams();
    const isInCommons = useUserInCommons(commonsId);
    if (!isInCommons) {
        console.log('is in commons:', isInCommons);
        return <Navigate to="/notfound" replace />;
    }

    return <Component />;
};

export default CheckUserInCommons;
