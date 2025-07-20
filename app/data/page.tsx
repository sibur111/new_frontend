"use client"
import { useRouter } from "next/navigation";
import DropdownTables from "../components/DropdownTables";
import Dropdown from '../components/Dropdown'
import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import http from "../http-common"
import Cookies from "js-cookie";
import DynamicTable from "../components/DynamicTable";
import { SearchParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";


const AddData = () => {
    const [items, setItems] = useState([]);
    const [formulas, setFormulas] = useState([]);
    const router = useRouter();
    const [accept, setAccept] = useState(false)
    const token = Cookies.get('token');
    const [model_name, setModelName] = useState('');
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [error, setError] = useState(null);
    const [selectedTable, setSelectedTable] = useState("");
    const [mass, setMass] =useState("");
    
    const [target_formula, setSelectedProduct] = useState('');
    var flag = 0;


    const dict = {"chemicaloperations" : "http://127.0.0.1:8000/admin/chemical-operation", 
        "chemicalobjects" : "http://127.0.0.1:8000/admin/materials", 
        "percentchemicalelements" : "http://127.0.0.1:8000/admin/chemical-composition"}
    const upload = async (item: any ) => {
        try {
            const url = `http://127.0.0.1:8000/admin/table/{table_name}?model_name=${encodeURIComponent(item)}`;
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const d = await response.json();
            setColumns(d.colums); 
            setData(d.data);
        } catch (err : any) {
            setError(err.message);
        }
    };
    
    useEffect(() => {
      
        const getToken = async () => {
        let token = Cookies.get('token');
        if (!token) {
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
      const Items = async () => {
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
          const da = await response.json();
          setFormulas(da); 
        } catch(err:any){
          console.log(err.toString());
        }
        }
        Items();
    const fetchItems = async () => {
        try {
          const token = await getToken();
          
          const response = await fetch('http://127.0.0.1:8000/admin/tables', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }
          const data = await response.json();
          setItems(data.tables); 
        } catch (err : any) {
          setError(err.message);
        }
      };
      fetchItems();
    }
  , [router]);


   if (!accept) {
    return <div>Loading...</div>;
  }  
  
  const handleSelect = (item : any ) => {
    setModelName(item);
    upload(item); 
    setSelectedTable(item);
  };
  const handleSubmit = (e: any) => {
    e.preventDefault();
    const params = new URLSearchParams({
        formula: target_formula,
        source_check: "true",
        molar_mass: mass
    });
    
    // Теперь params.toString() даст строку для запроса
    // Например:
    // fetch(`your_url?${params.toString()}`)
    console.log(params.toString());
  };
    return (
        <div className="start subtitle min-h-screen ">
            <DropdownTables items = {items} defaultText={"Выберите таблицу"} onSelect={handleSelect}/>
            
            <DynamicTable headers={columns} data = {data}/>
            {selectedTable === "chemicalobjects" &&(
        <form className="mt-4 flex flex-col gap-4">
            <div>
              <label className="block text-white mb-1"> Форула</label>
                <Dropdown 
                items={formulas} 
                defaultText="Выберите продукт" 
                onSelect={(item : any) => {
                  setSelectedProduct(item);
                }} />
                <label className="block text-white mb-1">Масса</label>
              <input
                type="text"
                className="p-2 rounded border border-cyan-800 w-full"/>
            </div>
          <button onClick={handleSubmit}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 m-10 hover:bg-gray-300 transition-colors"
        >
          Добавить
            </button>
        </form>
      )}
             
        </div>
        
    )
}
export default AddData;