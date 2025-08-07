import { useState, useEffect } from "react";
import katex from "katex";

interface TableData {
  [key: string]: string | number | null;
}

interface DynamicTableProps {
  headers: string[];
  data: TableData[];onRowSelect?: (data: TableData) => void;
}

const DynamicTablePercent: React.FC<DynamicTableProps> = ({ headers = [], data = [], onRowSelect }) => {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" }>({ key: null, direction: "asc" });
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  // Функция для рендеринга LaTeX
  const renderLatex = (value: any) => {
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
      } catch (error) {
        console.error("KaTeX rendering error:", error);
        return value;
      }
    }
    return value;
  };

  // Фильтрация данных
  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      value?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  // Сортировка данных
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === undefined || aValue === null) {
      return bValue === undefined || bValue === null ? 0 : 1;
    }
    if (bValue === undefined || bValue === null) {
      return -1;
    }

    if (sortConfig.direction === "asc") {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleRowClick = (row: TableData, rowIndex: number) => {
    setSelectedRow(rowIndex);
    if (onRowSelect) {
      const selectedData: TableData = {
        chemical_id: typeof row.type_id === "number" ? row.type_id : parseFloat(row.type_id as string) || 0,
        main_percent: typeof row.main_percent === "number" ? row.main_percent : parseFloat(row.main_percent as string) || 0,
        Fe_percent: typeof row.Fe_percent === "number" ? row.Fe_percent : parseFloat(row.Fe_percent as string) || 0,
        Si_percent: typeof row.Si_percent === "number" ? row.Si_percent : parseFloat(row.Si_percent as string) || 0,
        K_percent: typeof row.K_percent === "number" ? row.K_percent : parseFloat(row.K_percent as string) || 0,
        Ca_percent: typeof row.Ca_percent === "number" ? row.Ca_percent : parseFloat(row.Ca_percent as string) || 0,
        Mg_percent: typeof row.Mg_percent === "number" ? row.Mg_percent : parseFloat(row.Mg_percent as string) || 0,
        Na_percent: typeof row.Na_percent === "number" ? row.Na_percent : parseFloat(row.Na_percent as string) || 0,
      };
      onRowSelect(selectedData);
    }
  };

  return (
    <div className="overflow-x-auto p-4 min-h-0 max-h-[50vh] overflow-y-auto">
      <input
        type="text"
        placeholder="Поиск..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-2 border border-cyan-900 rounded w-full max-w-md text-[#D4F0F2] focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <table className="min-w-full table-auto border-collapse border border-cyan-950">
        <thead>
          <tr className="bg-cyan-950">
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-sm font-semibold text-[#D4F0F2] uppercase tracking-wider border-b border-cyan-950 cursor-pointer"
                onClick={() => handleSort(Object.keys(data[0] || {})[index])}
              >
                {header}
                {sortConfig.key === Object.keys(data[0] || {})[index] && (
                  <span className="ml-2">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-cyan-900">
          {sortedData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`hover:bg-cyan-950 transition-colors ${
                selectedRow === rowIndex ? "bg-cyan-800" : ""
              }`}
              onClick={() => handleRowClick(row, rowIndex)}
            >
              {Object.keys(row).map((key, cellIndex) => (
                <td key={cellIndex} className="px-4 py-2 text-sm text-[#D4F0F2]">
                  {renderLatex(row[key] ?? "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DynamicTablePercent;