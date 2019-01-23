/**
 * @OnlyCurrentDoc
 *
 * Only request permissions for the currently running sheet
 *
 *  https://developers.google.com/apps-script/guides/services/authorization#permissions_and_types_of_scripts
 */

var biweeklySheet = "BiWeeklySub";
var weeklySheet   = "WeeklySub";

function createWeeklyObject(amount, category, dayOfWeek, startDate, endDate) {
  return {
    amount:    amount,    // int
    category:  category,  // string
    dayOfWeek: dayOfWeek, // int
    startDate: startDate, // Date Object
    endDate:   endDate    // Date Object
  };
}

var dayToNum = {
  Sunday: 0, Monday: 1, Tuesday:2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6
};

function getWeekly() {
  return getByDays(weeklySheet, 7);
}

function getBiweekly() {
  return getByDays(biweeklySheet, 14);
}

function getByDays(sheetName, numDays) {

  // return object
  var categoriesToMonthlySum = {}; // category -> monthlySum

  var descriptionCol = 0;
  var categoryCol    = 1;
  var subCatCol      = 2;
  var dayOfWeekCol   = 3;
  var amountCol      = 4;
  var accountCol     = 5;
  var autoPayCol     = 6;
  var startDateCol   = 7;
  var endDateCol     = 8;

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var data  = sheet.getDataRange().getValues();
  
  var weeklyObjects = []
  
  var startRow = 2;
  var endRow   = data.length;
  
  for (var row = startRow; row < endRow; row++) {
    weeklyObjects.push(createWeeklyObject(data[row][amountCol], data[row][categoryCol], data[row][dayOfWeekCol], data[row][startDateCol], data[row][endDateCol]));
  }
  
  for (var i = 0; i < weeklyObjects.length; i++) {
  
    var weeklyObject = weeklyObjects[i];

    if (weeklyObject.category in categoriesToMonthlySum === false) {
      categoriesToMonthlySum[weeklyObject.category] = createMonthlySumObject();
    }
    
    var monthlySum = categoriesToMonthlySum[weeklyObject.category];
    
    var startDate = new Date(new Date().getYear()  , 0, 1, 0, 0, 0, 0); // Jan 1 of current year 
    var endDate   = new Date(startDate .getYear()+1, 0, 1, 0, 0, 0, 0); // Jan 1 of next year 
    
    if (weeklyObject.startDate instanceof Date) {
    
      // If date defined in the spreadsheet was defined in prior years, increment from that date until the current year
      // by the numDays to find the current starting perious for this calendar year
      while (weeklyObject.startDate.getYear() < startDate.getYear()) {
         weeklyObject.startDate.setDate(weeklyObject.startDate + numDays);
      } 
      
      startDate = weeklyObject.startDate;
    }
    
    if (weeklyObject.endDate instanceof Date) {
      endDate = weeklyObject.endDate;
    }
    
    // Find the first day that matches the dayOfWeek defined in the sheet
    while (startDate.getDay() != dayToNum[weeklyObject.dayOfWeek]) {
      startDate.setDate(startDate.getDate() + 1);
    }
    
    while (startDate <= endDate) {
      monthlySum[months[startDate.getMonth()]] += weeklyObject.amount;
      startDate.setDate(startDate.getDate() + numDays);
    } 
    

  }
  
  return categoriesToMonthlySum;
}
