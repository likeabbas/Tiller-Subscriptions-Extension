
// Sum per month of the year. January is index 0, December is index 11
function createMonthlySum() {
  return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
}

function createSubscription(category, amount, startDate, endDate) {
  return {
    category:   category,   // string
    amount:     amount,     // int
    startDate:  startDate,  // Date Object
    endDate:    endDate     // Date Object
  };
}

function getSubscriptions(timeline, sheetname) {
  
  /* 
   *  Return Object
   *  key  : category (string)
   *  value: [int], size 12. representing sum for each month
   */
  var categoriesToMonthlySum = {}; 

  var descriptionCol = 0; // required
  var categoryCol    = 1; // required, and category has to match one listen on the Categories sheet
  var subCatCol      = 2; 
  var amountCol      = 3; // required
  var startDateCol   = 4; // required
  var endDateCol     = 5;
  var accountCol     = 6; // required
  var autoPayCol     = 7;
    
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetname);
  var data  = sheet.getDataRange().getValues();
  
  var startRow      = 2;
  var endRow        = data.length;
  var subscriptions = [] // list of subscription objects
  
  for (var row = startRow; row < endRow; row++) {
    subscriptions.push(createSubscription(data[row][categoryCol], data[row][amountCol], data[row][startDateCol], data[row][endDateCol]));
  }
  
  Logger.log(subscriptions);
  
  for (var i = 0; i < subscriptions.length; i++) {
  
    var subscription = subscriptions[i];
    
    if (subscription.category in categoriesToMonthlySum === false) {
      categoriesToMonthlySum[subscription.category] = createMonthlySum();
    }
    
    var monthlySum  = categoriesToMonthlySum[subscription.category]; 
    
    // December 31 of current year 
    var lastDayOfYear = new Date(new Date().getFullYear(), 11, 31); 

    var startDate = subscription.startDate;
    var endDate   = (subscription.endDate instanceof Date) ? subscription.endDate : lastDayOfYear; 

    /* 
     *  Comparing dates, we want to zero out hours, minutes, seconds, milliseconds
     *  https://www.competa.com/blog/yet-more-js-wierdness-how-to-zero-out-or-just-set-the-time-part-of-a-date-object/
     */ 
    startDate.setHours(0,0,0,0);
    endDate  .setHours(0,0,0,0);
    
    var ogDay = startDate.getDate(); // Originally day of month

    /* 
     *  Loop until startDate > endDate
     * 
     *  If the startDate was written in a previous year, don't add it to the monthly sum until 
     *  we're in the current year. 
     * 
     *  Only one of the fields in `timeline` should be NonZero, so we're only incrementing
     *  days or months or years
     */
    while (startDate <= endDate) {
    
      Logger.log(startDate);
      
      if (startDate.getYear() === lastDayOfYear.getYear()) {
        monthlySum[startDate.getMonth()] += subscription.amount;
      }
    
      startDate.setDate    (startDate.getDate() + timeline.days );
      startDate.setFullYear(startDate.getYear() + timeline.years);
      
      for (var k = 0; k < timeline.months; k++) {
        startDate = addMonth(startDate, ogDay);
      }
    }
  }
  
  Logger.log(categoriesToMonthlySum);
  return categoriesToMonthlySum;
}

isLeapYear = function (year) { 
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)); 
};

getDaysInMonth = function (year, month) {
    return [31, (isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};


/*
 *   ogDay is the original day of the month from startDate grabbed in the sheet
 *   if ogDay > next month's end of month, return last day of next month
 *   else, use ogDay
 *   could probably clean up this code a little bit. 
 */
addMonth = function (date, ogDay) {

    var day     = Math.min(date.getDate(), ogDay);
    var year    = date.getYear ();
    var month   = date.getMonth();
    var lastDay = getDaysInMonth(year, month);
    
    var nextMonth = month + 1;
    var nextYear  = year;
    
    if (nextMonth > 11) {
      nextYear++;
      nextMonth = 0;
    }
    
    var nextLastDay = getDaysInMonth(nextYear, nextMonth);
    
    if (day == lastDay || day >= nextLastDay) {
    
      if (ogDay < nextLastDay) nextLastDay = ogDay;
      
      return new Date(nextYear, nextMonth, nextLastDay, 0, 0, 0);
      
    } else {
    
      date.setMonth(date.getMonth() + 1);
      return date;
    }
};
