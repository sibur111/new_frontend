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
    const [error, setError] = useState('');

    const adduser = async () => {
        // Check if all required fields are filled
        if (!log.trim() || !pas.trim() || !rol || !usdt.trim()) {
            setError('Все поля должны быть заполнены');
            return;
        }

        try {
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
            });
            // Clear form and error on successful submission
            setLog('');
            setPass('');
            setRol(null);
            setUsdt('');
            setError('');
            router.push('/add');
        } catch(err : any){
            console.log(err.message);
            setError('Ошибка при добавлении пользователя');
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
        <div className="min-h-screen flex main flex-col items-center justify-center">
          <div className="flex flex-wrap justify-center">
              <div className="m-5">
                <div className="mb-5">
                    <p className="text-xl text-cyan-50 opacity-70">Логин</p>
                    <input 
                        type="text" 
                        value={log} 
                        onChange={e => setLog(e.target.value)} 
                        className="inp text-cyan-50 opacity-70 rounded-lg max-h-60 py-2"
                    />
                </div>
                <div>
                    <p className="text-xl text-cyan-50 opacity-70">Пароль</p>
                    <input 
                        type="text" 
                        value={pas} 
                        onChange={e => setPass(e.target.value)} 
                        className="inp text-cyan-50 opacity-70 rounded-lg max-h-60 py-2"
                    />
                </div>
            </div>
            <div className="m-5">
                <div className="mb-5">
                    <p className="text-xl text-cyan-50 opacity-70">Роль в системе</p>
                    <DropdownRoles 
                        items={["admin", "user"]} 
                        defaultText={"Выберите роль"} 
                        onSelect={setRol}
                    />
                </div>
                <div>
                    <p className="text-xl text-cyan-50 opacity-70">ФИО</p>
                    <input 
                        type="text" 
                        value={usdt} 
                        onChange={e => setUsdt(e.target.value)} 
                        className="inp text-cyan-50 opacity-70 rounded-lg max-h-60 py-2"
                    />
                </div>
            </div>
          </div>
          <div className="my-4 flex justify-center">
            <button 
                onClick={adduser}
                className="active:shadow-none hover:shadow-xl font-sans font-semibold text-xl rounded-lg bg-red-600 text-white p-2"
            >
                Добавить
            </button>
          </div>
          {error && (
              <div className="flex items-center mt-2">
                  <img src="/info.png" alt="Warning" className="w-6 h-6 mr-2" />
                  <p className="text-sm text-white  inline">{error}</p>
                </div>
          )}
        </div>
    )
}
export default AddUserPage;