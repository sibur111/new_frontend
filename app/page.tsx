"use client"
import { useRouter } from "next/navigation"
import React, { useState, useRef} from 'react';
import http from "./http-common"
import { Toaster, toast } from "sonner";
import Cookies from 'js-cookie'

interface up{
  name: string,
  password: string,
}

const Mainpage = () => {
    const router = useRouter()
    const [login_log, setLogin] = useState("");
    var [notfound, setNotFound] = useState(false);
    const [password_log, setPassword] = useState("");
    const sectionRef1 = useRef(null);
    const sectionRef2 = useRef(null);
    const sectionRef3 = useRef(null);
    function routing(){
      router.push("/home");
    }
    const verifyToken = async () => {
            const token = Cookies.get('token'); 
            try {
              const responsetoken = await http.get('https://sibur-selection-ghataju.amvera.io/auth/verify', {
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
            } catch (error : any) {
              console.error('Verification failed:', error.message);
              Cookies.remove('token');
            }
          }
    const upload = (e:any) => {
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
    }
    const scrollToSection = (ref : any) => {
      ref.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    };
    return (
          <div className='home'>
            <div className="pt-5 title">
              <header className="hidden md:flex items-center parent mx-auto px-10 py-1 w-full text-sm text-white bg-cyan-900 max-w-[1026px] rounded-2xl md:rounded-full max-md:px-5 max-md:max-w-full">
              <a href="/#">
                <img src={'/gibbsite.png'} className="h-5" />
              </a>
              <nav className="ml-auto items-center p-2">
                <a href="#" onClick={() => scrollToSection(sectionRef1)} className="mr-12 font-semibold hover:text-orange-600 transition-colors duration-200">Как это работает?</a>
                <a href="#" onClick={() => scrollToSection(sectionRef2)} className="mr-12 font-semibold hover:text-orange-600 transition-colors duration-200">FAQ</a>
                <a href="#" onClick={() => scrollToSection(sectionRef3)} className="font-sans font-semibold hover:text-orange-600 transition-colors duration-200">Войти</a>
              </nav>
            </header>
            </div>
            <header className="bg-[url('https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2F689deeb4666c4067bc7611d0e0e6506a?format=webp&width=800')] bg-no-repeat bg-contain mx-auto mt-20 w-fit">
                <img src={'/gibbsite.png'} className="-ml-20 tracking tracking-wide mb-4 mt-10"></img>
                <div className="mb-20">
                    <p className="text-5xl text-white">сервис для автоматического</p>
                    <p className="text-5xl text-white -mr-20 text-right">подбора сырья</p>
                </div>
            </header>
            <div className="flex mt-80 lg:ml-5 max-md:w-full ml-60 mb-60 bg-no-repeat bg-contain">
              <img
                loading="lazy"
                src={"https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2F797b43e33b054d31870a53751f6e3a2e?format=webp&width=800"}
                className="grow w-[25%] ml-40 max-md:mt-10"
                alt="Недвижимость"/>
              <section ref={sectionRef1} className="mx-20 py-12 text-left">
                <h2 className="text-5xl font-semibold text-orange-600 mb-8">Как это работает?</h2>
                <p className="text-4xl font-normal text-white mb-8 mr-14">Вы всего лишь вводите данные о требуемом носителе, а мы автоматически подбираем для него сырье и условия приготовления</p>
              </section>
            </div>
            <section className="mx-20 text-white">
              <h2 ref={sectionRef2} className="text-5xl font-bold mb-12 text-left">Часто задаваемые вопросы</h2>
              <div className="flex justify-between">
                <div className="space-y-8">
                  <div className="flex items-center mb-10">
                    <img
                    loading="lazy"
                    src={"https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2Fd6971021b459450ca4d463e000052a01?format=webp&width=800"} className="w-20"/>
                    <div>
                      <h3 className="text-3xl ml-10 font-bold mb-2">Сколько времени занимает подбор сырья?</h3>
                      <p className="ml-5 text-2xl w-2/3">В нашем сервисе задействован ИИ, поэтому расчет необходымых сырьевых продуктов происходит почти моментально.</p>
                    </div>
                  </div>
                  <div className="flex items-center mb-10">
                    <img
                    loading="lazy"
                    src={"https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2F577a843b1fd2406dbf34cca3805a79b3?format=webp&width=800"} className="w-20"/>
                    <div>
                      <h3 className="text-3xl ml-10 font-bold mb-4 w-2/3">Сервис делает расчет стоимость производства носителя?</h3>
                      <p className="ml-5 text-2xl">Пока нет, но сейчас эта функция в разработке.</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <img
                    loading="lazy"
                    src={"https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2F47ccdd39fe5940ff8b5c3a86a6978c66?format=webp&width=800"} className="w-20"/>
                    <div>
                      <h3 className="text-3xl ml-10 font-bold mb-2"></h3>
                      <p className="ml-5 text-2xl"></p>
                    </div>
                  </div>
                </div>
                <img
                    loading="lazy"
                    src={"https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2F43cc893d38f440c2998892fed2c1bbe2?format=webp&width=800"} className="w-auto mr-14"/>
              </div>
            </section>
            <section ref={sectionRef3} className="py-5 px-4 text-center bg-white w-[27%] mx-auto mt-60 rounded-3xl">
              <form className="max-w-md mx-auto title">
                <h2 className="text-4xl font-bold font-sans mb-4 text-orange-600 text-left">Авторизация</h2>
                  <div>
                    <input type="text" onChange={(e) => setLogin(e.target.value)} placeholder="Логин" className="w-full p-2 mb-4 border-2 border-teal-600 rounded-lg text-teal-600 focus:ring focus:border-teal-900" />
                    <input type="password" onChange={(e) => setPassword(e.target.value)}  placeholder="Пароль" className="w-full p-2 mb-4 border-2 border-teal-600 rounded-lg text-teal-600 focus:ring focus:border-teal-900" />
                  </div>
                  <div className="flex justify-end">
                    <button onClick={upload} className="active:shadow-none hover:shadow-xl font-sans font-semibold text-xl rounded-lg w-1/2 bg-red-500 text-white p-2">Войти</button>
                  </div>
              </form>
            </section>
            <div>
              {notfound && (
                  <div className="flex items-center mt-2 justify-center">
                  <img src="/info.png" alt="Warning" className="w-6 h-6 mr-2" />
                  <p className="text-sm text-white  inline">Неверный логин или пароль</p>
                </div>

            )}
            </div>
            
            <footer>
              <div>
                  <p>GibbSITE</p>
                  <img
                  loading="lazy"
              className="w-20"/>
                  <p>Сириус</p>
              </div>
          </footer>
        </div>
    )
}
export default Mainpage;
