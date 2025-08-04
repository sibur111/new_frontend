// new_frontend/app/data/page.tsx
"use client";
import { useRouter } from "next/navigation";
import DropdownTables from "../components/DropdownTables";
import { useState, useEffect } from "react";
import http from "../http-common";
import Cookies from "js-cookie";
import DynamicTable from "../components/DynamicTable";
import katex from "katex";
import Dropdown from "../components/DropdownRoles";
import DropdownFormulas from "../components/DropdownFormulas";

interface TableData {
  [key: string]: string | number | null;
}

// Подключаем KaTeX CSS через CDN
if (typeof window !== "undefined") {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
  document.head.appendChild(link);
}

const AddData = () => {
  const [items, setItems] = useState<string[]>([]);
  const [percentFormulas, setPercentFormulas] = useState<string[]>([]);
  const [operationFormulas, setOperationFormulas] = useState<string[]>([]);
  const router = useRouter();
  const [accept, setAccept] = useState<boolean>(false);
  const [model_name, setModelName] = useState<string>("");
  const [data, setData] = useState<TableData[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [mass, setMass] = useState<string>("");
  const [target_formula, setFormula] = useState<string>("");
  const [view, setView] = useState<boolean>(false);
  const [formulaPreview, setFormulaPreview] = useState<string>("");
  const [main_percent, setMainPercent] = useState('');
  const [Fe, setFe] = useState('');
  const [Si, setSi] = useState('');
  const [K, setK] = useState('');
  const [Ca, setCa] = useState('');
  const [Mg, setMg] = useState('');
  const [Na, setNa] = useState('');
  const [formula, setForm] = useState('');
  const [source, setSource] = useState('');
  const [resultFormula, setResultFormula] = useState('');
  const [temperature, setTemperature] = useState('');
  const [conditions, setConditions] = useState('');
  const [sourceCheck, setSourceCheck] = useState('false');

  const dict: { [key: string]: string } = {
    chemicaloperations: "/admin/chemical-operation",
    chemicalobjects: "/admin/materials",
    percentchemicalelements: "/admin/chemical-composition",
  };

  const massRegex = /^\d*\.?\d*$/;

  const renderLatex = (value: string): string => {
    if (
      typeof value === "string" &&
      ((value.startsWith("$") && value.endsWith("$")) ||
        (value.startsWith("\\(") && value.endsWith("\\)")))
    ) {
      try {
        const latexContent = value
          .replace(/^\$|\$$/g, "")
          .replace(/^\\\(|\)\)$/g, "");
        return katex.renderToString(latexContent, {
          displayMode: false,
          throwOnError: false,
        });
      } catch (error: unknown) {
        console.error("KaTeX rendering error:", error);
        return value;
      }
    }
    return value;
  };

  useEffect(() => {
    if (target_formula) {
      setFormulaPreview(renderLatex(target_formula));
    } else {
      setFormulaPreview("");
    }
  }, [target_formula]);

  const upload = async (item: string) => {
    try {
      const token = Cookies.get("token");
      const url = `/admin/table/{table_name}?model_name=${encodeURIComponent(item)}`;
      const response = await http.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const d: { columns: []; data: [] } = response.data;
      setColumns(d.columns);
      setData(d.data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const getToken = async (): Promise<string | undefined> => {
      let token = Cookies.get("token");
      if (!token) {
        try {
          const r = await http.post("/auth/token", {
            username: "temp_admin",
            password: "1234",
          });
          token = r.data.access_token;
          if (token) {
            Cookies.set("token", token);
          }
        } catch (err: any) {
          console.error("Token fetch error:", err.message);
        }
      }
      return token;
    };

    const verifyToken = async () => {
      const token = await getToken();
      if (!token) {
        router.push("/#");
        return;
      }
      try {
        const response = await http.get("/auth/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.is_valid) {
          setAccept(true);
        } else {
          Cookies.remove("token");
          router.push("/#");
        }
      } catch (error: any) {
        console.error("Verification failed:", error.message);
        Cookies.remove("token");
        router.push("/#");
      }
    };

    const fetchFormulas = async () => {
      try {
        const token = await getToken();
        const response = await http.get("/chemicals/source", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const da: string[] = response.data;
        setPercentFormulas(da);
        const respons = await http.get("/chemicals/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const d: string[] = respons.data;
        setOperationFormulas(d);
      } catch (err: any) {
        console.error(err.message);
      }
    };

    const fetchItems = async () => {
      try {
        const token = await getToken();
        const response = await http.get("/admin/tables", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data: { tables: string[] } = response.data;
        const filteredTables = data.tables.filter(
          (table: string) => table !== "userprofile"
        );
        setItems(filteredTables);
      } catch (err: any) {
        setError(err.message);
      }
    };

    verifyToken();
    fetchFormulas();
    fetchItems();
  }, [router]);

  if (!accept) {
    return <div>Loading...</div>;
  }

  const addObject = async () => {
    if (!mass.trim() || !target_formula.trim()) {
      alert("Пожалуйста, заполните все поля");
      return;
    }
    if (!massRegex.test(mass) || parseFloat(mass) <= 0) {
      alert("Масса должна быть положительным числом");
      return;
    }

    try {
      const token = Cookies.get("token");
      const trimmedFormula = target_formula.slice(1, -1);
      const add_response = await http.post(
        "/admin/materials/",
        {
          id: null,
          formula: trimmedFormula,
          source_check: sourceCheck,
          molar_mass: mass,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMass("");
      setFormula("");
      setSourceCheck("false");
      if (selectedTable === "chemicalobjects") {
        await upload("chemicalobjects");
      }
    } catch (err: any) {
      console.error("Error adding object:", err.message);
      alert("Ошибка при добавлении объекта: " + err.message);
    }
  };

  const handleSelect = (item: string) => {
    setModelName(item);
    upload(item);
    setSelectedTable(item);
    setView(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addObject();
  };

  const viewForm = () => {
    setView(!view);
  };

  const AddPercentElements = async () => {
    try {
      const token = Cookies.get("token");
      const add_response = await http.post(
        "/admin/chemical-composition/",
        {
          formula: formula,
          metal_composition: {
            Fe_percent: Fe,
            Si_percent: Si,
            K_percent: K,
            Ca_percent: Ca,
            Mg_percent: Mg,
            Na_percent: Na,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMainPercent("");
      setFe("");
      if (selectedTable === "percentchemicalelements") {
        await upload("percentchemicalelements");
      }
    } catch (err: any) {
      console.error("Error adding object:", err.message);
      alert("Ошибка при добавлении объекта: " + err.message);
    }
  };

  const addOperation = async () => {
    try {
      const token = Cookies.get("token");
      const add_response = await http.post(
        "/admin/chemical-operation/",
        {
          source: [source],
          target: resultFormula,
          temperature: temperature,
          conditions: conditions,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (selectedTable === "chemicaloperations") {
        await upload("chemicaloperations");
      }
    } catch (err: any) {
      console.error("Error adding object:", err.message);
      alert("Ошибка при добавлении объекта: " + err.message);
    }
  };

  return (
    <div className="subtitle min-h-screen start">
      <DropdownTables
        items={items}
        defaultText={"Выберите таблицу"}
        onSelect={handleSelect}
      />
      {selectedTable && (
        <div>
          <DynamicTable headers={columns} data={data} />
          {selectedTable === "chemicalobjects" && (
            <div className="flex flex-col">
              <div>
                <button
                  onClick={viewForm}
                  className="active:shadow-none hover:shadow-xl font-sans font-semibold mx-5 text-xl rounded-lg text-white px-3"
                >
                  +
                </button>
                {view && (
                  <div className="w-1/4 m-10">
                    <label className="block text-white mb-1">Формула (LaTeX)</label>
                    <input
                      value={target_formula}
                      onChange={(e) => setFormula(e.target.value)}
                      type="text"
                      placeholder="Например, $\alpha-Al_2O-3$"
                      className="p-2 rounded border border-cyan-800 text-white w-full"
                    />
                    {target_formula && (
                      <div className="mt-2 text-white">
                        Предпросмотр:
                        <span
                          className="inline-block ml-2"
                          dangerouslySetInnerHTML={{ __html: formulaPreview }}
                        />
                      </div>
                    )}
                    <label className="block text-white mb-1 mt-5">Масса</label>
                    <input
                      value={mass}
                      onChange={(e) => setMass(e.target.value)}
                      type="text"
                      placeholder="Например, 0.01 или 123"
                      className="p-2 rounded border border-cyan-800 text-white w-full"
                    />
                    <div className="flex justify-start">
                      <label className="block text-white mt-5">Сырье</label>
                      <input
                        type="checkbox"
                        checked={sourceCheck === "true"}
                        onChange={(e) => setSourceCheck(e.target.checked ? "true" : "false")}
                        className="p-2 rounded border border-cyan-800 text-white mt-5 mx-5"
                      />
                    </div>
                    <button
                      onClick={handleSubmit}
                      className="active:shadow-none hover:shadow-xl font-sans font-semibold mt-5 text-xl rounded-lg bg-red-600 text-white p-2"
                    >
                      Добавить
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          {selectedTable === "percentchemicalelements" && (
            <div>
              <button
                onClick={viewForm}
                className="active:shadow-none hover:shadow-xl mx-5 font-sans font-semibold text-xl rounded-lg text-white px-3"
              >
                +
              </button>
              {view && (
                <div className="m-10">
                  <div className="flex justify-start">
                    <div className="w-1/4">
                      <label className="block text-white mb-1 mt-5">
                        Процент чистого вещества
                      </label>
                      <input
                        value={main_percent}
                        onChange={(e) => setMainPercent(e.target.value)}
                        type="text"
                        placeholder="Например, 0.01 или 0.015"
                        className="p-2 rounded border border-cyan-800 text-white w-full"
                      />
                    </div>
                    <div className="w-1/4 mx-5">
                      <label className="block text-white mb-1 mt-5">Формула (LaTeX)</label>
                      <DropdownFormulas
                        items={percentFormulas}
                        defaultText="Выберите продукт"
                        onSelect={(item: any) => {
                          setForm(item);
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="w-1/4">
                      <label className="block text-white mb-1 mt-5">% Fe</label>
                      <input
                        value={Fe}
                        onChange={(e) => setFe(e.target.value)}
                        type="text"
                        placeholder="Например, 0.01 или 0.015"
                        className="p-2 rounded border border-cyan-800 text-white w-full"
                      />
                      <label className="block text-white mb-1 mt-5">% Si</label>
                      <input
                        value={Si}
                        onChange={(e) => setSi(e.target.value)}
                        type="text"
                        placeholder="Например, 0.01 или 0.015"
                        className="p-2 rounded border border-cyan-800 text-white w-full"
                      />
                      <label className="block text-white mb-1 mt-5">% K</label>
                      <input
                        value={K}
                        onChange={(e) => setK(e.target.value)}
                        type="text"
                        placeholder="Например, 0.01 или 0.015"
                        className="p-2 rounded border border-cyan-800 text-white w-full"
                      />
                    </div>
                    <div className="w-1/4 mx-5">
                      <label className="block text-white mb-1 mt-5">% Ca</label>
                      <input
                        value={Ca}
                        onChange={(e) => setCa(e.target.value)}
                        type="text"
                        placeholder="Например, 0.01 или 0.015"
                        className="p-2 rounded border border-cyan-800 text-white w-full"
                      />
                      <label className="block text-white mb-1 mt-5">% Mg</label>
                      <input
                        value={Mg}
                        onChange={(e) => setMg(e.target.value)}
                        type="text"
                        placeholder="Например, 0.01 или 0.015"
                        className="p-2 rounded border border-cyan-800 text-white w-full"
                      />
                      <label className="block text-white mb-1 mt-5">% Na</label>
                      <input
                        value={Na}
                        onChange={(e) => setNa(e.target.value)}
                        type="text"
                        placeholder="Например, 0.01 или 0.015"
                        className="w-full p-2 rounded border border-cyan-800 text-white"
                      />
                    </div>
                  </div>
                  <button
                    onClick={AddPercentElements}
                    className="active:shadow-none hover:shadow-xl font-sans font-semibold mt-5 text-xl rounded-lg bg-red-600 text-white p-2 mb-10"
                  >
                    Добавить
                  </button>
                </div>
              )}
            </div>
          )}
          {selectedTable === "chemicaloperations" && (
            <div className="">
              <button
                onClick={viewForm}
                className="active:shadow-none hover:shadow-xl mx-5 font-sans font-semibold text-xl rounded-lg text-white px-3"
              >
                +
              </button>
              {view && (
                <div className="m-10 w-1/4">
                  <div>
                    <label className="block text-white mb-1 mt-5">
                      id номер исходного сырья
                    </label>
                    <input
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      type="text"
                      placeholder="Целое положительное число"
                      className="p-2 rounded border border-cyan-800 text-white w-full"
                    />
                    <label className="block text-white mb-1 mt-5">
                      Формула конечного результата
                    </label>
                    <DropdownFormulas
                      items={operationFormulas}
                      defaultText="Выберите продукт"
                      onSelect={(item: any) => {
                        setResultFormula(item);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-1 mt-5">Температура</label>
                    <input
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      type="text"
                      placeholder="Целое положительное число"
                      className="p-2 rounded border border-cyan-800 text-white w-full"
                    />
                    <label className="block text-white mb-1 mt-5">Условия реакции</label>
                    <input
                      value={conditions}
                      onChange={(e) => setConditions(e.target.value)}
                      type="text"
                      placeholder="Текст, латинские буквы"
                      className="p-2 rounded border border-cyan-800 text-white w-full"
                    />
                  </div>
                  <button
                    onClick={addOperation}
                    className="active:shadow-none hover:shadow-xl font-sans font-semibold mt-5 text-xl rounded-lg bg-red-600 text-white p-2 mb-10"
                  >
                    Добавить
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddData;