"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import http from "../http-common";
import Cookies from "js-cookie";

const Admin = () => {
  const router = useRouter();
  const [accept, setAccept] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const LogOut = () => {
    Cookies.remove("token");
    router.replace("/#");
    setIsMobileMenuOpen(false);
  };

  const routering = () => {
    router.push("/start");
  };

  const addUser = () => {
    router.push("/add");
  };

  const dataRouter = () => {
    router.push("/data");
  };

  useEffect(() => {
    const verifyToken = async () => {
      const token = Cookies.get("token");
      if (!token) {
        router.replace("/#");
        return;
      }

      try {
        const response = await http.get("http://127.0.0.1:8000/auth/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.is_valid) {
          setAccept(true);
        } else {
          Cookies.remove("token");
          router.replace("/#");
        }
      } catch (error: any) {
        console.error("Verification failed:", error.message);
        Cookies.remove("token");
        router.replace("/#");
      }
    };
    verifyToken();
  }, [router]);

  if (!accept) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#006771] to-[#023136] text-white">
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

      <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-8 max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-4xl md:text-5xl font-normal subtitle mb-8 sm:mb-12 text-center sm:text-left">
          Панель администратора
        </h1>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="w-full md:w-1/2 flex justify-center md:justify-start">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2F72a19f13f63c49f1ba69c3f640c81f50?format=webp&width=800"
              alt="Admin Panel Image"
              className="max-w-full h-auto w-full sm:w-3/4 md:w-full object-contain"
            />
          </div>
          <div className="w-full md:w-1/2 flex subtitle flex-col items-center md:items-end gap-4">
            <button
              onClick={routering}
              className="w-full sm:w-3/4 md:w-2/3 font-sans font-semibold text-xl sm:text-2xl h-12 flex items-center justify-center rounded-lg bg-gradient-to-r from-orange-600 to-red-600 text-white active:shadow-none hover:shadow-xl"
            >
              Подобрать сырье
            </button>
            <button
              onClick={addUser}
              className="w-full sm:w-3/4 md:w-2/3 font-sans font-semibold text-xl sm:text-2xl h-12 flex items-center justify-center rounded-lg bg-linear-to-r inp  text-white active:shadow-none hover:shadow-xl"
            >
              Пользователи
            </button>
            <button
              onClick={dataRouter}
              className="w-full sm:w-3/4 md:w-2/3 font-sans font-semibold text-xl sm:text-2xl h-12 flex items-center justify-center rounded-lg bg-linear-to-r inp  text-white active:shadow-none hover:shadow-xl"
            >
              Добавить данные
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;