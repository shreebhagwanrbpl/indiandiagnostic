const fs = require("fs");

const rawData = JSON.parse(
  fs.readFileSync("india_districts.json", "utf-8")
);

const result = [];

rawData.india_districts.forEach((stateObj) => {
  stateObj.districts.forEach((district) => {
    result.push({
      district,
      slug: district.toLowerCase().replace(/\s+/g, "-"),
    });
  });
});

fs.writeFileSync("districts.json", JSON.stringify(result, null, 2));

console.log("✅ Only district JSON ready");