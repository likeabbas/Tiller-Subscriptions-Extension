/**
 * @OnlyCurrentDoc
 *
 * Only request permissions for the currently running sheet
 *
 *  https://developers.google.com/apps-script/guides/services/authorization#permissions_and_types_of_scripts
 */

var monthlySheet = "MonthlySub";

function createMonthlyObject(amount, category, dayOfMonth, startDate, endDate) {
  return {
    amount:     amount,     // int
    category:   category,   // string
    dayOfMonth: dayOfMonth, // int
    startDate:  startDate,
    endDate:    endDate     // Date Object
  };
}

function getMonthly() {
  
  // return object
  var categoriesToMonthlySum = {}; // category -> monthlySum

  var descriptionCol = 0;
  var categoryCol    = 1;
  var subCatCol      = 2;
  var dayOfMonthCol  = 3;
  var amountCol      = 4;
  var accountCol     = 5;
  var autoPayCol     = 6;
  var startDateCol   = 7;
  var endDateCol     = 8;
    
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(monthlySheet);
  var data  = sheet.getDataRange().getValues();

  var monthlyObjects = []
  
  var startRow = 2;
  var endRow   = data.length;
  
  for (var row = startRow; row < endRow; row++) {
    monthlyObjects.push(createMonthlyObject(data[row][amountCol], data[row][categoryCol], data[row][dayOfMonthCol], data[row][startDateCol], data[row][endDateCol]));
  }
  
  for (var i = 0; i < monthlyObjects.length; i++) {
  
    var monthlyObject = monthlyObjects[i];
    
    if (monthlyObject.category in categoriesToMonthlySum === false) {
      categoriesToMonthlySum[monthlyObject.category] = createMonthlySumObject();
    }
    
    var startDate = new Date(new Date().getYear()  , 0, 1, 0, 0, 0, 0); // Jan 1 of current year 
    
    if (monthlyObject.startDate instanceof Date) {
      startDate = monthlyObject.startDate;
    }
    
    var monthlySum = categoriesToMonthlySum[monthlyObject.category];
    var lastMonth  = 11;
    
    if (monthlyObject.endDate instanceof Date) {
    
      lastMonth = monthlyObject.endDate.getMonth();
      
      if (monthlyObject.endDate.getDate() <= monthlyObject.dayOfMonth) {
        lastMonth--;
      }      
    } 
    
    for (var j = startDate.getMonth(); j <= lastMonth; j++) {
      var month = months[j];
      monthlySum[month] += monthlyObject.amount;
    }
  }
  
  return categoriesToMonthlySum;
}