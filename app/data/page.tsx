"use client";
import { useRouter } from "next/navigation";
import DropdownTables from "../components/DropdownTables";
import { useState, useEffect } from "react";
import http from "../http-common";
import Cookies from "js-cookie";
import DynamicTable from "../components/DynamicTable";
import katex from "katex";

// Интерфейсы для типизации
interface TableData {
  [key: string]: string | number | null;
}

interface FetchError {
  message: string;
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
  const [formulas, setFormulas] = useState<string[]>([]);
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

  // Словарь URL для таблиц
  const dict: { [key: string]: string } = {
    chemicaloperations: "http://127.0.0.1:8000/admin/chemical-operation",
    chemicalobjects: "http://127.0.0.1:8000/admin/materials",
    percentchemicalelements: "http://127.0.0.1:8000/admin/chemical-composition",
  };

  // Регулярное выражение для проверки, что mass - число (целое или дробное)
  const massRegex = /^\d*\.?\d*$/;

  // Функция для рендеринга LaTeX
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

  // Обновление предпросмотра LaTeX
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
      const url = `http://127.0.0.1:8000/admin/table/{table_name}?model_name=${encodeURIComponent(item)}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const d: { columns: string[]; data: TableData[] } = await response.json();
      setColumns(d.columns);
      setData(d.data);
    } catch (err: FetchError) {
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
        } catch (err: FetchError) {
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
      } catch (error: FetchError) {
        console.error("Verification failed:", error.message);
        Cookies.remove("token");
        router.push("/#");
      }
    };

    verifyToken();

    const fetchFormulas = async () => {
      try {
        const token = await getToken();
        const response = await fetch("http://127.0.0.1:8000/chemicals/formulas", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const da: string[] = await response.json();
        setFormulas(da);
      } catch (err: FetchError) {
        console.error(err.message);
      }
    };

    const fetchItems = async () => {
      try {
        const token = await getToken();
        const response = await fetch("http://127.0.0.1:8000/admin/tables", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data: { tables: string[] } = await response.json();
        const filteredTables = data.tables.filter(
          (table: string) => table !== "userprofile"
        );
        setItems(filteredTables);
      } catch (err: FetchError) {
        setError(err.message);
      }
    };

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
    // Проверка, что mass - положительное число
    if (!massRegex.test(mass) || parseFloat(mass) <= 0) {
      alert("Масса должна быть положительным числом");
      return;
    }

    try {
      const token = Cookies.get("token");
      const add_response = await http.post(
        "http://127.0.0.1:8000/admin/users/",
        {
          id: null,
          formula: target_formula,
          source_check: "true",
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
      // Обновляем таблицу после добавления
      if (selectedTable === "chemicalobjects") {
        await upload("chemicalobjects");
      }
    } catch (err: FetchError) {
      console.error("Error adding object:", err.message);
      alert("Ошибка при добавлении объекта: " + err.message);
    }
  };

  const handleSelect = (item: string) => {
    setModelName(item);
    upload(item);
    setSelectedTable(item);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addObject();
  };

  const viewForm = () => {
    setView(!view);
  };

  return (
    <div className="start subtitle min-h-screen">
      <DropdownTables
        items={items}
        defaultText={"Выберите таблицу"}
        onSelect={handleSelect}
      />
      {selectedTable && (
        <div>
          <DynamicTable headers={columns} data={data} />
          {selectedTable === "chemicalobjects" && (
            <div className="mt-4 flex flex-col gap-4 mx-10">
              <div>
                <button
                  onClick={viewForm}
                  className="active:shadow-none hover:shadow-xl font-sans font-semibold text-xl rounded-lg bgями[#006d79] text-white px-3"
                >
                  +
                </button>
                {view && (
                  <div className="w-1/4">
                    <label className="block text-white mb-1">Формула (LaTeX)</label>
                    <input
                      value={target_formula}
                      onChange={(e) => setFormula(e.target.value)}
                      type="text"
                      placeholder="Например, $x^2$ или \\frac{1}{2}"
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
                    <button
                      onClick={handleSubmit}
                      className="active:shadow-none hover:shadow-xl font-sans font-semibold mt-5 text-xl rounded-lg bg-red-600 text-white p-2 mb-10"
                    >
                      Добавить
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddData;