import Image from "next/image";
import katex from 'katex';
import 'katex/dist/katex.min.css';
import React from "react";

function renderFormula(str) {
  if (typeof str !== 'string') return str;
  // Определяем, LaTeX ли это (по наличию \\ или $)
  if (str.includes('\\') || str.includes('$')) {
    try {
      return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(str.replace(/\\/g, '\\'), { throwOnError: false }) }} />;
    } catch {
      return <span>{str}</span>;
    }
  }
  return <span>{str}</span>;
}

const formatElement = (el, idx) => (
  <div key={idx} className="bg-cyan-900 text-white rounded-lg p-2 mb-2">
    <div className="font-mono text-lg mb-1">ID: {el.id || idx}</div>
    <div className="text-sm flex flex-wrap items-center">
      {Object.entries(el).map(([k, v]) =>
        k !== "mass" && k !== "id" ? (
          <span key={k} className="mr-3 inline-block">{k}: <b>{k === 'formula' ? renderFormula(v) : v}</b></span>
        ) : null
      )}
      {el.mass && el.mass !== 0 && (
        <span className="ml-3 inline-block">Масса: <b>{el.mass}</b></span>
      )}
    </div>
  </div>
);

const ReactionSteps = ({ steps }) => (
  <div>
    {steps.map((step, idx) => (
      <div key={idx} >
        <div className="flex-col items-center mb-2">
          <span className="bg-cyan-700 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 font-bold">{idx + 1}</span>
          <span className="font-bold text-lg text-white">Шаг {idx + 1}</span>
        </div>
        <div className="flex-colflex justify-center items-center md:flex-row items-center">
          {/* Входные элементы */}
          <div className="flex flex-col md:flex-row gap-4">
            {step.inputs.map((el, i) => formatElement(el, el.id || i))}
          </div>
          {/* Стрелка */}
          <div className="mx-4 my-2">
            <img src="/arrow.png" alt="arrow" />
          </div>
          {/* Продукт */}
          <div className="bg-green-900 text-white rounded-lg p-4 font-mono text-lg w-1/3">
            {renderFormula(step.product)}
          </div>
        </div>
        {/* Условия */}
        <div className="text-cyan-200 text-sm mt-2">
          Условия: {step.conditions}
        </div>
      </div>
    ))}
  </div>
);

export default ReactionSteps;