"use client"
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from 'react';
import http from "../http-common"
import Cookies from "js-cookie";
import { Toaster, toast } from "sonner";

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
            <div className=" title flex justify-center items-center">
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
            <div className="relative md:pr-40">
              <div className="flex items-center justify-center">
              <div className="bg-[url('https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2F689deeb4666c4067bc7611d0e0e6506a?format=webp&width=800')]  bg-no-repeat bg-contain md:mx-auto mt-20 md:w-1/3">
                  <img src={'/gibbsite.png'} className="tracking tracking-wide mb-4 mt-10"></img>
                  <div className="mb-20">
                      <p className="text-2xl text-white text-right">элементарно и полезно</p>
                  </div>
              </div>
              <img loading="lazy" 
              src={"https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2Fcf46ccfc6e794492a909499a1fff43fb?format=webp&width=800"} 
              alt="chemistry" className="mt-20 hidden md:block"/>
              </div>
              <div className="flex justify-center items-center md:mr-20 md:mt-0 mt-40">
                <button onClick={routing} className="absolute  bottom-0 font-sans w-1/2 md:w-1/5 font-semibold text-2xl rounded-lg bg-linear-to-r from-orange-600 to-red-600 text-white p-2 active:shadow-none hover:shadow-xl">Начать работу</button>
              </div>
              
            </div>
        </div>
    )
}
export default Homepage;