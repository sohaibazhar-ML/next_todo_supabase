const XLSX = require("xlsx");

const files = [
  "/Users/apple/Desktop/ML Projects/next_todo_supabase/expat_master_checklist_pro.xlsx",
  "/Users/apple/Desktop/ML Projects/next_todo_supabase/swiss_umzugsdokumente_uebersicht.xlsx"
];

files.forEach(f => {
  console.log("\n\n========================================");
  console.log("FILE: " + f.split("/").pop());
  console.log("========================================");
  try {
    const wb = XLSX.readFile(f);
    wb.SheetNames.forEach(name => {
      console.log("\n--- Sheet: " + name + " ---");
      const ws = wb.Sheets[name];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const rows = data.slice(0, 40);
      rows.forEach((row, i) => {
        console.log("Row " + i + ": " + JSON.stringify(row));
      });
      console.log("... Total rows: " + data.length);
    });
  } catch (e) {
    console.log("Error reading: " + e.message);
  }
});
