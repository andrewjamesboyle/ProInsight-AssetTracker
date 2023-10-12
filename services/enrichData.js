const {
  fetchPropertyDetailsForContact,
} = require("./fetchPropertyDetailsForContact");

const { getDefaultItem } = require("./getDefaultItem");

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

module.exports = enrichData;
