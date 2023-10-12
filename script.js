const fs = require("fs");
const Papa = require("papaparse");
const ExcelJS = require("exceljs");
const Bottleneck = require("bottleneck");
const enrichData = require("./services/enrichData");

require("dotenv").config();

const limiter = new Bottleneck({
  minTime: 100,
});

async function processCsvToExcel() {
  const csvContent = fs.readFileSync("./input.csv", "utf8");
  const { data } = Papa.parse(csvContent, { header: true });

  const enrichedDataPromises = data.map((contact) => {
    return limiter.schedule(() => enrichData(contact));
  });
  const enrichedData = await Promise.all(enrichedDataPromises);

  const flattenedData = enrichedData.flat().filter((item) => item !== null);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Enriched Data");

  worksheet.columns = Object.keys(flattenedData[0]).map((key) => ({
    header: key,
    key,
  }));
  worksheet.addRows(flattenedData);

  await workbook.xlsx.writeFile(
    `/Users/${process.env.LOCATION}/Desktop/output.xlsx`
  );
  console.log("Excel file generated as 'output.xlsx'");
}

processCsvToExcel();
