/**
 * @OnlyCurrentDoc
 *
 * Only request permissions for the currently running sheet
 *
 *  https://developers.google.com/apps-script/guides/services/authorization#permissions_and_types_of_scripts
 */

var yearlySheet = "YearlySub";

function createYearlyObject(amount, category, endYear, payDate) {
  return {
    amount:   amount,   // int
    category: category, // string
    endYear:  endYear,  // int,
    payDate:  payDate   // Date
  };
}

function getYearly() {

  // return object
  var categoriesToMonthlySum = {}; // category -> monthlySum

  var startRow = 2;

  var descriptionCol = 0;
  var categoryCol    = 1;
  var subCatCol      = 2;
  var payDateCol     = 3;
  var amountCol      = 4;
  var accountCol     = 5;
  var autoPayCol     = 6;
  var endYearCol     = 7;

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(yearlySheet);
  var data  = sheet.getDataRange().getValues();
  
  var yearlyObjects = [];
  
  var startRow = 2;
  var endRow   = data.length;
  
  for (var row = startRow; row < endRow; row++) {
    yearlyObjects.push(createYearlyObject(data[row][amountCol], data[row][categoryCol], data[row][endYearCol], data[row][payDateCol]));
  }
  
  for (var i = 0; i < yearlyObjects.length; i++) {
  
    var yearlyObject = yearlyObjects[i];
    
    if (yearlyObject.category in categoriesToMonthlySum === false) {
      categoriesToMonthlySum[yearlyObject.category] = createMonthlySumObject();
    }
    
    var monthlySum = categoriesToMonthlySum[yearlyObject.category];
    
    // If the endYear isn't defined or the current year < endYear
    if (!(yearlyObject.endYear instanceof Date) || new Date().getYear() < yearlyObject.endYear) {
      monthlySum[months[yearlyObject.payDate.getMonth()]] += yearlyObject.amount;
    }
  }
  
  return categoriesToMonthlySum;
}