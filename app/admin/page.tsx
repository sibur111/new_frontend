"use client"
import { useRouter } from "next/navigation";
import Image from 'next/image'
import DynamicTable from '../components/DynamicTable';


import { useState, useRef, useEffect } from 'react';
import http from "../http-common"
import Cookies from "js-cookie";

const Admin = () => {

    const LogOut = () => {
      Cookies.remove('token')
      router.replace('/#')
    }
    const router = useRouter();
    const [accept, setAccept] = useState(false)
    const routering = () => {
        router.push("/start")
    }
    const addUser = () => {
        router.push("/add")
    }
    const dataRouter = () => {
        router.push("/data")
    }
    useEffect(() => {
       const verifyToken = async () => {
       const token = Cookies.get('token'); 

      if (!token) {
        router.replace('/#');
        return;
      }

      try {
        const response = await http.get('/auth/verify', {
          headers: {      
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.is_valid) {
          setAccept(true);
        } else {
          Cookies.remove('token');
          router.replace('/#');
        }
      } catch (error : any) {
        console.error('Verification failed:', error.message);
        Cookies.remove('token');
        router.replace('/#');
      }
    }
      verifyToken();
  }, [router]);

  if (!accept) {
    return <div>Loading...</div>; 
  }  
    return (
        <div className="admin subtitle min-h-screen ">
            <div className="pt-5 title">
              <header className="hidden md:flex items-center parent mx-auto px-10 py-1 w-full text-sm text-white bg-cyan-900 max-w-[1026px] rounded-2xl md:rounded-full max-md:px-5 max-md:max-w-full">
              <a href="/#">
                <img src={'/gibbsite.png'} className="h-5 m-2" />
              </a>
              <nav className="ml-auto items-center p-2">
                <a href="#" onClick={LogOut} className="font-sans font-semibold hover:text-orange-600 transition-colors duration-200">Выйти</a>
              </nav>
            </header>
            </div>
            <p className="text-white text-5xl font-semibold mb-20 mt-10 ml-40 ">Панель администратора</p>
            <div className="flex justify-between">
                <img src={'https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2F72a19f13f63c49f1ba69c3f640c81f50?format=webp&width=800'} className="ml-40"/>
                <div className="flex-col relative mr-40">
                  <div>
                    <button onClick={routering} className=" font-sans mx-40 w-2/3 text-center h-10 flex items-center justify-center font-semibold text-2xl rounded-lg bg-linear-to-r from-orange-600 to-red-600 text-white p-2 active:shadow-none hover:shadow-xl">Подобрать сырье</button>
                  </div>
                  <div className="bottom-0 absolute">
                      <button onClick={addUser} className="font-sans flex items-center justify-center mx-40 text-center w-2/3 h-10 font-semibold text-2xl rounded-lg bg-linear-to-r inp text-white p-2 active:shadow-none hover:shadow-xl">Пользователи</button>
                      <button onClick={dataRouter} className="flex items-center justify-center font-sans mx-40 text-center w-2/3 h-10 font-semibold text-2xl rounded-lg bg-linear-to-r inp text-white p-2 m-5 active:shadow-none hover:shadow-xl">Добавить данные</button>
                  </div>
                </div>
                
            </div>
            
        </div>
    )
}
export default Admin; 