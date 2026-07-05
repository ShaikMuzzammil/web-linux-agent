"use client";
import { useState, useEffect, useCallback } from "react";

type CalcMode = "standard" | "scientific";

const BTN_LAYOUT = [
  ["AC", "+/-", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "="],
];

const SCI_ROW = ["sin", "cos", "tan", "log"];
const SCI_ROW2 = ["√", "x²", "xʸ", "1/x"];

export default function Calculator({ windowId }: { windowId: string }) {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [waitNext, setWaitNext] = useState(false);
  const [expression, setExpression] = useState("");
  const [mode, setMode] = useState<CalcMode>("standard");

  const handleDigit = useCallback((digit: string) => {
    if (waitNext) {
      setDisplay(digit);
      setWaitNext(false);
    } else {
      setDisplay(display === "0" ? digit : display.length < 12 ? display + digit : display);
    }
  }, [display, waitNext]);

  const handleDecimal = useCallback(() => {
    if (waitNext) { setDisplay("0."); setWaitNext(false); return; }
    if (!display.includes(".")) setDisplay(display + ".");
  }, [display, waitNext]);

  const handleOp = useCallback((nextOp: string) => {
    const current = parseFloat(display);
    if (prev !== null && !waitNext) {
      const result = calculate(prev, current, op!);
      setDisplay(String(parseFloat(result.toFixed(10))));
      setPrev(result);
      setExpression(`${result} ${nextOp}`);
    } else {
      setPrev(current);
      setExpression(`${current} ${nextOp}`);
    }
    setOp(nextOp);
    setWaitNext(true);
  }, [display, prev, op, waitNext]);

  const calculate = (a: number, b: number, operation: string): number => {
    switch (operation) {
      case "+": return a + b;
      case "−": return a - b;
      case "×": return a * b;
      case "÷": return b !== 0 ? a / b : 0;
      case "xʸ": return Math.pow(a, b);
      default: return b;
    }
  };

  const handleEquals = useCallback(() => {
    if (prev === null || op === null) return;
    const current = parseFloat(display);
    const result = calculate(prev, current, op);
    setExpression(`${prev} ${op} ${current} =`);
    setDisplay(String(parseFloat(result.toFixed(10))));
    setPrev(null);
    setOp(null);
    setWaitNext(true);
  }, [display, prev, op]);

  const handleSpecial = useCallback((btn: string) => {
    const n = parseFloat(display);
    switch (btn) {
      case "AC": setDisplay("0"); setPrev(null); setOp(null); setWaitNext(false); setExpression(""); break;
      case "+/-": setDisplay(String(-n)); break;
      case "%": setDisplay(String(n / 100)); break;
      case "√": setDisplay(String(parseFloat(Math.sqrt(n).toFixed(10)))); setExpression(`√(${n})`); setWaitNext(true); break;
      case "x²": setDisplay(String(n * n)); setExpression(`(${n})²`); setWaitNext(true); break;
      case "1/x": setDisplay(n !== 0 ? String(parseFloat((1 / n).toFixed(10))) : "Error"); setExpression(`1/${n}`); setWaitNext(true); break;
      case "sin": setDisplay(String(parseFloat(Math.sin(n * Math.PI / 180).toFixed(10)))); setExpression(`sin(${n}°)`); setWaitNext(true); break;
      case "cos": setDisplay(String(parseFloat(Math.cos(n * Math.PI / 180).toFixed(10)))); setExpression(`cos(${n}°)`); setWaitNext(true); break;
      case "tan": setDisplay(String(parseFloat(Math.tan(n * Math.PI / 180).toFixed(10)))); setExpression(`tan(${n}°)`); setWaitNext(true); break;
      case "log": setDisplay(String(parseFloat(Math.log10(n).toFixed(10)))); setExpression(`log(${n})`); setWaitNext(true); break;
      case "xʸ": handleOp("xʸ"); break;
    }
  }, [display, handleOp]);

  const handleBtn = useCallback((btn: string) => {
    if ("0123456789".includes(btn)) handleDigit(btn);
    else if (btn === ".") handleDecimal();
    else if (["÷", "×", "−", "+"].includes(btn)) handleOp(btn);
    else if (btn === "=") handleEquals();
    else handleSpecial(btn);
  }, [handleDigit, handleDecimal, handleOp, handleEquals, handleSpecial]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") handleBtn(e.key);
      else if (e.key === ".") handleBtn(".");
      else if (e.key === "Enter" || e.key === "=") handleBtn("=");
      else if (e.key === "+") handleBtn("+");
      else if (e.key === "-") handleBtn("−");
      else if (e.key === "*") handleBtn("×");
      else if (e.key === "/") { e.preventDefault(); handleBtn("÷"); }
      else if (e.key === "Escape") handleBtn("AC");
      else if (e.key === "Backspace") {
        setDisplay((d) => d.length > 1 ? d.slice(0, -1) : "0");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleBtn]);

  const getBtnStyle = (btn: string) => {
    const isOp = ["÷", "×", "−", "+"].includes(btn);
    const isEq = btn === "=";
    const isFunc = ["AC", "+/-", "%"].includes(btn);
    const isSci = [...SCI_ROW, ...SCI_ROW2].includes(btn);

    if (isEq) return { background: "#E95420", color: "white", fontWeight: 700 };
    if (isOp) return { background: "rgba(233,84,32,0.7)", color: "white" };
    if (isFunc) return { background: "rgba(174,167,159,0.3)", color: "white" };
    if (isSci) return { background: "rgba(119, 41, 83, 0.5)", color: "white", fontSize: "0.75rem" };
    return { background: "rgba(50,50,70,0.8)", color: "white" };
  };

  const displayValue = display.length > 9 ? parseFloat(display).toExponential(4) : display;

  return (
    <div className="h-full flex flex-col" style={{ background: "#1c1c1e", userSelect: "none", minHeight: 0 }}>
      {/* Mode toggle */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span className="text-white/40 text-xs">Calculator</span>
        <div className="flex rounded-lg overflow-hidden border border-white/10">
          {(["standard", "scientific"] as CalcMode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className="px-3 py-1 text-xs transition-colors capitalize"
              style={{ background: mode === m ? "#E95420" : "transparent", color: mode === m ? "white" : "rgba(255,255,255,0.5)" }}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Display */}
      <div className="flex flex-col items-end px-5 py-4 flex-shrink-0" style={{ background: "#1c1c1e" }}>
        <div className="text-white/40 text-sm h-5 mb-1 truncate w-full text-right">{expression || " "}</div>
        <div className="text-white font-light transition-all"
          style={{ fontSize: displayValue.length > 8 ? "2rem" : "3rem", lineHeight: 1 }}>
          {displayValue}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex-1 px-3 pb-3 flex flex-col gap-2 overflow-hidden">
        {/* Scientific row */}
        {mode === "scientific" && (
          <>
            <div className="grid grid-cols-4 gap-2">
              {SCI_ROW.map((btn) => (
                <button key={btn} onClick={() => handleBtn(btn)}
                  className="py-2 rounded-xl text-xs font-medium transition-all active:scale-95 hover:brightness-125"
                  style={getBtnStyle(btn)}>
                  {btn}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {SCI_ROW2.map((btn) => (
                <button key={btn} onClick={() => handleBtn(btn)}
                  className="py-2 rounded-xl text-xs font-medium transition-all active:scale-95 hover:brightness-125"
                  style={getBtnStyle(btn)}>
                  {btn}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Standard grid */}
        {BTN_LAYOUT.map((row, ri) => (
          <div key={ri} className={`grid gap-2 ${row.length === 3 ? "grid-cols-4" : "grid-cols-4"}`}>
            {row.map((btn) => (
              <button
                key={btn}
                onClick={() => handleBtn(btn)}
                className="py-3 rounded-xl text-lg font-medium transition-all active:scale-95 hover:brightness-125 flex items-center justify-center"
                style={{
                  ...getBtnStyle(btn),
                  gridColumn: btn === "0" ? "span 2" : "span 1",
                }}>
                {btn}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
