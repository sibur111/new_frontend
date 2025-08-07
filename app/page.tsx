"use client";
import { useRouter } from "next/navigation";
import React, { useState, useRef } from "react";
import http from "./http-common";
import { Toaster, toast } from "sonner";
import Cookies from "js-cookie";

interface LoginData {
  name: string;
  password: string;
}

const Mainpage = () => {
  const router = useRouter();
  const [login_log, setLogin] = useState("");
  const [notfound, setNotFound] = useState(false);
  const [password_log, setPassword] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const sectionRef1 = useRef<HTMLElement | null>(null);
  const sectionRef2 = useRef<HTMLElement | null>(null);
  const sectionRef3 = useRef<HTMLElement | null>(null);
  const [admin, setAdmin] = useState(false);
  const [user, setUser] = useState(false);

  const verifyToken = async () => {
    const token = Cookies.get("token");
    try {
      const responsetoken = await http.get("http://127.0.0.1:8000/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (responsetoken.data.role == "user"){
                toast("successful login")
                router.push("/home");
              }
              else{
                toast("successful login")
                router.push("/admin");
              }
      
    } catch (error: any) {
      console.error("Verification failed:", error.message);
      Cookies.remove("token");
    }
  };

  const upload = async (e: React.FormEvent) => {
    if (login_log == "" || password_log == ""){
      alert("Все поля должны быть заполнены")
    }
    else{
      e.preventDefault()
      http.post("/auth/login", { username: login_log, password: password_log} )
        .then(response => {
          Cookies.set('token', response.data.access_token, { expires: 7 })
          if (response.data){
            console.log(response.data)
            verifyToken();
          }
            
    })
        .catch(err => {
          console.log(err);
           if (err.response.status == 404 || err.response.status == 401){
            console.log("incorrect an email or a password")}
            setNotFound(true);
      });
    
  };
  }
  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

    return (
    <div className="min-h-screen auth text-white">
      <Toaster position="top-right" richColors />
      {/* Header */}
      <div className="pt-5">
      <header className="rounded-3xl mx-10 px-4 py-2 bg-cyan-900 title">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/#">
            <img src="/gibbsite.png" alt="Logo" className="h-8 md:h-10 p-2" />
          </a>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 items-center">
            <a
              href="#"
              onClick={() => scrollToSection(sectionRef1)}
              className="font-semibold text-sm md:text-base hover:text-orange-600 transition-colors"
            >
              Как это работает?
            </a>
            <a
              href="#"
              onClick={() => scrollToSection(sectionRef2)}
              className="font-semibold text-sm md:text-base hover:text-orange-600 transition-colors"
            >
              FAQ
            </a>
            <a
              href="#"
              onClick={() => scrollToSection(sectionRef3)}
              className="font-semibold text-sm md:text-base hover:text-orange-600 transition-colors"
            >
              Войти
            </a>
          </nav>
          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden flex flex-col space-y-4 p-4 bg-cyan-900 rounded-b-lg">
            <a
              href="#"
              onClick={() => {
                scrollToSection(sectionRef1);
                toggleMenu();
              }}
              className="font-semibold text-base hover:text-orange-600 transition-colors"
            >
              Как это работает?
            </a>
            <a
              href="#"
              onClick={() => {
                scrollToSection(sectionRef2);
                toggleMenu();
              }}
              className="font-semibold text-base hover:text-orange-600 transition-colors"
            >
              FAQ
            </a>
            <a
              href="#"
              onClick={() => {
                scrollToSection(sectionRef3);
                toggleMenu();
              }}
              className="font-semibold text-base hover:text-orange-600 transition-colors"
            >
              Войти
            </a>
          </nav>
        )}
      </header>
      </div>

      {/* Hero Section */}
      <section
        className="bg-[url('https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2F689deeb4666c4067bc7611d0e0e6506a?format=webp&width=800')] bg-no-repeat bg-contain bg-center mt-8 md:mt-40 py-12 px-4 flex flex-col items-center"
      >
        <img src="/gibbsite.png" alt="Gibbsite" className="h-12 md:h-16 mb-6" />
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-normal">
            Сервис для автоматического подбора сырья
          </h1>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        ref={sectionRef1}
        className="flex md:flex-row items-center justify-center mx-auto py-8 px-4 md:px-8 md:max-w-3/4 md:mt-40"
      >
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2F797b43e33b054d31870a53751f6e3a2e?format=webp&width=800"
          alt="Illustration"
          className="md:w-2/3 w-[40%] max-w-md mb-6 md:mb-0 md:mr-8 ml-10"
        />
        <div className="mx-10 text-left">
          <h2 className="text-4xl md:text-6xl font-semibold text-orange-600 mb-4">
            Как это работает?
          </h2>
          <p className="text-2xl md:text-3xl">
            Вы вводите данные о требуемом носителе, а мы автоматически подбираем сырье и условия
            приготовления.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section ref={sectionRef2} className="py-8 px-4 md:px-8 md:max-w-3/4 mx-auto md:mt-40">
        <h2 className="text-4xl md:text-4xl font-bold mb-8 text-center md:text-left">
          Часто задаваемые вопросы
        </h2>
        <div className="flex md:flex-row md:items-center justify-between">
          <div className="space-y-6 w-full md:w-2/3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2Fd6971021b459450ca4d463e000052a01?format=webp&width=800"
                alt="FAQ Icon"
                className="w-12 h-12 mb-4 sm:mb-0 sm:mr-4"
              />
              <div>
                <h3 className="text-lg md:text-2xl font-bold mb-2">
                  Сколько времени занимает подбор сырья?
                </h3>
                <p className="text-base md:text-lg">
                  Расчет необходимых сырьевых продуктов происходит почти моментально.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2F577a843b1fd2406dbf34cca3805a79b3?format=webp&width=800"
                alt="FAQ Icon"
                className="w-12 h-12 mb-4 sm:mb-0 sm:mr-4"
              />
              <div>
                <h3 className="text-lg md:text-2xl font-bold mb-2">
                  Сервис делает расчет стоимости производства носителя?
                </h3>
                <p className="text-base md:text-lg">
                  Пока нет, но сейчас эта функция в разработке.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2F47ccdd39fe5940ff8b5c3a86a6978c66?format=webp&width=800"
                alt="FAQ Icon"
                className="w-12 h-12 mb-4 sm:mb-0 sm:mr-4"
              />
              <div>
                <h3 className="text-lg md:text-2xl font-bold mb-2">
                  Что делать, если сервис не нашел подходящее сырье?
                </h3>
                <p className="text-base md:text-lg">
                  Попробуйте расширить диапазон характеристик или обратитесь в поддержку.
                </p>
              </div>
            </div>
          </div>
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2F43cc893d38f440c2998892fed2c1bbe2?format=webp&width=800"
            alt="FAQ Illustration"
            className="md:w-2/3 w-[40%] max-w-md object-contain mb-6 md:mb-0 md:mr-8 md:mx-10 hidden md:block"
          />
        </div>
      </section>

      {/* Login Section */}
      <section
        ref={sectionRef3}
        className="py-8 px-4 flex justify-center md:mt-40"
      >
        <form
          className="w-full max-w-md bg-white p-6 rounded-3xl shadow-lg "
        >
          <h2 className="text-2xl md:text-3xl font-bold text-orange-600 mb-6 title text-left">
            Авторизация
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              value={login_log}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Логин"
              className="w-full p-3 border-2 border-teal-600 rounded-lg text-teal-600 focus:ring-2 focus:ring-teal-900 focus:outline-none"
            />
            <input
              type="password"
              value={password_log}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              className="w-full p-3 border-2 border-teal-600 rounded-lg text-teal-600 focus:ring-2 focus:ring-teal-900 focus:outline-none"
            />
          </div>
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              onClick={upload}
              className="title w-full md:w-1/2 bg-red-500 text-white font-semibold text-lg p-3 rounded-lg hover:bg-red-600 active:bg-red-700 transition-colors"
            >
              Войти
            </button>
          </div>
          {notfound && (
            <div className="flex items-center mt-4 justify-center">
              <img src="/info.png" alt="Warning" className="w-5 h-5 mr-2" />
              <p className="text-sm text-red-600">Неверный логин или пароль</p>
            </div>
          )}
        </form>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 md:mt-40 ">
        <div className="flex flex-col md:mx-auto sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
          <img src="/gibbsite.png" alt="Gibbsite" className="h-12 w-1/7 object-contain" />
          <img
            src="/Sibur_logo_RU_RGB.png"
            alt="Sibur"
            loading="lazy"
            className="h-12 w-1/6 object-contain"
          />
          <img src="/logo_header.png" alt="Logo" className="h-12 w-1/6 object-contain" />
        </div>
      </footer>
    </div>
  );
}
export default Mainpage;
