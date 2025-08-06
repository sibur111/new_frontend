"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DynamicTable from "../components/DynamicTable";
import Cookies from "js-cookie";
import http from "../http-common";

interface TableData {
  [key: string]: string | number | null;
}

interface FetchError {
  message: string;
}

interface ServerResponse {
  columns: string[];
  data: TableData[];
  count?: number;
}

const AddUser = () => {
  const [data, setData] = useState<TableData[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedLogin, setSelectedLogin] = useState<string | null>(null);
  const router = useRouter();

    const getToken = async (): Promise<string | undefined> => {
      let token = Cookies.get("token");
      if (!token) {
        router.push('/#');
        return;
      }
      return token;
    };
  const deleteUser = async () => {
    if (!selectedLogin) {
      alert("Пожалуйста, выберите пользователя для удаления");
      return;
    }
    try {
      const token = Cookies.get("token");
      if (!token) {
        throw new Error("Токен авторизации отсутствует");
      }
      await http.delete(`http://127.0.0.1:8000/admin/users/${selectedLogin}`, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });
      alert(`Пользователь с логином ${selectedLogin} успешно удален`);
      await upload(); // Обновляем таблицу
      setSelectedLogin(null);
    } catch (err: any) {
      console.error("Error deleting user:", err.response?.data || err.message);
      alert("Ошибка при удалении пользователя: " + (err.response?.data?.detail || err.message));
    }
  };

  const upload = async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Токен авторизации отсутствует");
      }
      const url = "http://127.0.0.1:8000/admin/table/userprofile?model_name=userprofile";
      console.log("Fetching data from:", url);
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Ошибка при загрузке данных: ${response.status} ${response.statusText}`);
      }
      const d: ServerResponse = await response.json();
      console.log("Server response:", d);

      if (!Array.isArray(d.columns) || !Array.isArray(d.data)) {
        console.error("Некорректный формат ответа сервера:", d);
        throw new Error("Некорректный формат данных с сервера");
      }

      const filteredColumns = d.columns.filter(
        (col: string) => !["hashed_password", "id"].includes(col)
      );
      const filteredData = d.data.map((row: TableData) => {
        const { hashed_password, id, ...rest } = row;
        return rest;
      });
      console.log("Filtered columns:", filteredColumns);
      console.log("Filtered data:", filteredData);

      setColumns(filteredColumns);
      setData(filteredData || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || "Неизвестная ошибка";
      console.error("Upload error:", errorMessage);
      setError(`Ошибка при загрузке данных: ${errorMessage}`);
      setColumns([]);
      setData([]);
    }
  };

  useEffect(() => {
    upload();
  }, []);

  const routing = () => {
    router.push("/adduser");
  };

  return (
    <div className="start subtitle min-h-screen">
      <DynamicTable headers={columns} data={data} onRowSelect={setSelectedLogin}/>
      <div className="md:flex-row flex-col">
      <button
        onClick={routing}
        className="active:shadow-none hover:shadow-xl font-sans font-semibold text-xl rounded-lg bg-red-500 text-white p-2 px-4 m-10"
      >
        Добавить пользователя
      </button>
      <button
          onClick={deleteUser}
          disabled={!selectedLogin} // Отключаем кнопку, если не выбран login
          className={`active:shadow-none mx-10 hover:shadow-xl font-sans font-semibold text-xl rounded-lg p-2 px-4 ${
            selectedLogin ? 'bg-red-600 text-white' : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          Удалить пользователя
        </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {selectedLogin && (
        <div className="text-cyan-50 mx-10">Выбран пользователь: {selectedLogin}</div>
      )}
    </div>
    </div>
  );
};

export default AddUser;