const XLSX = require("xlsx");

const wb = XLSX.readFile("/Users/apple/Desktop/ML Projects/next_todo_supabase/swiss_umzugsdokumente_uebersicht.xlsx");
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

// Show rows 38+
data.slice(38).forEach((row, i) => {
  console.log("Row " + (i+38) + ": " + JSON.stringify(row));
});

// Extract unique categories
console.log("\n=== UNIQUE CATEGORIES ===");
const categories = [...new Set(data.slice(1).map(r => r[0]).filter(Boolean))];
categories.forEach(c => console.log("  - " + c));
console.log("\nTotal unique categories: " + categories.length);
console.log("Total document rows: " + (data.length - 1));
