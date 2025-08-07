import { useState, useEffect } from "react";
import katex from "katex";

interface TableData {
  [key: string]: string | number | null;
}

interface DynamicTableProps {
  headers: string[];
  data: TableData[];
  onRowSelect?: ((value: string | null) => void) | ((data: TableData) => void);
}

const DynamicTable: React.FC<DynamicTableProps> = ({ headers = [], data = [], onRowSelect }) => {
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
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    });
  };

  // Типовой предикат для проверки сигнатуры onRowSelect
  const isStringHandler = (
    handler: ((value: string | null) => void) | ((data: TableData) => void)
  ): handler is (value: string | null) => void => {
    return handler.length === 1;
  };

  const handleRowClick = (row: TableData, index: number) => {
    setSelectedRow(index);
    if (onRowSelect) {
      if (isStringHandler(onRowSelect)) {
        // Для chemicalobjects и percentchemicalelements
        if ("chemical_formula" in row) {
          const value = typeof row.chemical_formula === "number" 
            ? row.chemical_formula.toString() 
            : row.chemical_formula;
          onRowSelect(value as string | null);
        } else if ("main_percent" in row) {
          const value = typeof row.main_percent === "number" 
            ? row.main_percent.toString() 
            : row.main_percent;
          onRowSelect(value as string | null);
        }
      } else {
        // Для chemicaloperations
        onRowSelect(row);
      }
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

export default DynamicTable;