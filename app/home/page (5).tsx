"use client"
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from 'react';
import http from "../http-common"
import Cookies from "js-cookie";

const Homepage = () => {
    const router : any = useRouter();
    const [accept, setAccept] = useState(false)
    const routing = () =>{
        router.push("/start");
    }
     useEffect(() => {
       const verifyToken = async () => {
      const token = Cookies.get('token'); 

      if (!token) {
        router.push('/#');
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
  const LogOut = () => {
      Cookies.remove('token')
      router.replace('/#')
    }
    return (
        <div className="subtitle min-h-screen main">
            <div className="pt-5 title flex justify-center items-center">
              <header className="hidden md:flex items-center parent mx-auto px-10 py-1 w-full text-sm text-white bg-cyan-900 max-w-[1026px] rounded-2xl md:rounded-full max-md:px-5 max-md:max-w-full">
              <a href="/#">
                <img src={'/gibbsite.png'} className="h-5 m-2" />
              </a>
              <nav className="ml-auto items-center p-2">
                <a href="#" onClick={LogOut} className="font-sans font-semibold hover:text-orange-600 transition-colors duration-200">Выйти</a>
              </nav>
            </header>
            </div>
            <div className="relative pr-40">
              <div className="flex">
              <div className="bg-[url('https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2F689deeb4666c4067bc7611d0e0e6506a?format=webp&width=800')] bg-no-repeat bg-contain mx-auto mt-20 w-1/3">
                  <img src={'/gibbsite.png'} className="tracking tracking-wide mb-4 mt-10"></img>
                  <div className="mb-20">
                      <p className="text-2xl text-white text-right">элементарно и полезно</p>
                  </div>
              </div>
              <img loading="lazy" 
              src={"https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2Fcf46ccfc6e794492a909499a1fff43fb?format=webp&width=800"} 
              alt="chemistry" className="mt-20"/>
              </div>
              <div className="flex justify-center items-center mr-20">
                <button onClick={routing} className="absolute bottom-0 font-sans w-1/4 font-semibold text-2xl rounded-lg bg-linear-to-r from-orange-600 to-red-600 text-white p-2 active:shadow-none hover:shadow-xl">Начать работу</button>
              </div>
              
            </div>
        </div>
    )
}
export default Homepage;