import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import CommonsForm from "main/components/Commons/CommonsForm";
import { Navigate } from 'react-router-dom'
import { toast } from "react-toastify"

import { useBackendMutation } from "main/utils/useBackend";

const AdminCreateCommonsPage = () => {

    const objectToAxiosParams = (newCommons) => ({
        url: "/api/commons/new",
        method: "POST",
        data: newCommons
    });

    const onSuccess = (commons) => {
        toast(<div>Commons successfully created!
            <br />{`id: ${commons.id}`}
            <br />{`name: ${commons.name}`}
            <br />{`startDate: ${commons.startingDate}`}
            <br />{`lastDate: ${commons.lastDate}`}
            <br />{`cowPrice: ${commons.cowPrice}`}
            <br />{`capacityPerUser: ${commons.capacityPerUser}`}
            <br />{`carryingCapacity: ${commons.carryingCapacity}`}
        </div>);
    }
    
    const onError = (error) => {
        // Stryker disable next-line OptionalChaining : we want to check if each nested object is there but we dont want to write tests for each specific case
        if (error.response?.data?.message) {
            toast.error(error.response.data.message);
        } 
        else if (error.response.data == "CANNOT HAVE SAME COMMON NAME") {
            const nameElem = document.getElementById("name");
            nameElem.classList.add("is-invalid");
            nameElem.nextElementSibling.innerHTML = "That commons already exists. Please choose another name.";
        }
        else {
            const errorMessage = `Error communicating with backend via ${error.response.config.method} on ${error.response.config.url}`;
            toast.error(errorMessage);
        }
    }

    // Stryker disable all
    const mutation = useBackendMutation(
        objectToAxiosParams,
        { onSuccess, onError },
        // Stryker disable next-line all : hard to set up test for caching
        ["/api/commons/all"]
    );
    // Stryker restore all

    const submitAction = async (data) => {
        mutation.mutate(data);
    }


    if (mutation.isSuccess) {
        return <Navigate to="/" />
    }

    return (
        <BasicLayout>
            <h2>Create Commons</h2>
            <CommonsForm
                submitAction={submitAction}
            />
        </BasicLayout>
    );
};

export default AdminCreateCommonsPage;