import { createContext, useContext, useState, useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";
const Context = createContext(() => {});
function Toast({ item, remove }) {
  useEffect(() => {
    const id = setTimeout(() => remove(item.id), 5000);
    return () => clearTimeout(id);
  }, [item.id, remove]);
  return (
    <div className="toast-card" role="status">
      <CheckCircle2 size={20} />
      <span>{item.text}</span>
      <button aria-label="Dismiss notification" onClick={() => remove(item.id)}>
        <X size={16} />
      </button>
    </div>
  );
}
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const remove = (id) => setItems((v) => v.filter((x) => x.id !== id));
  const notify = (text) =>
    setItems((v) => [...v.slice(-2), { id: crypto.randomUUID(), text }]);
  return (
    <Context.Provider value={notify}>
      {children}
      <div className="toast-stack">
        {items.map((item) => (
          <Toast key={item.id} item={item} remove={remove} />
        ))}
      </div>
    </Context.Provider>
  );
}
export const useToast = () => useContext(Context);
