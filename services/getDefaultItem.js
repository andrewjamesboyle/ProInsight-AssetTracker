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

module.exports = { getDefaultItem };
