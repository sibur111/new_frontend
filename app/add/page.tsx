"use client"
import { useRouter} from "next/navigation";

import { useState, useRef, useEffect } from 'react';
import DynamicTable from '../components/DynamicTable';
import Cookies from "js-cookie";
import http from "../http-common"

const AddUser = () => {
    const [data, setData] = useState(null);
    const [colum, setColums] = useState(null);
    const [error, setError] = useState(null);
    const getToken = async () => {
        let token = Cookies.get('token');
        if (!token) {
          // Получаем новый токен
          const r = await http.post('http://127.0.0.1:8000/auth/token', {username: "temp_admin", password: "1234"});
          token = r.data.access_token;
          if (token) {
            Cookies.set('token', token);
          }
        }
        return token;
      };

    const upload = async () => {
        try {
            const token = await getToken();
            const response = await fetch('http://127.0.0.1:8000/admin/table/{table_name}?model_name=userprofile', {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }); // Замените на ваш URL
            if (!response.ok) {
              throw new Error('Failed to fetch data');
            }
            const d = await response.json();
            setColums(d.colums);
            console.log(colum);
        }catch(err : any) {
            setError(err.message);
          }
        };
        upload();
    const router = useRouter();
    const headers = ['ID', 'Имя', 'Email', 'Роль', 'Дата регистрации'];
    
    return (
        <div className="start subtitle min-h-screen ">
        </div>
    )
}
export default AddUser;