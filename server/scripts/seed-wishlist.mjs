import * as XLSX from "xlsx";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = resolve(__dirname, "../../database");

const makeEmpty = () => {
  const ws = XLSX.utils.json_to_sheet([]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
};

writeFileSync(resolve(db, "wishlist_series.xlsx"), makeEmpty());
writeFileSync(resolve(db, "wishlist_music.xlsx"), makeEmpty());
console.log("created wishlist_series.xlsx + wishlist_music.xlsx");
