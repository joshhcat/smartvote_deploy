import { useEffect, useState } from "react";
import { FaDesktop } from "react-icons/fa6";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi";

const ThemeSwitcher = () => {
  // const themes = [
  //   { name: "light", icon: "🌞" },
  //   { name: "dark", icon: "🌙" },
  //   { name: "cyberpunk", icon: "🤖" },
  //   { name: "retro", icon: "🕹️" },
  // ];
  const themes = [
    { name: "dark", icon: <FaDesktop /> },
    { name: "light", icon: <HiOutlineSun /> },
    { name: "dracula", icon: <HiOutlineMoon /> },
  ];

  const [theme, setTheme] = useState(() => {
    // Initialize from localStorage or fallback to 'dark'
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    document.querySelector("html").setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    // <select
    //   className="select w-full max-w-xs mt-4"
    //   value={theme}
    //   onChange={(e) => setTheme(e.target.value)}
    // >
    //   {themes.map((t) => (
    //     <option key={t.name} value={t.name}>
    //       {t.icon} {t.name}
    //     </option>
    //   ))}
    // </select>
    <div className="w-full flex justify-center ">
      <div className="w-36 flex flex-row gap-2 justify-center  rounded-4xl border border-base-300 py-1">
        {themes.map((t) => (
          <div
            key={t.name}
            className={`rounded-full p-1.5 cursor-pointer ${
              theme === t.name ? "border" : "border-transparent"
            }`}
            onClick={() => setTheme(t.name)}
          >
            {t.icon}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeSwitcher;
