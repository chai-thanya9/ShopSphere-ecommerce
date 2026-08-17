const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const XLSX = require("xlsx");


// ========================================
// READ CSV FILE
// ========================================

const readCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};


// ========================================
// READ EXCEL FILE
// ========================================

const readExcel = (filePath) => {
  const workbook = XLSX.readFile(filePath);

  const sheetName = workbook.SheetNames[0];

  const worksheet = workbook.Sheets[sheetName];

  const data = XLSX.utils.sheet_to_json(
    worksheet,
    {
      defval: "",
    }
  );

  return data;
};


// ========================================
// READ CSV / EXCEL
// ========================================

const readBulkFile = async (filePath) => {
  const extension = path
    .extname(filePath)
    .toLowerCase();

  if (extension === ".csv") {
    return await readCSV(filePath);
  }

  if (
    extension === ".xlsx" ||
    extension === ".xls"
  ) {
    return readExcel(filePath);
  }

  throw new Error(
    "Only CSV, XLSX and XLS files are supported"
  );
};


module.exports = {
  readBulkFile,
};