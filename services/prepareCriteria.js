function prepareCriteria(contact) {
  const criteria = [];
  let confidenceScore = 0;

  // Always use the name if available.
  if (contact["Owner Name"]) {
    criteria.push({ name: "OwnerName", value: [contact["Owner Name"]] });
  } else {
    console.error("Owner Name is missing for a contact. Skipping...");
    return { criteria: null, confidenceScore: 0 };
  }

  // Check for phone or email
  if (contact["Mobile Phone"] && contact["Mobile Phone"] !== "N/A") {
    criteria.push({ name: "OwnerPhone", value: [contact["Mobile Phone"]] });
    confidenceScore += 1;
  } else if (contact["Email"] && contact["Email"] !== "N/A") {
    criteria.push({ name: "OwnerEmail", value: [contact["Email"]] });
    confidenceScore += 1;
  } else {
    console.error(
      "Both phone and email are missing for contact:",
      contact["Owner Name"],
      ". Skipping..."
    );
    return { criteria: null, confidenceScore: 0 };
  }

  if (confidenceScore === 2) {
    confidenceScore = "95%";
  } else if (confidenceScore === 1) {
    confidenceScore = "80%";
  } else {
    confidenceScore = 0;
  }

  return {
    CriteriaObject: {
      Criteria: criteria,
      Purchase: "1",
      Fields:
        "isSameMailingOrExempt, isSiteVacant, AdvancedPropertyType, Address, City, State, ZipFive, Beds, Baths, SqFt, LotSizeAcres, YearBuilt, AVM, CLTV, DelinquentAmount, DefaultAsOf, DefaultAmount, EquityPercent, NumberLoans, TotalLoanBalance, LastTransferRecDate, AssessedValue, FirstAmount, FirstDate, FirstPurpose, FirstRate, LastTransferValue, inTaxDelinquency, RadarID, AvailableEquity, FirstAmountLTV, FirstLenderOriginal, FirstLoanType, FirstRateType, SecondAmount, SecondDate, SecondPurpose, SecondRate, SecondRateType, SecondAmountLTV, SecondLoanType, LastTransferRecDate",
      Limit: "5",
      Sort: "",
      Start: "0",
    },
    confidenceScore,
  };
}

module.exports = { prepareCriteria };
