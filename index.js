import * as React from 'react';


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
        case "UPDATE_LIST_DATA":
            return {
                ...state,
                isLoading: false,
                isError: false,
                data: state.data.map(d => d.id === action.payload.id ? {...d, ...action.payload} : d)
            };
        case "UPDATE_DATA":
            return {
                ...state,
                isLoading: false,
                isError: false,
                data: action.payload
            };
        case "DELETE_DATA":
            return {
                ...state,
                isLoading: false,
                isError: false,
                data: state.data.filter((obj) => obj[action.identifier] !== action.payload)
            };
        case "ADD_DATA":
            return {
                ...state,
                isLoading: false,
                isError: false,
                data: [...state.data, action.payload]
            };
        case "ADD_LIST_DATA":
            let newData = state.data.concat(action.payload)

            return {
                ...state,
                isLoading: false,
                isError: false,
                data: newData
            };

        default:
            throw new Error();
    }
};

export const useRestApi = (initialData, headers) => {
    const [state, dispatch] = React.useReducer(dataFetchReducer, {
        isLoading: true,
        isError: false,
        data: initialData,
        error: null
    });

    async function postData(url, contentType, values, useList) {
        dispatch({type: "FETCH_INIT"});
        try {
            if (contentType) {
                headers = {...headers, 'Content-Type': contentType}
            }
            let response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: values,
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error("Network response was not ok.");
            }

            if (useList) {
                dispatch({type: "ADD_LIST_DATA", payload: result.Data});
            } else {
                dispatch({type: "ADD_DATA", payload: result.Data});
            }

        } catch (error) {
            console.log("There has been a problem with your fetch operation: ", error.message);
            dispatch({type: "FETCH_FAILURE", payload: error.message});
        }
    }

    async function putData(url, contentType, values) {
        dispatch({type: "FETCH_INIT"});
        try {
            if (contentType) {
                headers = {...headers, 'Content-Type': contentType}
            }
            let response = await fetch(url, {
                method: 'PUT',
                headers: headers,
                body: values,
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error("Network response was not ok.");
            }

            if (response.status === 200) {
                dispatch({type: 'ADD_DATA', payload: result.Data})
            } else if (response.status === 201) {
                if (Array.isArray(result.Data)){
                    dispatch({type: "UPDATE_LIST_DATA", payload: result.Data});
                } else {
                    dispatch({type: "UPDATE_DATA", payload: result.Data});
                }
            } else {
                throw new Error("Status Code not recognized.");
            }


        } catch (error) {
            console.log("There has been a problem with your fetch operation: ", error.message);
            dispatch({type: "FETCH_FAILURE", payload: error.message});
        }
    }

    async function deleteData(url, identifier) {
        dispatch({type: "FETCH_INIT"});
        try {
            let response = await fetch(url, {
                method: 'DELETE',
                headers: {...headers, 'Content-Type': 'application/json'}
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error("Network response was not ok.");
            }

            dispatch({type: "DELETE_DATA", payload: result.Data, identifier: identifier});
        } catch (error) {
            console.log("There has been a problem with your fetch operation: ", error.message);
            dispatch({type: "FETCH_FAILURE", payload: error.message});
        }
    }

    async function getData(url) {
        dispatch({type: "FETCH_INIT"});
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {...headers, 'Content-Type': 'application/json'}
            });

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


    const api = React.useMemo(() => ({
        putData, deleteData, postData, getData
    }), [putData, deleteData, postData, getData]);

    return [state, api];
};
