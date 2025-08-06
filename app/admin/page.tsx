"use client"
import { useRouter } from "next/navigation";
import Image from 'next/image'
import DynamicTable from '../components/DynamicTable';
import { Toaster } from "sonner";

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
        const response = await http.get('http://127.0.0.1:8000/auth/verify', {
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
            <div className=" title">
              <Toaster position="top-right" richColors />
      {/* Header */}
      <div className="pt-5 w-full">
      <header className="rounded-3xl mx-10 px-4 py-2 bg-cyan-900 title">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/#">
            <img src="/gibbsite.png" alt="Logo" className="h-8 md:h-10 p-2" />
          </a>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 items-center">
            
            <a
              href="#"
              onClick={LogOut}
              className="font-semibold text-sm md:text-base hover:text-orange-600 transition-colors text-[#D4F0F2]"
            >
              Выйти
            </a>
          </nav>
          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={LogOut}
            aria-label="Toggle menu"
          >Выйти
          </button>
        </div>        
      </header>
      </div>
            </div>
            <div>
            <p className="text-white text-5xl font-semibold mb-20 mt-10 ml-40 ">Панель администратора</p>
            <div className="md:flex md:justify-between">
                <img src={'https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2F72a19f13f63c49f1ba69c3f640c81f50?format=webp&width=800'} className="ml-40"/>
                <div className="flex-col relative mr-40 md:my-0 my-40 mx-auto">
                  <div className="my-10">
                    <button onClick={routering} className=" font-sans mx-40 w-2/3 text-center h-10 flex items-center justify-center font-semibold text-2xl rounded-lg bg-linear-to-r from-orange-600 to-red-600 text-white p-2 active:shadow-none hover:shadow-xl">Подобрать сырье</button>
                  </div>
                  <div className="bottom-0 absolute my-10">
                      <button onClick={addUser} className="font-sans flex items-center justify-center mx-40 text-center w-2/3 h-10 font-semibold text-2xl rounded-lg bg-linear-to-r inp text-white p-2 active:shadow-none hover:shadow-xl">Пользователи</button>
                      <button onClick={dataRouter} className="flex items-center justify-center font-sans mx-40 text-center w-2/3 h-10 font-semibold text-2xl rounded-lg bg-linear-to-r inp text-white p-2 m-5 active:shadow-none hover:shadow-xl">Добавить данные</button>
                  </div>
                </div>
                
            </div>
           </div> 
        </div>
    )
}
export default Admin; 