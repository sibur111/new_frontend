import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Dropdown = ({ items, defaultText, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const dropdownRef = useRef(null);
  const router = useRouter();
  // Закрытие dropdown при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  
  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleItemClick = (item) => {
    setSelectedItem(item); // Сохраняем строку напрямую
    setIsOpen(false);
    if (onSelect) onSelect(item);
  };
 
  return (<div
    ref={dropdownRef}
    className="relative inline-block text-cyan-50 opacity-70 w-64"
    tabIndex={0}
  >
    <button
      onClick={toggleDropdown}
      className="w-full px-4 py-2 text-left inp border rounded-lg border-teal-900 focus:outline-none focus:ring-1 focus:ring-offset-teal-900">
      {selectedItem || defaultText}
      <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
        {isOpen ? '▲' : '▼'}
      </span>
    </button>
    {isOpen && (
      <ul className="absolute z-10 w-full mt-1 inp border rounded-lg border-teal-800 focus:outline-none focus:ring-1 focus:ring-offset-teal-900 max-h-60 overflow-auto">
        {items.length > 0 ? (
          items.map((item, index) => (
            <li
              key={index}
              onClick={() => handleItemClick(item)}
              className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
            >
              {item}
            </li>
          ))
        ) : (
          <li className="px-4 py-2 text-gray-500">No items available</li>
        )}
      </ul>
    )}
  </div>
);
};

export default Dropdown;