"use client"
import { useRouter } from "next/navigation"
import React, { useState } from 'react';
import http from "./http-common"
import { Toaster, toast } from "sonner";
import Cookies from 'js-cookie'
interface Props {
  Image: "https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2F797b43e33b054d31870a53751f6e3a2e?format=webp&width=800";
   one: "https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2Fd6971021b459450ca4d463e000052a01?format=webp&width=800";
    two : "https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2F577a843b1fd2406dbf34cca3805a79b3?format=webp&width=800";
    three: "https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2F47ccdd39fe5940ff8b5c3a86a6978c66?format=webp&width=800";
  FAQImg: "https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2F43cc893d38f440c2998892fed2c1bbe2?format=webp&width=800";
  SiburLogo: string;
}

interface up{
  name: string,
  password: string,
}

const Mainpage = ({Image, FAQImg, one, two, three, SiburLogo} : Props) => {
    const router = useRouter()
    const [login_log, setLogin] = useState("");
    const [password_log, setPassword] = useState("");
    function routing(){
      router.push("/home");
    }
    const upload = (e:any) => {
      e.preventDefault()
      http.post("/auth/login", { username: login_log, password: password_log} )
        .then(response => {
          if (response.data){
            console.log(response.data)
            if (login_log == "temp_admin" && password_log == "1234"){
              toast("successful login")
              router.push("/admin");
              Cookies.set('token', response.data.access_token, { expires: 7 })}
            else {
              toast("successful login")
              router.push("/home");
              Cookies.set('token', response.data.access_token, { expires: 7 })}
            
        }
    })
        .catch(err => {
          console.log(err);
           if (err.response.data.detail == "User not found"){
            toast("incorrect an email or a password")}
      });
    }
   
    return (
          <div className='home'>
            <div className="pt-5 title">
              <header className="hidden md:flex items-center parent mx-auto px-10 py-1 w-full text-sm text-white bg-cyan-900 max-w-[1026px] rounded-2xl md:rounded-full max-md:px-5 max-md:max-w-full">
              <a href="#" className="font-semibold">GibbSITE</a>
              <nav className="ml-auto items-center p-2">
                <a href="#" className="mr-12 font-semibold">Как это работает?</a>
                <a href="#" className="mr-12 font-semibold">FAQ</a>
                <a href="#" className="font-sans font-semibold">Войти</a>
              </nav>
            </header>
            </div>
            <header className="bg-[url('https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2F689deeb4666c4067bc7611d0e0e6506a?format=webp&width=800')] bg-no-repeat bg-contain mx-auto mt-20 w-fit">
                <h1 className="text-9xl font-normal font-sans -ml-20 text-white tracking tracking-wide text-left mb-4 mt-10">GibbSITE</h1>
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
              <section className="mx-20 py-12 text-left">
                <h2 className="text-5xl font-semibold text-orange-600 mb-8">Как это работает?</h2>
                <p className="text-4xl font-normal text-white mb-8 mr-14">Вы всего лишь вводите данные о требуемом носителе, а мы автоматически подбираем для него сырье и условия приготовления</p>
              </section>
            </div>
            <section className="mx-20 text-white">
              <h2 className="text-5xl font-bold mb-12 text-left">Часто задаваемые вопросы</h2>
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
                      <h3 className="text-3xl ml-10 font-bold mb-2">Какой точность обладает алгоритм подбора?</h3>
                      <p className="ml-5 text-2xl">[Будет всталенно поже]</p>
                    </div>
                  </div>
                </div>
                <img
                    loading="lazy"
                    src={"https://cdn.builder.io/api/v1/image/assets%2Fd8432fa5e9704f3da262a78c1b14494c%2F43cc893d38f440c2998892fed2c1bbe2?format=webp&width=800"} className="w-auto mr-14"/>
              </div>
            </section>
            <section className="py-5 px-4 text-center bg-white w-[27%] mx-auto mt-60 rounded-3xl">
              <form className="max-w-md mx-auto title">
                <h2 className="text-4xl font-bold font-sans mb-4 text-orange-600 text-left">Авторизация</h2>
                  <div>
                    <input type="text" onChange={(e) => setLogin(e.target.value)} placeholder="Логин" className="w-full p-2 mb-4 border-2 border-teal-600 rounded-lg text-teal-600 focus:ring focus:border-teal-900" />
                    <input type="password" onChange={(e) => setPassword(e.target.value)}  placeholder="Пароль" className="w-full p-2 mb-4 border-2 border-teal-600 rounded-lg text-teal-600 focus:ring focus:border-teal-900" />
                  </div>
                  <div className="flex justify-end">
                    <button onClick={upload} className="active:shadow-none hover:shadow-lg font-sans font-semibold text-xl rounded-lg w-1/2 bg-red-500 text-white p-2">Войти</button>
                  </div>
              </form>
            </section>
            <footer>
              <div>
                  <p>GibbSITE</p>
                  <img
                  loading="lazy"
              src={SiburLogo} className="w-20"/>
                  <p>Сириус</p>
              </div>
          </footer>
        </div>
    )
}
export default Mainpage;
