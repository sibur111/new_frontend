import { useState, useEffect } from 'react';
import katex from 'katex';

// Подключаем KaTeX CSS через CDN в компоненте
if (typeof window !== 'undefined') {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
  document.head.appendChild(link);
}

const DynamicTable = ({ headers = [], data = []}) => {
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Функция для рендеринга LaTeX или обычного текста
  const renderCellContent = (value) => {
    if (typeof value === 'string' && (value.startsWith('$') && value.endsWith('$') || value.startsWith('\\(') && value.endsWith('\\)'))) {
      try {
        // Удаляем обрамляющие $ или \( \)
        const latexContent = value.replace(/^\$|\$$/g, '').replace(/^\\\(|\$\)$/g, '');
        const htmlContent = katex.renderToString(latexContent, {
          displayMode: false, // inline режим для формул
          throwOnError: false,
        });
        return <span dangerouslySetInnerHTML={{ __html: htmlContent }} />;
      } catch (error) {
        console.error('KaTeX rendering error:', error);
        return value; // Возвращаем исходное значение при ошибке
      }
    }
    return value ?? '-'; // Обычный текст или дефис для null/undefined
  };

  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      value?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue === undefined || bValue === undefined) return 0;
    if (sortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  return (
    <div className="overflow-x-auto p-10 max-h-[600px] overflow-y-auto">
      <input
        type="text"
        placeholder="Поиск..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      />
      <table className="min-w-full table-auto border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 cursor-pointer"
                onClick={() => handleSort(Object.keys(data[0] || {})[index])}
              >
                {header}
                {sortConfig.key === Object.keys(data[0] || {})[index] && (
                  <span className="ml-2">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
              {Object.keys(row).map((key, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                >
                  {renderCellContent(row[key])}
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