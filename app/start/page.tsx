"use client"
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from 'react';
import Dropdown from '../components/Dropdown'
import Cookies from "js-cookie";
import http from "../http-common"
import { get } from "http";
import { useSearchParams } from 'next/navigation';
const Startpage = () => {
    const router = useRouter();
    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);
    const [accept, setAccept] = useState(false)
    const [target_formula, setSelectedProduct] = useState(null);
    const [result_mass, setMass] = useState('20');
    const [main_percent, setPure] = useState('>98');
    const [fe_percent, setFe] = useState('<0.015');
    const [si_percent, setSi] = useState('0.1-0.3');
    const [k_percent, setK] = useState('0.01-0.08');
    const [ca_percent, setCa] = useState('0.03-0.11');
    const [mg_percent, setMg] = useState('0.005-0.03');
    const [na_percent, setNa] = useState('<0.03');
    const [serverResponse, setServerResponse] = useState(null);
    const [variants, setVariants] = useState<string[] | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const selected = searchParams.get('target_formula');
    const handleSubmit = async () => {
    const params = new URLSearchParams({
      main_percent,
      fe_percent,
      si_percent,
      k_percent,
      ca_percent,
      mg_percent,
      na_percent,
      target_formula:  target_formula ? String(target_formula) : '',
      result_mass,
    });
    try{
      const token = Cookies.get('token');
      const queryString = new URLSearchParams(params).toString();

      const response = await fetch(`http://127.0.0.1:8000/chemicals/transformations?${queryString}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const answer = await response.json();
      setServerResponse(answer.data);
      if (answer.data){
        setVariants(Object.keys(answer.data));
      }
    }
    catch (err : any ){
      console.error(err.message);
    }
  }


    const handleVariantClick = (variant: string) => {
      setSelectedVariant(variant);
    };
    useEffect(() => {
      const getToken = async () => {
        let token = Cookies.get('token');
        if (!token) {
          // Получаем новый токен
          const r = await http.post('http://127.0.0.1:8000/auth/token', {username: "temp_admin", password: "1234"});
          token = r.data.access_token;
          if (token) {
            Cookies.set('token', token);
          }
        }
        return token;
      };
      

    const verifyToken = async () => {
      const token = await getToken();
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
    
    
    const fetchItems = async () => {
        try {
          const token = await getToken();
          const response = await fetch('http://127.0.0.1:8000/chemicals/formulas', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }); // Замените на ваш URL
          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }
          const data = await response.json();
          setItems(data); 
        } catch (err : any) {
          setError(err.message);
        }
      };
      fetchItems();}
  , [router]);


   if (!accept) {
    return <div>Loading...</div>;
  }  


    return (
        (accept && <div className="start subtitle min-h-screen ">
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
            <p className="text-white text-4xl font-bold mb-10 mt-10 pt-5 ml-40" >Введите данные о носителе</p>
            <div className="flex ml-40 ">
                <div>
                    <p className="text-xl text-cyan-50 opacity-70">Выберите продукт</p>
                    <Dropdown items={items} defaultText="Choose an option" onSelect={setSelectedProduct} />
                </div>
                <div>
                  <div className="flex">
                    <div>
                      <p className="ml-20 text-xl text-cyan-50 opacity-70">Масса</p>
                      <input type="text" value={result_mass} onChange={e => setMass(e.target.value)} className="inp text-cyan-50 opacity-70 rounded-lg ml-20 mb-5"></input>
                    </div>
                    <div>
                      <p className="ml-20 text-xl text-cyan-50 opacity-70">% содержание чистого вещества</p>
                      <input type="text" value={main_percent} onChange={e => setPure(e.target.value)} className="inp rounded-lg opacity-70 text-cyan-50 ml-20 mb-5 "></input>
                    </div>
                  </div>
                    <div className="w-1/2 ml-20 text-xl text-cyan-50 opacity-70 ">
                        <div className="flex mb-5">
                            <div>
                                <p>% Fe</p>
                                <input type="text" value={fe_percent} onChange={e => setFe(e.target.value)} className="inp rounded-lg mr-5"/>
                            </div>
                            <div>
                                <p>% Si</p>
                                <input type="text" value={si_percent} onChange={e => setSi(e.target.value)} className="inp rounded-lg mr-5"/>
                            </div>
                            <div>
                                <p>% K</p>
                                <input type="text" value={k_percent} onChange={e => setK(e.target.value)} className="inp rounded-lg mr-5"/>
                            </div>
                        </div>
                        <div className="flex">
                            <div>
                                <p>% Ca</p>
                                <input type="text" value={ca_percent} onChange={e => setCa(e.target.value)} className="inp rounded-lg mr-5"/>
                            </div>
                            <div>
                                <p>% Mg</p>
                                <input type="text" value={mg_percent} onChange={e => setMg(e.target.value)} className="inp rounded-lg mr-5"/>
                            </div>
                            <div>
                                <p>% Na</p>
                                <input type="text" value={na_percent} onChange={e => setNa(e.target.value)} className="inp rounded-lg mr-5"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-center">
            <button onClick={handleSubmit} className=" font-sans mt-10 w-1/4 font-semibold text-2xl mx-auto rounded-lg bg-linear-to-r from-orange-600 to-red-600 text-white opacity-100 p-2">Далее</button>
            </div>
            <div>
            {serverResponse && (
              <div className="mt-10 mx-40 p-5">
                <h3 className="text-xl font-bold mb-3 text-white">
                  Варианты: {variants ? variants.map((variant, index) => (
                    <span key={index}>
                      <button 
                        onClick={() => handleVariantClick(variant)}
                        className={`mr-2 px-3 py-1  rounded ${selectedVariant === variant ? 'text-orange-600' : ' text-white hover:bg-gray-200/10'}`}
                      >
                        {variant}
                      </button>
                    </span>
                  )) : ''}
                </h3>
                {selectedVariant && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold mb-2 text-white">Данные для {selectedVariant}:</h4>
                    <pre className="text-sm text-white whitespace-pre-wrap overflow-auto max-h-96 p-4 rounded">
                      {JSON.stringify(serverResponse[selectedVariant], null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
            </div>
            <footer>
            
            </footer>
        </div>)
    );
}
export default Startpage;