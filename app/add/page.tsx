"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DynamicTable from "../components/DynamicTable";
import Cookies from "js-cookie";
import http from "../http-common";

// Интерфейсы для типизации
interface TableData {
  [key: string]: string | number | null;
}

interface ServerResponse {
  columns: string[]; // Убедитесь, что columns — массив строк
  data: TableData[];
  count?: number;
}

const AddUser = () => {
  const [data, setData] = useState<TableData[]>([]); // Явно указываем тип как массив TableData
  const [columns, setColumns] = useState<string[]>([]); // Явно указываем тип как массив строк
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      } catch (err: unknown) { // Используем unknown вместо any
        if (err instanceof Error) {
          console.error("Token fetch error:", err.message);
          setError("Failed to authenticate: " + err.message);
        } else {
          console.error("Unexpected error:", err);
          setError("Failed to authenticate: unexpected error");
        }
      }
    }
    return token;
  };

  useEffect(() => {
    const upload = async () => {
      try {
        const token = await getToken();
        if (!token) {
          throw new Error("No token available");
        }
        const response = await fetch(
          "https://127.0.0.1:8000/admin/table/{table_name}?model_name=userprofile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        const d: ServerResponse = await response.json();
        console.log("Server response:", d); // Диагностика ответа

        // Проверяем, что columns существует и является массивом
        if (!Array.isArray(d.columns)) {
          console.error("No valid columns field in response:", d);
          setError("No valid columns data received from server");
          setColumns([]);
          setData([]);
          return;
        }

        // Фильтруем столбцы, исключая "hashed_password" и "id"
        const filteredColumns = d.columns.filter(
          (col: string) => !["hashed_password", "id"].includes(col)
        );
        console.log("Filtered columns:", filteredColumns); // Диагностика результата фильтрации

        // Фильтруем данные, удаляя "hashed_password" и "id" из каждого объекта
        const filteredData = d.data.map((row: TableData) => {
          const { hashed_password, id, ...rest } = row;
          return rest;
        });
        console.log("Filtered data:", filteredData); // Диагностика отфильтрованных данных

        setColumns(filteredColumns);
        setData(filteredData || []);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Upload error:", err.message);
          setError(err.message);
        } else {
          console.error("Unexpected error:", err);
          setError("Unexpected error occurred");
        }
        setColumns([]);
        setData([]);
      }
    };
    upload();
  }, []);

  const routing = () => {
    router.push("/adduser");
  };

  return (
    <div className="start subtitle min-h-screen">
      <DynamicTable headers={columns} data={data} />
      <button
        onClick={routing}
        className="active:shadow-none hover:shadow-xl font-sans font-semibold text-xl rounded-lg bg-red-500 text-white p-2 px-4 m-10"
      >
        Добавить пользователя
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
};

export default AddUser;