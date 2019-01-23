/**
 * @OnlyCurrentDoc
 *
 * Only request permissions for the currently running sheet
 *
 *  https://developers.google.com/apps-script/guides/services/authorization#permissions_and_types_of_scripts
 */
 
// Would be nice to force the "Category" column in each of the Sub sheets to do the same thing as in Autocat, 
// where the category has to match something in the Categories tab
 
// Global Helpers at the bottom of this file 
 
function saveSubscriptions(e) {

  var monthly  = getMonthly();
  var yearly   = getYearly();
  var biweekly = getBiweekly();
  var weekly   = {}; // change to getWeekly() and create WeeklySub tab if you want to exist

  saveToCategoriesSheet(consolidateCategoriesToMonthlySums(monthly, yearly, biweekly, weekly)); 
}

function consolidateCategoriesToMonthlySums(monthly, yearly, biweekly, weekly) {

  consolidate(monthly, yearly);
  consolidate(monthly, biweekly);
  consolidate(monthly, weekly);
  
  return monthly;
}

function consolidate(ob1, ob2) {

  for (var category in ob2) {
  
    if (category in ob1) {
    
      for (var i = 0; i < months.length; i++) {
        
        var month = months[i];
        
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

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(categoriesSheet);
  var data  = sheet.getDataRange().getValues();
  
  var categoryCol = 0;
  var janCol      = 6;
  
  var startRow  = 2;
  var endRow    = data.length;
  
  var categoryToRow = {};
  
  for (var row = startRow; row < endRow; row++) {
    categoryToRow[data[i][categoryCol]] = i;
  }
  
  for (var category in categoriesToMonthlySum) {
  
    // Category needs to exist in the Categories sheet 
    if (category in categoryToRow) {
    
       // row and col were off by 1 so added 1 to each 
       var row = categoryToRow[category] + 1;
       
       for (var i = 0; i < months.length; i++) {
         
         var month = months[i];
         
         // get the number of the month, plus the offset from where the month lives in the Categories sheet column, plus offset of 1 
         var col = monthToNum[month] + janCol + 1;
         
         sheet.getRange(row, col).setValue(categoriesToMonthlySum[category][month])
       }
    }
  }
}

// Helpers

var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function createMonthlySumObject() {
  return {
    Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
  };
}

