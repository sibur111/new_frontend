"use client"
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from 'react';
import http from "../http-common"
import Cookies from "js-cookie";
import DropdownRoles from "../components/DropdownRoles";

const AddUserPage = () => {
    const router : any = useRouter();
    const [accept, setAccept] = useState(false)
    const [log, setLog] = useState('');
    const [pas, setPass] = useState('');
    const [rol, setRol] = useState(null);
    const [usdt, setUsdt] = useState('');
    const adduser = async () => {
        try{
            const token = Cookies.get('token'); 
            const add_response = await http.post('http://127.0.0.1:8000/admin/users/', {
                login : log, 
                password : pas, 
                role : rol, 
                user_data : usdt
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
        } catch(err : any){
          console.log(err.message)
        }
      }

     useEffect(() => {
       const verifyToken = async () => {
      const token = Cookies.get('token'); 

      if (!token) {
        router.push('/#');
        return;
      }

      try {
        const response = await http.get('http://127.0.0.1:8000/auth/verify', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.is_valid) {
          setAccept(true);
        } else {
          Cookies.remove('token');
          router.push('/#');
        }
      } catch (error : any) {
        console.error('Verification failed:', error.message);
        Cookies.remove('token');
        router.push('/#');
      }
    }
      verifyToken();
  }, [router]);

  if (!accept) {
    return <div>Loading...</div>;
  }  

    return (
        <div className="subtitle min-h-screen main bg-white flex items-center justify-center">
            <div className="">
                <div>
                    <p className="ml-20 text-xl text-cyan-50 opacity-70">Логин</p>
                    <input type="text" value={log} onChange={e => setLog(e.target.value)} className="inp text-cyan-50 opacity-70 rounded-lg ml-20 mb-5"></input>
                </div>
                <div>
                    <p className="ml-20 text-xl text-cyan-50 opacity-70">Пароль</p>
                    <input type="text" value={pas} onChange={e => setPass(e.target.value)} className="inp text-cyan-50 opacity-70 rounded-lg ml-20 mb-5"></input>
                </div>
            </div>
            <div className="">
                <div>
                    <p className="ml-20 text-xl text-cyan-50 opacity-70">Роль в системе</p>
                    <DropdownRoles items={["admin", "user"]} defaultText={"Выберите роль"} onSelect={setRol}/>
                </div>
                <div>
                    <p className="ml-20 text-xl text-cyan-50 opacity-70">ФИО</p>
                    <input type="text" value={usdt} onChange={e => setUsdt(e.target.value)} className="inp text-cyan-50 opacity-70 rounded-lg ml-20 mb-5"></input>
                </div>
            </div>
            <button onClick={adduser}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 m-10 hover:bg-gray-300 transition-colors"
        >
          Добавить
            </button>
        </div>
    )
}
export default AddUserPage;