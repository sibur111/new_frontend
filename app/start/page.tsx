"use client"
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from 'react';
import Dropdown from '../components/Dropdown'
import Cookies from "js-cookie";
import http from "../http-common"
import { get } from "http";
import Output from '../components/Output'
import { Toaster } from "sonner";

const Startpage = () => {
    const router = useRouter();
    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);
    const [accept, setAccept] = useState(false)
    const [errorinput, seErrorInput] = useState(false);
    const [target_formula, setSelectedProduct] = useState(null);
    const [result_mass, setMass] = useState('20');
    const [main_percent, setPure] = useState('>98');
    const [fe_percent, setFe] = useState('<0.015');
    const [si_percent, setSi] = useState('0.1-0.3');
    const [k_percent, setK] = useState('0.01-0.08');
    const [ca_percent, setCa] = useState('0.03-0.11');
    const [mg_percent, setMg] = useState('0.005-0.03');
    const [na_percent, setNa] = useState('<0.03');
    var [inputErr, setInputErr] = useState(false);
    const [serverResponse, setServerResponse] = useState(null);
    const [variants, setVariants] = useState<string[] | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
    const [errors, setErrors] = useState({
      target_formula: '',
      result_mass: '',
      main_percent: '',
      fe_percent: '',
      si_percent: '',
      k_percent: '',
      ca_percent: '',
      mg_percent: '',
      na_percent: '',
      general: '',
    });
    function parseVariantSteps(variantData: any) {
      if (typeof variantData === "string") return [];
      return Object.keys(variantData)
        .filter(key => key.startsWith("Шаг"))
        .sort((a, b) => {
          const n1 = parseInt(a.replace(/\D/g, ""));
          const n2 = parseInt(b.replace(/\D/g, ""));
          return n1 - n2;
        })
        .map(key => {
          const step = variantData[key];
          let inputs : any[] = [];
          if (typeof step["Входные элементы"] === "object" && !Array.isArray(step["Входные элементы"])) {
            inputs = Object.entries(step["Входные элементы"])
              .filter(([k]) => !["molar_mass", "formula"].includes(k))
              .map(([id, el]) => (typeof el === "object" && el !== null ? { id, ...el } : { id, value: el }))
          } else if (typeof step["Входные элементы"] === "string") {
            inputs = [{ formula: step["Входные элементы"] }];
          }
          return {
            inputs,
            product: step["Продукт реакции"],
            conditions: step["Условия проведения реакции"]
          };
        });
    }
    const validateForm = () => {
      const newErrors = {
        target_formula: '',
        result_mass: '',
        main_percent: '',
        fe_percent: '',
        si_percent: '',
        k_percent: '',
        ca_percent: '',
        mg_percent: '',
        na_percent: '',
        general: '',
      };
      let isValid = true;

      if (!target_formula) {
        newErrors.target_formula = 'Выберите продукт';
        isValid = false;
      }

      if (!result_mass || Number(result_mass) <= 0 ) {
        newErrors.result_mass = 'Масса должна быть положительным числом';
        isValid = false;
      }
      if (!main_percent || Number(main_percent) <= 0 ) {
        newErrors.result_mass = 'Масса должна быть положительным числом';
        isValid = false;
      }

      const validatePercent = (value : any, field : any) => {
        if (!value) {
          return `${field} обязателен. Используйте число, диапазон (например, 0.1-0.3) или неравенство (например, <0.015)`;
        }
        const rangeRegex = /^(0\.\d+)-(0\.\d+)$/;
        const inequalityRegex = /^(>|<|>=|<=)(0\.\d+)$/;
        const numberRegex = /^0\.\d+$/;
        if (  
          !rangeRegex.test(value) &&
          !inequalityRegex.test(value) &&
          !numberRegex.test(value)
        ) {
          return `Неверный формат для ${field}. Используйте число, диапазон (например, 0.1-0.3) или неравенство (например, <0.015)`;
        }
        return '';
      };

      newErrors.fe_percent = validatePercent(fe_percent, '% Fe');
      newErrors.si_percent = validatePercent(si_percent, '% Si');
      newErrors.k_percent = validatePercent(k_percent, '% K');
      newErrors.ca_percent = validatePercent(ca_percent, '% Ca');
      newErrors.mg_percent = validatePercent(mg_percent, '% Mg');
      newErrors.na_percent = validatePercent(na_percent, '% Na');

      if (
        newErrors.main_percent ||
        newErrors.fe_percent ||
        newErrors.si_percent ||
        newErrors.k_percent ||
        newErrors.ca_percent ||
        newErrors.mg_percent ||
        newErrors.na_percent
      ) {
        isValid = false;
      }

      setErrors(newErrors);
      return isValid;
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }
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
        console.log
      }
      catch (err : any ){
        console.log(err);
        setServerResponse(null);
        setErrors((prev) => ({
          ...prev,
          general: 'Ошибка при отправке данных. Попробуйте снова.',
        }));
      if (err.response.status == 500 || err.response.status == 400){
          setInputErr(true);
      }
      }
    }

    const handleVariantClick = (variant: string) => {
      setSelectedVariant(variant);
    };
    useEffect(() => {
      const getToken = async () => {
        let token = Cookies.get('token');
        if (!token) {
        router.push('/#');
        return;
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
          }); 
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

const LogOut = () => {
      Cookies.remove('token')
      router.replace('/#')
    }
return (
  (accept && <div className="bg-gradient-to-b from-[#006771] to-[#023136] subtitle min-h-screen ">
    <div className="title">
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
    <p className="text-white text-4xl font-bold mb-10 mt-10 pt-5 ml-40" >Введите данные о носителе</p>
    <div className="flex ml-40 ">
      <div>
        <p className="text-xl text-cyan-50 opacity-70">Формула</p>
        <Dropdown 
          items={items} 
          defaultText="Выберите продукт" 
          onSelect={(item : any) => {
            setSelectedProduct(item);
            setErrors((prev) => ({ ...prev, target_formula: '' }));
          }} 
        />
        <div className="flex justify-between mt-5 items-center space-x-0">
          {errors.target_formula && (
          <div className="flex items-center mt-2">
            <img src="/info.png" alt="Warning" className="w-6 h-6 mr-2" />
            <p className="text-sm text-white opacity-70 inline">{errors.target_formula}</p>
          </div>
        )}
        </div>

        <p className="text-xl text-cyan-50 opacity-70 ">Масса</p>
        <input
          type="text"
          value={result_mass}
          onChange={e => {
            setMass(e.target.value);
            setErrors((prev) => ({ ...prev, result_mass: '' }));
          }}
          className={`text-xl py-2 inp text-cyan-50 opacity-70 mb-5 rounded-lg ${errors.result_mass ? 'border-red-500' : ''}`}
        />
        {errors.result_mass && (
          <div className="flex items-center mt-2">
            <img src="/info.png" alt="Warning" className="w-6 h-6 mr-2" />
            <p className="text-sm text-white opacity-70 inline">{errors.result_mass}</p>
          </div>
        )}

        <p className="text-xl text-cyan-50 opacity-70">% содержание чистого вещества</p>
        <input
          type="text"
          value={main_percent}
          onChange={e => {
            setPure(e.target.value);
            setErrors((prev) => ({ ...prev, main_percent: '' }));
          }}
          className={`text-xl py-2 inp rounded-lg opacity-70 text-cyan-50 mb-5 ${errors.main_percent ? 'border-red-500' : ''}`}
        />
        {errors.main_percent && (
          <div className="flex items-center mt-2">
            <img src="/info.png" alt="Warning" className="w-6 h-6 mr-2" />
            <p className="text-sm text-white opacity-70 inline">{errors.main_percent}</p>
          </div>
        )}
      </div>
      <div>
        <div className="w-1/2 ml-20 text-xl text-cyan-50 flex ">
          <div className="mb-5 opacity-70 ">
            <div>
              <p className="text-xl">% Fe</p>
              <input
                type="text"
                value={fe_percent}
                onChange={e => {
                  setFe(e.target.value);
                  setErrors((prev) => ({ ...prev, fe_percent: '' }));
                }}
                className={`text-xl py-2 inp rounded-lg mr-5 ${errors.fe_percent ? 'border-red-500' : ''}`}
              />
              {errors.fe_percent && (
                <div className="flex items-center mt-2">
                  <img src="/info.png" alt="Warning" className="w-6 h-6 mr-2" />
                  <p className="text-sm text-white inline">{errors.fe_percent}</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-xl mt-5">% Si</p>
              <input
                type="text"
                value={si_percent}
                onChange={e => {
                  setSi(e.target.value);
                  setErrors((prev) => ({ ...prev, si_percent: '' }));
                }}
                className={`text-xl py-2 inp rounded-lg mr-5 ${errors.si_percent ? 'border-red-500' : ''}`}
              />
              {errors.si_percent && (
                <div className="flex items-center mt-2">
                  <img src="/info.png" alt="Warning" className="w-6 h-6 mr-2" />
                  <p className="text-sm text- inline">{errors.si_percent}</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-xl mt-5">% K</p>
              <input
                type="text"
                value={k_percent}
                onChange={e => {
                  setK(e.target.value);
                  setErrors((prev) => ({ ...prev, k_percent: '' }));
                }}
                className={`text-xl py-2 inp rounded-lg mr-5 ${errors.k_percent ? 'border-red-500' : ''}`}
              />
              {errors.k_percent && (
                <div className="flex items-center mt-2">
                  <img src="/info.png" alt="Warning" className="w-6 h-6 mr-2" />
                  <p className="text-sm text-white inline">{errors.k_percent}</p>
                </div>
              )}
            </div>
          </div>
          <div className="opacity-70 mx-10">
            <div>
              <p className="text-xl">% Ca</p>
              <input
                type="text"
                value={ca_percent}
                onChange={e => {
                  setCa(e.target.value);
                  setErrors((prev) => ({ ...prev, ca_percent: '' }));
                }}
                className={`text-xl py-2 inp rounded-lg mr-5 ${errors.ca_percent ? 'border-red-500' : ''}`}
              />
              {errors.ca_percent && (
                <div className="flex items-center mt-2">
                  <img src="/info.png" alt="Warning" className="w-6 h-6 mr-2" />
                  <p className="text-sm text-white  inline">{errors.ca_percent}</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-xl mt-5">% Mg</p>
              <input
                type="text"
                value={mg_percent}
                onChange={e => {
                  setMg(e.target.value);
                  setErrors((prev) => ({ ...prev, mg_percent: '' }));
                }}
                className={`text-xl py-2 inp rounded-lg mr-5 ${errors.mg_percent ? 'border-red-500' : ''}`}
              />
              {errors.mg_percent && (
                <div className="flex items-center mt-2">
                  <img src="/info.png" alt="Warning" className="w-6 h-6 mr-2" />
                  <p className="text-sm text-white inline">{errors.mg_percent}</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-xl mt-5">% Na</p>
              <input
                type="text"
                value={na_percent}
                onChange={e => {
                  setNa(e.target.value);
                  setErrors((prev) => ({ ...prev, na_percent: '' }));
                }}
                className={`text-xl py-2 inp rounded-lg mr-5 ${errors.na_percent ? 'border-red-500' : ''}`}
              />
              {errors.na_percent && (
                <div className="flex items-center mt-2">
                  <img src="/info.png" alt="Warning" className="w-6 h-6 mr-2" />
                  <p className="text-sm text-white inline">{errors.na_percent}</p>
                </div>
              )}
            </div>
          </div>
          <img src={'/imgstart.png'} className="mx-10 pb-5"/>
        </div>
      </div>
    </div>
    <div>
      <button onClick={handleSubmit} className="flex mb-5 justify-center items-center active:shadow-none hover:shadow-lg font-sans mt-10 w-1/4 font-semibold text-2xl mx-auto rounded-lg bg-linear-to-r from-orange-600 to-red-600 text-white opacity-100 p-2">Далее</button>
    </div>
    <div>
      {inputErr  && (
        <div className="flex items-center mt-2 justify-center">
          <img src="/info.png" alt="Warning" className="w-6 h-6 mr-2" />
          <p className="text-sm text-white  inline">Невозможно вычислить результат для этих данных. Измените данные и попробуйте снова</p>
        </div>
      )}
      {serverResponse && (
        <div className="mt-10 mx-40">
          <h3 className="text-xl font-bold mb-3 text-white">
            Варианты: {variants ? variants.map((variant, index) => (
              <span key={index}>
                <button
                  onClick={() => handleVariantClick(variant)}
                  className={`mr-2 px-3 py-1 rounded ${selectedVariant === variant ? 'text-orange-600' : 'text-white hover:bg-gray-200/10'}`}
                >
                  {variant}
                </button>
              </span>
            )) : ''}
          </h3>
          {selectedVariant && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2 text-white">Данные для {selectedVariant}:</h4>
              <div className="text-sm text-white whitespace-pre-wrap overflow-auto p-4 rounded">
                <Output steps={parseVariantSteps(serverResponse[selectedVariant])} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  </div>)
); 
}
export default Startpage;