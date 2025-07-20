"use client"
import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';
import DynamicTable from '../components/DynamicTable';
import Cookies from "js-cookie";
import http from "../http-common"

const AddUser = () => {
  
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [error, setError] = useState(null);

    const getToken = async () => {
        let token = Cookies.get('token');
        if (!token) {
            const r = await http.post('http://127.0.0.1:8000/auth/token', {username: "temp_admin", password: "1234"});
            token = r.data.access_token;
            if (token) {
                Cookies.set('token', token);
            }
        }
        return token;
    };

    useEffect(() => {
        
        const upload = async () => {
            try {
                const token = await getToken();
                const response = await fetch('http://127.0.0.1:8000/admin/table/{table_name}?model_name=userprofile', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const d = await response.json();
                setColumns(d.colums); 
                console.log(columns)// <-- вот сюда сохраняем headers
                setData(d.data || []);
                console.log(data) // <-- если есть данные для таблицы
            } catch (err : any) {
                setError(err.message);
            }
        };
        upload();
    }, []); 
    const router = useRouter();
    const routing = () => {
      router.push("/adduser");
    }
    return (
        <div className="start subtitle min-h-screen ">
            <DynamicTable headers={columns} data={data} />
            <button onClick={routing}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 m-10 hover:bg-gray-300 transition-colors"
        >
          Добавить пользователя 
        </button>
            {error && <div style={{color: 'red'}}>{error}</div>}
        </div>
    )
}
export default AddUser;