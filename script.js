const fs = require("fs");
const axios = require("axios");
const Papa = require("papaparse");
const ExcelJS = require("exceljs");
const Bottleneck = require("bottleneck");
require("dotenv").config();

const limiter = new Bottleneck({
  minTime: 100,
});

function prepareCriteria(contact) {
  const criteria = [];

  // Always use the name if available.
  if (contact["Owner Name"]) {
    criteria.push({ name: "OwnerName", value: [contact["Owner Name"]] });
  } else {
    console.error("Owner Name is missing for a contact. Skipping...");
    return; // Skip or handle as desired
  }

  // Check for phone or email
  if (contact["Mobile Phone"] && contact["Mobile Phone"] !== "N/A") {
    criteria.push({ name: "OwnerPhone", value: [contact["Mobile Phone"]] });
  } else if (contact["Email"] && contact["Email"] !== "N/A") {
    criteria.push({ name: "OwnerEmail", value: [contact["Email"]] });
  } else {
    console.error(
      "Both phone and email are missing for contact:",
      contact["Owner Name"],
      ". Skipping..."
    );
    return;
  }

  return {
    Criteria: criteria,
    Purchase: "1",
    Fields:
      "isSameMailingOrExempt, Address, City, State, ZipFive, Beds, Baths, SqFt, LotSizeAcres, YearBuilt, AVM, CLTV, DelinquentAmount, DefaultAsOf, DefaultAmount, EquityPercent, NumberLoans, TotalLoanBalance, LastTransferRecDate, AssessedValue, FirstAmount, FirstDate, FirstPurpose, FirstRate, LastTransferValue, inTaxDelinquency, RadarID, AvailableEquity",
    Limit: "5",
    Sort: "",
    Start: "0",
  };
}

async function fetchPropertyDetailsForContact(contact) {
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PROPERTY_RADAR_KEY}`,
    };

    const body = prepareCriteria(contact);

    if (!body) {
      console.error("Criteria preparation failed for contact:", contact);
      return [];
    }

    const urlParams = {
      Purchase: body.Purchase,
      Fields: body.Fields,
      Limit: body.Limit,
      Sort: body.Sort,
      Start: body.Start,
    };

    const response = await axios.post(
      "https://api.propertyradar.com/v1/properties",
      {
        Criteria: body.Criteria,
      },
      {
        headers: headers,
        params: urlParams,
      }
    );

    if (!response.data) {
      console.error(
        "Received undefined data from the API for contact:",
        contact
      );
      return [];
    }

    if (response.data.results && response.data.results.length === 0) {
      console.error(
        "Received empty results from the API for contact owner name:",
        contact["Owner Name"]
      );
      return [];
    }

    return response.data.results || [];
  } catch (err) {
    console.error(
      `Failed to fetch for contact ${contact.name}: ${err.message}`
    );
    console.error("Error status:", err.status);
    throw err;
  }
}

async function enrichData(contact) {
  const response = await fetchPropertyDetailsForContact(contact);
  console.log("PR Response:", response);

  // Access the results array from the response data
  const properties = response;

  if (!properties || properties.length === 0) {
    console.log("No results found for contact:", contact);
    return [getDefaultItem(contact)];
  }

  let enrichedData = [];
  try {
    enrichedData = properties.map((property) => ({
      // Contact details
      "Owner Name": contact["Owner Name"],
      "Owner Phone": contact["Mobile Phone"],
      "Owner Email": contact["Email"],

      // Property details
      Address: property.Address || null,
      City: property.City || null,
      State: property.State || null,
      Zip: property.ZipFive || null,

      // Premium Fields
      "Primary or Income Property":
        property.isSameMailingOrExempt === 1 ? "Primary" : "Income",
      SqFt: property.SqFt || null,
      Beds: property.Beds || null,
      Baths: property.Baths || null,
      "Lot Size Acres": property.LotSizeAcres || null,
      "Year Built": property.YearBuilt || null,
      "Estimated Value": property.AVM || null,
      "Assessed Value": property.AssessedValue || null,
      "Available Equity": property.AvailableEquity || null,
      "Equity Percent": property.EquityPercent || null,
      "Purchase Price": property.LastTransferValue || null,
      "Purchase Date": property.LastTransferRecDate || null,
      "Last Transfer Rec Date": property.LastTransferRecDate || null,
      "Total Loan Balance": property.TotalLoanBalance || null,
      LTV: property.CLTV || null,
      "Number of Loans": property.NumberLoans || null,
      "Original Loan Amount": property.FirstAmount || null,
      "Loan Date": property.FirstDate || null,
      "Loan Purpose": property.FirstPurpose || null,
      "Loan Rate": property.FirstRate || null,
      "Default Amount": property.DefaultAmount || null,
      "Default As Of": property.DefaultAsOf || null,
      "In Tax Delinquency": property.inTaxDelinquency || null,
      "Delinquent Amount": property.DelinquentAmount || null,
      "Property Radar ID": property.RadarID || null,
    }));
    console.log("Sample mapped property:", enrichedData[0]);
  } catch (error) {
    console.error("Error in mapping:", error);
  }

  return enrichedData;
}

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

  await workbook.xlsx.writeFile("/Users/andrewjamesboyle/Desktop/output.xlsx");
  console.log("Excel file generated as 'output.xlsx'");
}

processCsvToExcel();

const getDefaultItem = (contact) => {
  return {
    // Contact details
    "Owner Name": contact["Owner Name"],
    "Owner Phone": contact["Mobile Phone"],
    "Owner Email": contact["Email"],

    // Property details
    Address: null,
    City: null,
    State: null,
    Zip: null,
    "Property Type": null,
    SqFt: null,
    Beds: null,
    Baths: null,
    "Lot Size Acres": null,
    "Year Built": null,
    "Estimated Value": null,
    "Assessed Value": null,
    "Available Equity": null,

    "Purchase Price": null,
    "Purchase Date": null,

    "Total Loan Balance": null,

    "Property Radar ID": null,
  };
};
