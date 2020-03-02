import {useMemo, useReducer} from "react";


const dataFetchReducer = (state, action) => {
    switch (action.type) {
        case "FETCH_INIT":
            return {
                ...state,
                isLoading: true,
                isError: false
            };
        case "FETCH_SUCCESS":
            return {
                ...state,
                isLoading: false,
                isError: false,
                data: action.payload
            };
        case "FETCH_FAILURE":
            return {
                ...state,
                isLoading: false,
                isError: true,
                data: [],
                message: action.payload
            };
        case "UPDATE_DATA":
            return {
                ...state,
                isLoading: false,
                isError: true,
                data: state.data.map(d => d.id === action.payload.id ? {...d, ...action.payload} : d)
            };
        case "DELETE_DATA":
            return {
                ...state,
                isLoading: false,
                isError: true,
                data: state.data.filter((obj) => obj !== action.payload)
            };
        case "ADD_DATA":
            return {
                ...state,
                isLoading: false,
                isError: true,
                data: [...state.data, action.payload]
            };

        default:
            throw new Error();
    }
};


export const useRestApi = (initialData) => {


    const [state, dispatch] = useReducer(dataFetchReducer, {
        isLoading: true,
        isError: false,
        data: initialData,
        error: null
    });


    async function postData(url, values) {
        dispatch({type: "FETCH_INIT"});
        try {
            let response = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(values),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error("Network response was not ok.");
            }

            dispatch({type: "ADD_DATA", payload: result.Data});
        } catch (error) {
            console.log("There has been a problem with your fetch operation: ", error.message);
            dispatch({type: "FETCH_FAILURE", payload: error.message});
        }
    }

    async function putData(url, values) {
        dispatch({type: "FETCH_INIT"});
        try {
            let response = await fetch(url, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(values),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error("Network response was not ok.");
            }

            dispatch({type: "UPDATE_DATA", payload: result.Data});
        } catch (error) {
            console.log("There has been a problem with your fetch operation: ", error.message);
            dispatch({type: "FETCH_FAILURE", payload: error.message});
        }
    }

    async function deleteData(url) {
        dispatch({type: "FETCH_INIT"});
        try {
            let response = await fetch(url, {
                method: 'DELETE',
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error("Network response was not ok.");
            }

            dispatch({type: "DELETE_DATA", payload: result.Data});
        } catch (error) {
            console.log("There has been a problem with your fetch operation: ", error.message);
            dispatch({type: "FETCH_FAILURE", payload: error.message});
        }
    }

    async function getData(url) {
        dispatch({type: "FETCH_INIT"});
        try {
            const response = await fetch(url, {});

            const result = await response.json();
            if (!response.ok) {
                throw new Error("Network response was not ok.");
            }

            dispatch({type: "FETCH_SUCCESS", payload: result.Data});
        } catch (error) {
            console.log("There has been a problem with your fetch operation: ", error.message);
            dispatch({type: "FETCH_FAILURE", payload: error.message});
        }
    }


    const api = useMemo(() => ({
        putData, deleteData, postData, getData
    }), [putData, deleteData, postData, getData]);

    return [state, api];
};
