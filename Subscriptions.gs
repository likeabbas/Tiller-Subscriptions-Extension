/**
 * @OnlyCurrentDoc
 *
 * Only request permissions for the currently running sheet
 *
 *  https://developers.google.com/apps-script/guides/services/authorization#permissions_and_types_of_scripts
 */
 
// Global sheet names so main.gs can pick up the sheets 
var monthlySheet   = "MonthlySubTest";
var biweeklySheet  = "BiweeklySubTest";
var weeklySheet    = "WeeklySubTest";
var yearlySheet    = "YearlySubTest";
 
function saveSubscriptions() {
  
  var monthly   = getSubscriptions(getMonthlyTimeline (),  monthlySheet );
  var biweekly  = getSubscriptions(getBiweeklyTimeline(),  biweeklySheet);
  var yearly    = getSubscriptions(getYearlyTimeline  (),  yearlySheet  );
  var weekly    = getSubscriptions(getWeeklyTimeline  (),  weeklySheet  );
  
  saveToCategoriesSheet(consolidateCategoriesToMonthlySums(monthly, yearly, biweekly, weekly));
}

function getYearlyTimeline() {
  return createTimeline(0, 0, 1);
}

function getMonthlyTimeline() {
  return createTimeline(0, 1, 0);
}

function getBiweeklyTimeline() {
  return createTimeline(14, 0, 0);
}

function getWeeklyTimeline() {
  return createTimeline(7, 0, 0);
}

/* 
 * Only one of the fields in `timeline` should be NonZero 
 */
function createTimeline(days, months, years) {
  return {
    days:   days,   // int
    months: months, // int
    years:  years   // int
  };
}

function consolidateCategoriesToMonthlySums(monthly, yearly, biweekly, weekly) {

  consolidate(monthly, yearly);
  consolidate(monthly, biweekly);
  consolidate(monthly, weekly);
  
  return monthly;
}

function consolidate(ob1, ob2) {

  /* 
   * Loop through every category in ob2
   * if that category exists in ob1, combine the sum for that month
   * else, set category in ob1 to value in ob2
   */
  for (var category in ob2) {
    if (category in ob1) {
    
      for (var month = 0; month < months.length; month++) {
        ob1[category][month] += ob2[category][month];
      }
      
    } else {
      ob1[category]  = ob2[category];
    }
  }
}

var categoriesSheet = "Categories";

var monthToNum = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12
};

function saveToCategoriesSheet(categoriesToMonthlySum) { 

  Logger.log(categoriesToMonthlySum);

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(categoriesSheet);
  var data  = sheet.getDataRange().getValues();
  
  var categoryCol = 0;
  var janCol      = 7; // Jan column on Categories sheet 
  
  var startRow = 2;
  var endRow   = data.length;
  
  var categoryToRow = {};
  
  // Loop through category sheet, putting category -> row in a map
  for (var row = startRow; row < endRow; row++) {
    categoryToRow[data[row][categoryCol]] = row;
  }
  
  
  for (var category in categoriesToMonthlySum) {
  
    // Category needs to exist in the Categories sheet 
    if (category in categoryToRow) {
    
       // row and col were off by 1 so added 1 to each 
       var row = categoryToRow[category] + 1;
       
       for (var month = 0; month < months.length; month++) {
         
         // get the number of the month, plus the offset from where the month lives in the Categories sheet column, plus offset of 1 
         var col = month + janCol + 1;
         
         sheet.getRange(row, col).setValue(categoriesToMonthlySum[category][month])
       }
    }
  }
}

// Helpers



function createMonthlySumObject() {
  return {
    Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
  };
}


