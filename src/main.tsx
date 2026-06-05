import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// 禁用右键菜单
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  return false;
});
