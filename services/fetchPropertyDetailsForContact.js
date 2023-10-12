const axios = require("axios");
const { prepareCriteria } = require("./prepareCriteria");

require("dotenv").config();

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

module.exports = { fetchPropertyDetailsForContact };
