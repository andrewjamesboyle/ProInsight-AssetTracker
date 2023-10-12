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

module.exports = { prepareCriteria };
