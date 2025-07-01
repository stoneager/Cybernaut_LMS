export function initializeTheme() {
  const theme = localStorage.getItem("theme");
  console.log("🚀 theme.js loaded");
  console.log("🌙 Theme from localStorage:", theme);

  if (theme === "dark") {
    document.documentElement.classList.add("dark");
    console.log("✅ Dark mode applied");
  } else {
    document.documentElement.classList.remove("dark");
    console.log("❌ Light mode applied");
  }
}
