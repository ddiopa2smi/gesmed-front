import { API_URL } from "../constants/environment.constants";
import axios from "axios";
import { message } from "antd";

export const auth = async (payload) => {
    try {
        const response = await axios.post(`${API_URL}/api/User/Connect`, payload);
        return response;
    } catch (error) {
        message.error(error.message);
        console.log(error);
    }
}

export const getActions = async (url) => {
    try {
        const response = await axios.get(`${API_URL}${url}` , {
            headers : {
                //user_id: "ddiop"
                user_id : JSON.parse(sessionStorage.getItem("userConnected"))?.login,
                username : JSON.parse(sessionStorage.getItem("userConnected"))?.username ,

            }
        });
        return response; 
    } catch (error) {
        //message.error("Oops, quelque chose s'est mal passée");
        message.error(error.message);
        console.log(error);
    }
}

export const postActions = async (url , payload) => {
    try {
        const response = await axios.post(`${API_URL}${url}` , payload , {
            headers : {
                //user_id: "ddiop"
                user_id : JSON.parse(sessionStorage.getItem("userConnected"))?.login ,
                username : JSON.parse(sessionStorage.getItem("userConnected"))?.username ,
                Authorization : ` Bearer ${JSON.parse(sessionStorage.getItem("userConnected"))?.login}`
            }
        });
        return response; 
    } catch (error) {
        //message.error("Oops, quelque chose s'est mal passée");
        message.error(error.message);
        console.log(error);
    }
}

export const putActions = async (url , payload) => {
    try {
        const response = await axios.put(`${API_URL}${url}` , payload , {
            headers : {
                //user_id: "ddiop"
                user_id : JSON.parse(sessionStorage.getItem("userConnected"))?.login ,
                username : JSON.parse(sessionStorage.getItem("userConnected"))?.username ,
                desc : JSON.parse(sessionStorage.getItem("userConnected"))?.desc || "" 
            }
        });
        return response; 
    } catch (error) {
        //message.error("Oops, quelque chose s'est mal passée");
        message.error(error.message);
        console.log(error);
    }
}

export const deleteActions = async (url) => {
    try {
        const response = await axios.delete(`${API_URL}${url}`, {
            headers : {
                //user_id: "ddiop"
                user_id : JSON.parse(sessionStorage.getItem("userConnected"))?.login,
                username : JSON.parse(sessionStorage.getItem("userConnected"))?.username ,

            }
        });
        return response; 
    } catch (error) {
        //message.error("Oops, quelque chose s'est mal passée");
        message.error(error.message);
        console.log(error);
    }
}