/** @type {import('tailwindcss').Config} */
module.exports = { // Oder export default, je nachdem, was bei Ihnen funktioniert
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // <--- Füge diese Zeile hinzu
    theme: {
      extend: {
        // Hier könnten Sie benutzerdefinierte Farben oder Fonts hinzufügen, 
        // falls Sie die spezifischen Wiki-Farben global nutzen möchten.
        colors: {
          // Beispiel: "wiki-red" für Infernal Heart
          'wiki-red': '#cc0000', 
          'wiki-blue': '#0033cc',
          'wiki-green': '#009900',
          'wiki-purple': '#660099',
        }
      },
    },
    plugins: [],
  }