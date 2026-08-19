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

  const worksheet =
    workbook.Sheets[sheetName];

  return XLSX.utils.sheet_to_json(
    worksheet,
    {
      defval: "",
    }
  );
};


// ========================================
// READ BULK FILE
// ========================================

const readBulkFile = async (
  filePath,
  originalFileName
) => {

  // Get extension from ORIGINAL filename
  const extension = path
    .extname(originalFileName)
    .toLowerCase();


  console.log(
    "Original file:",
    originalFileName
  );

  console.log(
    "Detected extension:",
    extension
  );


  // ========================================
  // CSV
  // ========================================

  if (extension === ".csv") {
    return await readCSV(filePath);
  }


  // ========================================
  // EXCEL
  // ========================================

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