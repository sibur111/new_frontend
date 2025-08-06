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
    const [target_formula, setSelectedProduct] = useState<string | null>(null);
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
    <div className="bg-gradient-to-b from-[#006771] to-[#023136] min-h-screen text-white subtitle">
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

      {/* Main Content */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-8 max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center md:text-left">
          Введите данные о носителе
        </h1>
        <div className="flex flex-col md:flex-row md:items-start md:space-x-8">
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-lg sm:text-xl text-cyan-50 opacity-70 mb-2">Формула</p>
              <Dropdown
                items={items}
                defaultText="Выберите продукт"
                onSelect={(item: string) => {
                  setSelectedProduct(item);
                  setErrors((prev) => ({ ...prev, target_formula: "" }));
                }}
              />
              {errors.target_formula && (
                <div className="flex items-center mt-2">
                  <img
                    src="/info.png"
                    alt="Warning"
                    className="hidden md:block w-5 h-5 mr-2 max-w-full object-contain"
                  />
                  <p className="text-sm text-white opacity-70">{errors.target_formula}</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-lg sm:text-xl text-cyan-50 opacity-70 mb-2">Масса</p>
              <input
                type="text"
                value={result_mass}
                onChange={(e) => {
                  setMass(e.target.value);
                  setErrors((prev) => ({ ...prev, result_mass: "" }));
                }}
                className={`w-full text-lg sm:text-xl py-2 px-3 inp rounded-lg bg-white/10 border border-teal-900 focus:ring-1 focus:ring-teal-900 focus:outline-none text-cyan-50 ${errors.result_mass ? "border-red-500" : ""}`}
              />
              {errors.result_mass && (
                <div className="flex items-center mt-2">
                  <img
                    src="/info.png"
                    alt="Warning"
                    className="hidden md:block w-5 h-5 mr-2 max-w-full object-contain"
                  />
                  <p className="text-sm text-white opacity-70">{errors.result_mass}</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-lg sm:text-xl text-cyan-50 opacity-70 mb-2">% содержание чистого вещества</p>
              <input
                type="text"
                value={main_percent}
                onChange={(e) => {
                  setPure(e.target.value);
                  setErrors((prev) => ({ ...prev, main_percent: "" }));
                }}
                className={`w-full text-lg sm:text-xl py-2 px-3 inp rounded-lg bg-white/10 border border-teal-900 focus:ring-1 focus:ring-teal-900 focus:outline-none text-cyan-50 ${errors.main_percent ? "border-red-500" : ""}`}
              />
              {errors.main_percent && (
                <div className="flex items-center mt-2">
                  <img
                    src="/info.png"
                    alt="Warning"
                    className="hidden md:block w-5 h-5 mr-2 max-w-full object-contain"
                  />
                  <p className="text-sm text-white opacity-70">{errors.main_percent}</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-lg sm:text-xl text-cyan-50 opacity-70 mb-2">% Fe</p>
                <input
                  type="text"
                  value={fe_percent}
                  onChange={(e) => {
                    setFe(e.target.value);
                    setErrors((prev) => ({ ...prev, fe_percent: "" }));
                  }}
                  className={`w-full text-lg sm:text-xl py-2 px-3 inp rounded-lg bg-white/10 border border-teal-900 focus:ring-1 focus:ring-teal-900 focus:outline-none text-cyan-50 ${errors.fe_percent ? "border-red-500" : ""}`}
                />
                {errors.fe_percent && (
                  <div className="flex items-center mt-2">
                    <img
                      src="/info.png"
                      alt="Warning"
                      className="hidden md:block w-5 h-5 mr-2 max-w-full object-contain"
                    />
                    <p className="text-sm text-white opacity-70">{errors.fe_percent}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-lg sm:text-xl text-cyan-50 opacity-70 mb-2">% Si</p>
                <input
                  type="text"
                  value={si_percent}
                  onChange={(e) => {
                    setSi(e.target.value);
                    setErrors((prev) => ({ ...prev, si_percent: "" }));
                  }}
                  className={`w-full text-lg sm:text-xl py-2 px-3 inp rounded-lg bg-white/10 border border-teal-900 focus:ring-1 focus:ring-teal-900 focus:outline-none text-cyan-50 ${errors.si_percent ? "border-red-500" : ""}`}
                />
                {errors.si_percent && (
                  <div className="flex items-center mt-2">
                    <img
                      src="/info.png"
                      alt="Warning"
                      className="hidden md:block w-5 h-5 mr-2 max-w-full object-contain"
                    />
                    <p className="text-sm text-white opacity-70">{errors.si_percent}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-lg sm:text-xl text-cyan-50 opacity-70 mb-2">% K</p>
                <input
                  type="text"
                  value={k_percent}
                  onChange={(e) => {
                    setK(e.target.value);
                    setErrors((prev) => ({ ...prev, k_percent: "" }));
                  }}
                  className={`w-full text-lg sm:text-xl py-2 px-3 inp rounded-lg bg-white/10 border border-teal-900 focus:ring-1 focus:ring-teal-900 focus:outline-none text-cyan-50 ${errors.k_percent ? "border-red-500" : ""}`}
                />
                {errors.k_percent && (
                  <div className="flex items-center mt-2">
                    <img
                      src="/info.png"
                      alt="Warning"
                      className="hidden md:block w-5 h-5 mr-2 max-w-full object-contain"
                    />
                    <p className="text-sm text-white opacity-70">{errors.k_percent}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-lg sm:text-xl text-cyan-50 opacity-70 mb-2">% Ca</p>
                <input
                  type="text"
                  value={ca_percent}
                  onChange={(e) => {
                    setCa(e.target.value);
                    setErrors((prev) => ({ ...prev, ca_percent: "" }));
                  }}
                  className={`w-full text-lg sm:text-xl py-2 px-3 inp rounded-lg bg-white/10 border border-teal-900 focus:ring-1 focus:ring-teal-900 focus:outline-none text-cyan-50 ${errors.ca_percent ? "border-red-500" : ""}`}
                />
                {errors.ca_percent && (
                  <div className="flex items-center mt-2">
                    <img
                      src="/info.png"
                      alt="Warning"
                      className="hidden md:block w-5 h-5 mr-2 max-w-full object-contain"
                    />
                    <p className="text-sm text-white opacity-70">{errors.ca_percent}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-lg sm:text-xl text-cyan-50 opacity-70 mb-2">% Mg</p>
                <input
                  type="text"
                  value={mg_percent}
                  onChange={(e) => {
                    setMg(e.target.value);
                    setErrors((prev) => ({ ...prev, mg_percent: "" }));
                  }}
                  className={`w-full text-lg sm:text-xl py-2 px-3 inp rounded-lg bg-white/10 border border-teal-900 focus:ring-1 focus:ring-teal-900 focus:outline-none text-cyan-50 ${errors.mg_percent ? "border-red-500" : ""}`}
                />
                {errors.mg_percent && (
                  <div className="flex items-center mt-2">
                    <img
                      src="/info.png"
                      alt="Warning"
                      className="hidden md:block w-5 h-5 mr-2 max-w-full object-contain"
                    />
                    <p className="text-sm text-white opacity-70">{errors.mg_percent}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-lg sm:text-xl text-cyan-50 opacity-70 mb-2">% Na</p>
                <input
                  type="text"
                  value={na_percent}
                  onChange={(e) => {
                    setNa(e.target.value);
                    setErrors((prev) => ({ ...prev, na_percent: "" }));
                  }}
                  className={`w-full text-lg sm:text-xl py-2 px-3 inp rounded-lg bg-white/10 border border-teal-900 focus:ring-1 focus:ring-teal-900 focus:outline-none text-cyan-50 ${errors.na_percent ? "border-red-500" : ""}`}
                />
                {errors.na_percent && (
                  <div className="flex items-center mt-2">
                    <img
                      src="/info.png"
                      alt="Warning"
                      className="hidden md:block w-5 h-5 mr-2 max-w-full object-contain"
                    />
                    <p className="text-sm text-white opacity-70">{errors.na_percent}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <img
            src="/imgstart.png"
            className="hidden md:block w-1/3 max-w-xs h-auto object-contain md:ml-8 mt-4 md:mt-0"
          />
        </div>
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 font-sans font-semibold text-lg sm:text-xl md:text-2xl py-2 px-4 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-lg active:shadow-none transition-shadow"
          >
            Далее
          </button>
        </div>
        {errors.general && (
          <div className="flex items-center mt-4 justify-center">
            <img
              src="/info.png"
              alt="Warning"
              className="hidden md:block w-5 h-5 mr-2 max-w-full object-contain"
            />
            <p className="text-sm text-white opacity-70">{errors.general}</p>
          </div>
        )}
        {inputErr && (
          <div className="flex items-center mt-4 justify-center">
            <img
              src="/info.png"
              alt="Warning"
              className="hidden md:block w-5 h-5 mr-2 max-w-full object-contain"
            />
            <p className="text-sm text-white opacity-70">
              Невозможно вычислить результат для этих данных. Измените данные и попробуйте снова
            </p>
          </div>
        )}
        {serverResponse && (
          <div className="mt-8 mx-4 sm:mx-6 md:mx-8 lg:mx-10">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 text-center md:text-left">
              Варианты:
            </h3>
            {variants ? (
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {variants.map((variant, index) => (
                  <button
                    key={index}
                    onClick={() => handleVariantClick(variant)}
                    className={`px-3 py-1 rounded text-sm sm:text-base md:text-lg ${selectedVariant === variant ? "text-orange-600 bg-white/10" : "text-white hover:bg-white/10"} transition-colors`}
                  >
                    {variant}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white opacity-70 text-center">Нет доступных вариантов</p>
            )}
            {selectedVariant && (
              <div className="mt-4">
                <h4 className="text-base sm:text-lg md:text-xl font-semibold mb-2 text-center md:text-left">
                  Данные для {selectedVariant}:
                </h4>
                <div className="text-sm text-white whitespace-pre-wrap overflow-auto p-4 rounded bg-white/10">
                  <Output steps={parseVariantSteps(serverResponse[selectedVariant])} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default Startpage;