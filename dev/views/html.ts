import { getAttendances, getClubInfo, getExpenses, getIncomes, getMembers, getPaymentTypes, getRecipients } from '../tables/get';
import { capitalizeString, centsToString, compareByDateDesc, Dictionary, ErrorType, IntData, Quarter, UniqueList } from '../types';

// Reports
/**
 * Returns the HTML as a string for the Member Details Google Sheets menu option.
 */
export function memberDetailsHTML() {
  const clubInfo = getClubInfo();
  const memAttendance: Dictionary<number, UniqueList<number>> = {};
  getAttendances().forEach(entry => {
    if (!entry.date || !entry.member_ids || !entry.quarter_id) throw ErrorType.AssertionError;
    const curDate = entry.date.getValue();
    const dateNum = curDate.getFullYear() * 1000 +
      curDate.getMonth() * 50 +
      curDate.getDate();
    if (entry.quarter_id.getValue() === clubInfo.currentQuarterId.getValue()) {
      entry.member_ids.getValue().forEach(memberId => {
        let curSet = memAttendance[memberId.getValue()];
        if (!curSet) {
          curSet = new UniqueList<number>();
          memAttendance[memberId.getValue()] = curSet;
        }
        curSet.add(dateNum);
      });
    }
  });
  const memberNames: string[] = [];
  const memberData: string[] = [];
  getMembers()
    .sort((a, b) => {
      if (!a.name || !b.name) throw ErrorType.AssertionError;
      return a.name.getValue().localeCompare(b.name.getValue());
    })
    .forEach(member => {
      if (
        !member.id ||
        !member.active ||
        !member.amountOwed ||
        !member.currentDuesPaid ||
        !member.dateJoined ||
        !member.email ||
        !member.name ||
        !member.notifyPoll ||
        !member.officer ||
        !member.performing ||
        !member.sendReceipt
      ) throw ErrorType.AssertionError;
      const name = capitalizeString(member.name.getValue());

      let status = '';
      if (!member.active.getValue()) {
        status += 'Inactive';
      } else {
        if (member.performing.getValue()) {
          status += 'Performing';
        } else {
          status += 'Non-Performing';
        }
      }
      if (member.officer.getValue()) {
        status += ' Officer';
      }

      const attendanceSet = memAttendance[member.id.getValue()];
      const attendances = attendanceSet ? attendanceSet.size() : 0;
      memberNames.push(`<option>${name}</option>`);
      memberData.push(`
    "${name}": {
      dateJoined: "${member.dateJoined.toDateString()}",
      amountOwed: "${centsToString(member.amountOwed)}",
      email: "${member.email.getValue()}",
      status: "${status}",
      paidDues: "${member.currentDuesPaid.getValue() ? 'Yes' : 'No'}",
      notifyPoll: "${member.notifyPoll.getValue() ? 'Yes' : 'No'}",
      sendReceipt: "${member.sendReceipt.getValue() ? 'Yes' : 'No'}",
      attendances: "${attendances}"
    }
    `);
    });
  return `
    <!DOCTYPE html>
    <style>
    p {
      display: inline;
    }
    </style>

    <body>
    <select id="member">
      ${memberNames.join('\n')}
    </select>
    </br>
    <div id="display">
      <p><b>Name: </b></p><p id="name"></p></br>
      <p><b>Status: </b></p><p id="status"></p></br>
      <p><b>Date joined: </b></p><p id="dateJoined"></p></br>
      </br>
      <p><b>Attendances: </b></p><p id="attendances"></p></br>
      <p><b>Paid current dues?: </b></p><p id="paidDues"></p></br>
      <p><b>Amount owed: </b></p><p id="amountOwed"></p></br>
      </br>
      <p><b>Email: </b></p><p id="email"></p></br>
      <p><b>Notify of polls?: </b></p><p id="notifyPoll"></p></br>
      <p><b>Send receipts?: </b></p><p id="sendReceipt"></p></br>
    </div>
    </body>

    <script>
    const memData = {
      ${memberData.join(',\n')}
    }
    const member = document.getElementById("member");
    const display = {
      name: document.getElementById("name"),
      dateJoined: document.getElementById("dateJoined"),
      amountOwed: document.getElementById("amountOwed"),
      attendances: document.getElementById("attendances"),
      email: document.getElementById("email"),
      status: document.getElementById("status"),
      paidDues: document.getElementById("paidDues"),
      notifyPoll: document.getElementById("notifyPoll"),
      sendReceipt: document.getElementById("sendReceipt")
    };

    function setMemberData() {
      const curMember = memData[member.value];

      display.name.innerHTML = member.value;
      display.dateJoined.innerHTML = curMember.dateJoined;
      display.attendances.innerHTML = curMember.attendances;
      display.amountOwed.innerHTML = curMember.amountOwed;
      display.email.innerHTML = curMember.email;
      display.status.innerHTML = curMember.status;
      display.paidDues.innerHTML = curMember.paidDues;
      display.notifyPoll.innerHTML = curMember.notifyPoll;
      display.sendReceipt.innerHTML = curMember.sendReceipt;
    }

    setMemberData();
    member.addEventListener("change", setMemberData);
    </script>
    `;
}
/**
 * Returns the HTML as a string for the Attendance Records Google Sheets menu option.
 */
export function attendanceRecordsHTML() {
  const idToMember: Dictionary<number, string> = {};
  getMembers().forEach(entry => {
    if (!entry.id || !entry.name) throw ErrorType.AssertionError;
    idToMember[entry.id.getValue()] = capitalizeString(entry.name.getValue());
  });

  const dailyAttendance: Dictionary<number, UniqueList<number>> = {};
  getAttendances().forEach(entry => {
    if (!entry.date || !entry.member_ids) throw ErrorType.AssertionError;
    const curDate = entry.date.getValue();
    const dateNum =
      curDate.getFullYear() * 1000 +
      curDate.getMonth() * 50 +
      curDate.getDate();
    let curSet = dailyAttendance[dateNum];
    if (!curSet) {
      dailyAttendance[dateNum] = new UniqueList<number>(entry.member_ids.getValue().map(x => x.getValue()));
    } else {
      entry.member_ids.getValue().forEach(memberId => {
        if (!curSet) throw ErrorType.AssertionError;
        curSet.add(memberId.getValue());
      });
    }
  });

  const attendances: string[] = [];
  Object.keys(dailyAttendance).forEach(date => {
    const dateNum = parseInt(date, 10);
    if (isNaN(dateNum)) throw ErrorType.AssertionError;
    const memberIds = dailyAttendance[dateNum];
    if (!memberIds) throw ErrorType.AssertionError;
    const memberNames = memberIds.asArray().map(id => {
      const name = idToMember[id];
      if (name === undefined) throw ErrorType.AssertionError;
      return name;
    });
    attendances.push(`${dateNum}: ["${memberNames.join('", "')}"]`);
  });

  return `
    <!DOCTYPE html>
    <head>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0-alpha1/jquery.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js"></script>
      <link href="https://code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css" rel="stylesheet">
    </head>

    <style>
      .ui-widget-content,
      .ui-widget-content,
      .ui-datepicker .ui-datepicker-header,
      .ui-datepicker .ui-datepicker-title,
      .ui-datepicker .ui-datepicker-title,
      .ui-datepicker .ui-datepicker-prev,
      .ui-datepicker .ui-datepicker-next,
      .ui-datepicker table,
      .ui-state-default,
      .ui-widget-content .ui-state-default,
      .ui-widget-header .ui-state-default,
      .ui-state-default {
        background: #ffffff;
      }

      .ui-datepicker-inline {
        padding: 0;
        margin: 0 auto;
      }

      .ui-widget-header {
        border: 0px;
      }

      .ui-datepicker .ui-datepicker-prev, .ui-datepicker .ui-datepicker-next {
        top: 5px;
      }

      a.ui-state-default,
      .ui-datepicker th {
        text-align: center !important;
      }

      .ui-datepicker {
        width: 18em;
        font-size: 15px;
        font-family: "Noto Sans", san-serif !important;
        text-transform: uppercase;
      }

      .ui-datepicker td {
        padding: 0px;
        border: 1px solid transparent;
      }

      .selected a{
        background-color: #6666aa !important;
        color: #b0fffa !important;
      }
      .available a{
        background-color: #66aa66 !important;
        color: #afffaf !important;
      }
      .unavailable a{
        background-color: #333333 !important;
        color: #b3b3b3 !important;
      }

      #parent {
        display: flex;
        flex-direction: column;
        height: 430px;
      }
      #textBox {
        height: 50%;
        display: flex;
        flex-direction: column;
        padding-left: 4px;
      }
      #memberList {
        overflow-y: auto;
        padding-left: 8px;
      }
      
      p {
        margin: 0px;
        padding-top: 4px;
        padding-bottom: 0px;
      }
    </style>

    <body style="margin:0px; height: 100%;">
      <div id="parent">
        <div id="calendar" class="datepicker"></div>
        
        <div id="textBox">
          <p><b>Members present:</b></p>
          <p id="memberList"></p>
        </div>
      </div>
    </body>

    <script>
    const attendances = {${attendances.join(',\n')}};

    var selectedDate;

    function dateToNum(d) {
      const dateObj = new Date(d);
      return dateObj.getDate() + dateObj.getMonth() * 50 + dateObj.getFullYear() * 1000;
    }

    $(function() {
      $( ".datepicker" ).datepicker({

        beforeShowDay: function(d){
          // Change format of date
          const dateNum = dateToNum(d);

          if (dateNum === selectedDate) {
            return [true, "selected" ];
          } else if (Object.keys(attendances).indexOf(dateNum.toString()) !== -1) {
            return [true, "available" ];
          } else {
            return [true, "unavailable"];
          }
        },
        
        onSelect: (d, x) => {
          const dateVals = d.split('/');
          const date = new Date(parseInt(dateVals[2], 10), parseInt(dateVals[0], 10) - 1, parseInt(dateVals[1], 10));
          const dateNum = dateToNum(date);
          const keys = Object.keys(attendances);
          const i = keys.indexOf(dateNum.toString());
          if (i !== -1) {
            selectedDate = dateNum;
            $("#memberList")[0].innerHTML = attendances[keys[i]].join('</br>');
          }
        }
      });
    });
    </script>
    `;
}
/**
 * Returns the HTML as a string for the Attendance Summary Google Sheets menu option.
 */
export function attendanceSummaryHTML() {
  const idToName: string[] = getMembers().map(entry => {
    if (!entry.id || !entry.name) throw ErrorType.AssertionError;
    return `${entry.id.getValue()}: "${capitalizeString(entry.name.getValue())}"`;
  });

  const days: number[] = [];
  const dailyAttendance: Dictionary<number, UniqueList<number>> = {};
  getAttendances().forEach(entry => {
    if (!entry.date || !entry.member_ids) throw ErrorType.AssertionError;
    const curDate = entry.date.getValue();
    const dateNum =
      curDate.getFullYear() * 1000 +
      curDate.getMonth() * 50 +
      curDate.getDate();
    let curSet = dailyAttendance[dateNum];
    if (!curSet) {
      days.push(dateNum);
      dailyAttendance[dateNum] = new UniqueList<number>(entry.member_ids.getValue().map(x => x.getValue()));
    } else {
      entry.member_ids.getValue().forEach(memberId => {
        if (!curSet) throw ErrorType.AssertionError;
        curSet.add(memberId.getValue());
      });
    }
  });
  days.sort();

  const curMems: number[] = [];
  const curMemTotals: Dictionary<number, number> = [];
  const totalMemberAttendance: string[] = [];
  days.forEach(day => {
    let curAttendances = dailyAttendance[day];
    if (!curAttendances) throw ErrorType.AssertionError;

    curAttendances.asArray().forEach(memId => {
      const curTotal = curMemTotals[memId];
      if (curTotal === undefined) {
        curMems.push(memId);
        curMemTotals[memId] = 1;
      } else {
        curMemTotals[memId] = curTotal + 1;
      }
    });

    const dayTotals: string[] = [];
    curMems.forEach(memId => {
      const memTotal = curMemTotals[memId];
      if (memTotal === undefined) throw ErrorType.AssertionError;
      dayTotals.push(`${memId}: ${memTotal}`);
    });
    totalMemberAttendance.push(`${day}: {${dayTotals.join(',\n')}}`);
  });

  return `
    <!DOCTYPE html>
    <style>
      #textBox {
        display: flex;
        flex-flow: column;
        padding-left: 4px;
        height: 80%;
      }
      #memberList {
        overflow-y: auto;
        padding-left: 8px;
      }

      p {
        margin-top: 2px;
        margin-bottom: 0px;
      }
    </style>

    <body style="height: 430px">
    <div style="height:100%">
      <div style="display: flex; align-items: center; justify-content: center;">
        <div>
          <p>Start</p>
          <input type="date" id="startDate" style="margin-right: 2px"/>
        </div>
        <div>
          <p>End</p>
          <input type="date" id="endDate" style="margin-left: 2px"/>
        </div>
      </div>
      
      </br>
      <div id="textBox">
        <p id="numDays"></p>
        <p id="memberList"></p>
      </div>
    </div>
    </body>

    <script>
    const idToName = {
      ${idToName.join(',\n')}
    };
    const days = [${days.join(',')}];
    const attendanceTotals = {
      ${totalMemberAttendance.join(',\n')}
    };

    const startDate = document.getElementById("startDate");
    const endDate = document.getElementById("endDate");

    const numDaysElt = document.getElementById("numDays");

    const memberList = document.getElementById("memberList");

    const today = new Date();
    let todayMonth = today.getMonth() + 1;
    let todayDay = today.getDate();
    
    let monthStr;
    if (todayMonth < 10)
      monthStr = '0' + todayMonth.toString();
    else
      monthStr = todayMonth.toString();

    let dayStr;
    if (todayDay < 10)
      dayStr = '0' + todayDay.toString();
    else
      dayStr = todayDay.toString();
    
    endDate.value = today.getFullYear() + '-' + monthStr + '-' + dayStr;

    function dateStrToNum(d) {
      const dateObj = new Date(d);
      return dateObj.getUTCDate() + dateObj.getUTCMonth() * 50 + dateObj.getUTCFullYear() * 1000;
    }

    function getDateBefore(d) {
      let front = 0;
      let back = days.length;
      while (front < back) {
        const cur = front + Math.floor((back - front) / 2);
        if (d === days[cur]) {
          return days[cur];
        } else if (d < days[cur]) {
          back = cur;
        } else {
          front = cur + 1;
        }
      }
      if (front === 0) {
        return null;
      } else {
        return days[front - 1]
      }
    }

    function refreshStats() {
      if (startDate.value.length === 0) {
        numDaysElt.hidden = true;
        numDaysElt.innerHTML = "";
        memberList.innerHTML = "";
        return;
      }
      
      const startDateNum = dateStrToNum(startDate.value);
      const endDateNum = dateStrToNum(endDate.value);
      
      const start = getDateBefore(startDateNum - 1);
      const end = getDateBefore(endDateNum);

      let totalDays;
      if (end === null) {
        totalDays = 0;
      } else if (start === null) {
        totalDays = days.indexOf(end) + 1;
      } else {
        totalDays = days.indexOf(end) - days.indexOf(start);
      }

      if (startDateNum > endDateNum) {
        numDaysElt.hidden = false;
        numDaysElt.innerHTML = "Total Days: " + totalDays;
        memberList.innerHTML = "";
        return;
      }

      let startSummary;
      if (start === null) {
        startSummary = {};
      } else {
        startSummary = attendanceTotals[start];
      }

      let endSummary;
      if (end === null) {
        endSummary = {};
      } else {
        endSummary = attendanceTotals[end];
      }

      const fillData = [];
      Object.keys(endSummary).forEach(memId => {
        let percentage;
        if (totalDays !== 0) {
          let startVal = startSummary[memId];
          if (startVal === undefined) startVal = 0;

          let endVal = endSummary[memId];
          if (endVal === undefined) endVal = 0;

          percentage = 100 * ((endVal - startVal) / totalDays);
          
          if (percentage !== 0) {
            fillData.push({
              html: '<b>' + idToName[memId] + '</b>: ' + percentage.toFixed(1) + '%',
              amount: endVal - startVal
            });
          }
        }
      });
      fillData.sort(function(a, b) {
        if (a.amount === b.amount) {
          return a.html.localeCompare(b.html);
        } else {
          return b.amount - a.amount;
        }
      });

      numDaysElt.hidden = false;
      numDaysElt.innerHTML = "Total Days: " + totalDays;
      memberList.innerHTML = fillData.map(function(d) {return d.html}).join("<br/>");
    }
    
    startDate.addEventListener("change", refreshStats);
    endDate.addEventListener("change", refreshStats);
    </script>
    `;
}
/**
 * Returns the HTML as a string for the Full Finance History Google Sheets menu option.
 */
export function fullFinanceHistoryHTML() {
  // maps month&year id to the income and expense during that month
  const moneyData: Dictionary<number, { income: number, expense: number }> = {};
  let minDateId = Number.POSITIVE_INFINITY;
  let maxDateId = Number.NEGATIVE_INFINITY;
  getIncomes().forEach(entry => {
    if (!entry.date || !entry.amount) throw ErrorType.AssertionError;
    const dateId = entry.date.getValue().getFullYear() * 12 + entry.date.getValue().getMonth();

    if (dateId < minDateId) minDateId = dateId;
    if (dateId > maxDateId) maxDateId = dateId;

    let curDetails = moneyData[dateId];
    if (!curDetails) {
      curDetails = { income: 0, expense: 0 };
      moneyData[dateId] = curDetails;
    }
    curDetails.income += entry.amount.getValue();
  });
  getExpenses().forEach(entry => {
    if (!entry.date || !entry.amount) throw ErrorType.AssertionError;
    const dateId = entry.date.getValue().getFullYear() * 12 + entry.date.getValue().getMonth();

    if (dateId < minDateId) minDateId = dateId;
    if (dateId > maxDateId) maxDateId = dateId;

    let curDetails = moneyData[dateId];
    if (!curDetails) {
      curDetails = { income: 0, expense: 0 };
      moneyData[dateId] = curDetails;
    }
    curDetails.expense += entry.amount.getValue();
  });

  const chartData: string[] = [];
  let prevTotal = 0;
  for (let dateId = minDateId; dateId <= maxDateId; ++dateId) {
    let month: string;
    switch (dateId % 12) {
      case 0:
        month = 'Jan';
        break;
      case 1:
        month = 'Feb';
        break;
      case 2:
        month = 'Mar';
        break;
      case 3:
        month = 'Apr';
        break;
      case 4:
        month = 'May';
        break;
      case 5:
        month = 'Jun';
        break;
      case 6:
        month = 'Jul';
        break;
      case 7:
        month = 'Aug';
        break;
      case 8:
        month = 'Sep';
        break;
      case 9:
        month = 'Oct';
        break;
      case 10:
        month = 'Nov';
        break;
      case 11:
        month = 'Dec';
        break;
      default:
        throw ErrorType.AssertionError;
    }
    const year = Math.floor(dateId / 12);

    const startAsNum = prevTotal;
    const start = centsToString(new IntData(startAsNum));

    const details = moneyData[dateId];
    if (!details) {
      chartData.push(`
        {
          "date": "${month}<br>${year}",
          "startAsNum": ${startAsNum},
          "endAsNum": ${startAsNum},
          "start": "${start}",
          "end": "${start}",
          "income": "$0.00",
          "expense": "$0.00"
        }
      `);
    } else {
      const income = centsToString(new IntData(details.income));
      const expense = centsToString(new IntData(details.expense));
      const endAsNum = prevTotal + details.income - details.expense;
      const end = centsToString(new IntData(endAsNum));

      chartData.push(`
        {
          "date": "${month}<br>${year}",
          "startAsNum": ${startAsNum},
          "endAsNum": ${endAsNum},
          "start": "${start}",
          "end": "${end}",
          "income": "${income}",
          "expense": "${expense}"
        }
      `);

      prevTotal = endAsNum;
    }
  }

  return `
    <!-- Styles -->
    <style>
    #chartdiv {
      width: 100%;
      height: 430px;
    }
    </style>
    
    <!-- Resources -->
    
    <script src="https://www.amcharts.com/lib/3/amcharts.js"></script>
    <script src="https://www.amcharts.com/lib/3/serial.js"></script>
    <script src="https://www.amcharts.com/lib/3/plugins/export/export.min.js"></script>
    <link rel="stylesheet" href="https://www.amcharts.com/lib/3/plugins/export/export.css" type="text/css" media="all" />
    <script src="https://www.amcharts.com/lib/3/themes/light.js"></script>
    
    <!-- Chart code -->
    <script>
    
    var chart = AmCharts.makeChart( "chartdiv", {
      "type": "serial",
      "theme": "light",
      "dataProvider": [ ${chartData.join(',')} ],
      "valueAxes": [ {
        "axisAlpha": 0,
        "gridAlpha": 0.1,
        "position": "left"
      } ],
      "startDuration": 0,
      "graphs": [ {
        "id": "g1",
        "balloonText": "Start: <b>[[start]]</b><br>End: <b>[[end]]</b><br>Income: <b>[[income]]</b><br>Expense: <b>[[expense]]</b>",
        "fillAlphas": 0.9,
          "fillColors": "#9aee91",
        "lineColor": "#55c54a",
        "lineAlpha": 1,
        "negativeFillColors": "#fa8072",
        "negativeLineColor": "#db4c3c",
        "openField": "startAsNum",
        "type": "column",
        "valueField": "endAsNum"
      } ],
      "columnWidth": 0.85,
      "categoryField": "date",
      "categoryAxis": {
        "gridPosition": "start",
        "axisAlpha": 0,
        "gridAlpha": 0.1
      },
      "chartScrollbar": {
        "graph": "g1",
        "graphType": "line",
        "hideResizeGrips": true,
        "scrollbarHeight": 40
      },
      "chartCursor": {
        "valueLineBalloonEnabled": true
      },
      "export": {
        "enabled": true,
        "position": "bottom-right"
      }
    } );
    
    chart.addListener( "rendered", zoomChart );
    zoomChart();
    
    function zoomChart() {
      chart.zoomToIndexes( chart.dataProvider.length - 9, chart.dataProvider.length - 1 );
    }
    </script>
    
    <!-- HTML -->
    <div id="chartdiv"></div>
    `;
}

// Actions
//   Add
/**
 * Returns the HTML as a string for the Add Member Google Sheets menu option.
 */
export function addMemberHTML() {
  return `
    <!DOCTYPE html>
    <style>
    </style>
    
    <body>
    <p>
      Name:
      <input type="text" id="name">
    </p>
    <p>
      Date Joined:
      <input type="date" id="dateJoined">
    </p>
    
    <button onclick="go()">
      Go!
    </button>
    </body>

    <script>
      const today = new Date();
      let month;
      if (today.getMonth() + 1 < 10) {
        month = '0' + (today.getMonth() + 1);
      } else {
        month = (today.getMonth() + 1).toString();
      }
      let date;
      if (today.getDate() < 10) {
        date = '0' + today.getDate();
      } else {
        date = today.getDate().toString();
      }
      document.getElementById('dateJoined').value = today.getFullYear() + '-' + month + '-' + date;

      function datestrToDate(date) {
          const vals = date.split('-');
          const year = parseInt(vals[0], 10);
          const month = parseInt(vals[1], 10);
          const day = parseInt(vals[2], 10);
          return new Date(year, month - 1, day);
      }

      function go() {
        const name = document.getElementById('name').value;
        const dateJoined = datestrToDate(document.getElementById('dateJoined').value).valueOf();
        google.script.run.handleAddMember(name, dateJoined);
        google.script.host.close();
      }
    </script>
    `;
}
/**
 * Returns the HTML as a string for the Add Attendance Google Sheets menu option.
 */
export function addAttendanceHTML() {
  const nameCheckbox: string[] = [];
  getMembers().sort((a, b) => {
    if (!a.name || !b.name) throw ErrorType.AssertionError;
    return a.name.getValue().localeCompare(b.name.getValue());
  }).forEach(member => {
    if (!member.id || !member.name) throw ErrorType.AssertionError;
    nameCheckbox.push(`<input type="checkbox" class="name" value="${member.id.toString()}"/> ${capitalizeString(member.name.toString())}\n`);
  });

  const clubInfo = getClubInfo();
  let selected = {
    winter: false,
    spring: false,
    summer: false,
    fall: false,
  }
  switch (clubInfo.currentQuarterId.getQuarter()) {
    case Quarter.WINTER:
      selected.winter = true;
      break;
    case Quarter.SPRING:
      selected.spring = true;
      break;
    case Quarter.SUMMER:
      selected.summer = true;
      break;
    case Quarter.FALL:
      selected.fall = true;
      break;
  }

  const year = clubInfo.currentQuarterId.getYear();

  return `
    <!DOCTYPE html>
    <style>
    #wrapper {
      border-style: solid;
      border-color: #FFFFFF;
      width: 250px;
      height: 80px;
      overflow-y: scroll;
    }
    </style>
    
    <body>
    <p>
      Date:
      <input type="date" id="date">
    </p>
    <p>
      Members Present: 
      <div id="wrapper">
        ${nameCheckbox.join('</br>')}
      </div>
    </p>
    <p>
      Quarter:
      <select id="quarter">
        <option selected=${selected.winter}>Winter</option>
        <option selected=${selected.spring}>Spring</option>
        <option selected=${selected.summer}>Summer</option>
        <option selected=${selected.fall}>Fall</option>
      </select>
    </p>
    <p>
      Year:
      <input type="text" id="year" value="${year}">
    </p>
    
    <button onclick="go()">
      Go!
    </button>
    </body>

    <script>
      const today = new Date();
      let month;
      if (today.getMonth() + 1 < 10) {
        month = '0' + (today.getMonth() + 1);
      } else {
        month = (today.getMonth() + 1).toString();
      }
      let date;
      if (today.getDate() < 10) {
        date = '0' + today.getDate();
      } else {
        date = today.getDate().toString();
      }
      document.getElementById('date').value = today.getFullYear() + '-' + month + '-' + date;

      function datestrToDate(date) {
          const vals = date.split('-');
          const year = parseInt(vals[0], 10);
          const month = parseInt(vals[1], 10);
          const day = parseInt(vals[2], 10);
          return new Date(year, month - 1, day);
      }

      function go() {
        const date = datestrToDate(document.getElementById('date').value).valueOf();
        const nameList = [];
        for (const box of document.getElementsByClassName('name')) {
          if (box.checked) {
            nameList.push(box.value);
          }
        }
        const members = nameList.join(',');
        const quarter = document.getElementById('quarter').value;
        const year = document.getElementById('year').value;

        google.script.run.handleAddAttendance(date, members, quarter, year);
        google.script.host.close();
      }
    </script>
    `;
}
/**
 * Returns the HTML as a string for the Add Income Google Sheets menu option.
 */
export function addIncomeHTML() {
  const payTypes = getPaymentTypes().sort((a, b) => {
    if (!a.name || !b.name) throw ErrorType.AssertionError;
    return a.name.getValue().localeCompare(b.name.getValue());
  }).map(payType => {
    if (!payType.name) throw ErrorType.AssertionError;
    return `<option>${capitalizeString(payType.name.getValue())}</option>`;
  });

  return `
    <!DOCTYPE html>
    <style>
    </style>
    
    <body>
    <p>
      Date: 
      <input type="date" id="date">
    </p>
    <p>
      Amount:
      <input type="text" id="amount" value="0.00">
    </p>
    <p>
      Description:
      <input type="text" id="description">
    </p>
    <p>
      Payment Type: 
      <select id="payType">\n ${payTypes}</select>
    </p>
    
    <button onclick="go()">
      Go!
    </button>
    </body>

    <script>
      const today = new Date();
      let month;
      if (today.getMonth() + 1 < 10) {
        month = '0' + (today.getMonth() + 1);
      } else {
        month = (today.getMonth() + 1).toString();
      }
      let date;
      if (today.getDate() < 10) {
        date = '0' + today.getDate();
      } else {
        date = today.getDate().toString();
      }
      document.getElementById('date').value = today.getFullYear() + '-' + month + '-' + date;

      function datestrToDate(date) {
          const vals = date.split('-');
          const year = parseInt(vals[0], 10);
          const month = parseInt(vals[1], 10);
          const day = parseInt(vals[2], 10);
          return new Date(year, month - 1, day);
      }

      function go() {
        const date = datestrToDate(document.getElementById('date').value).valueOf();
        const amount = document.getElementById('amount').value;
        const description = document.getElementById('description').value;
        const payType = document.getElementById('payType').value;

        google.script.run.handleAddIncome(date, amount, description, payType);
        google.script.host.close();
      }
    </script>
    `;
}
/**
 * Returns the HTML as a string for the Add Expense Google Sheets menu option.
 */
export function addExpenseHTML() {
  const payTypes = getPaymentTypes().sort((a, b) => {
    if (!a.name || !b.name) throw ErrorType.AssertionError;
    return a.name.getValue().localeCompare(b.name.getValue());
  }).map(payType => {
    if (!payType.name) throw ErrorType.AssertionError;
    return `<option>${capitalizeString(payType.name.getValue())}</option>`;
  });

  return `
    <!DOCTYPE html>
    <style>
    </style>
    
    <body>
    <p>
      Date: 
      <input type="date" id="date">
    </p>
    <p>
      Amount:
      <input type="text" id="amount" value="0.00">
    </p>
    <p>
      Description:
      <input type="text" id="description">
    </p>
    <p>
      Recipient:
      <input type="text" id="recipient">
    </p>
    <p>
      Payment Type: 
      <select id="payType">\n ${payTypes}</select>
    </p>
    
    <button onclick="go()">
      Go!
    </button>
    </body>

    <script>
      const today = new Date();
      let month;
      if (today.getMonth() + 1 < 10) {
        month = '0' + (today.getMonth() + 1);
      } else {
        month = (today.getMonth() + 1).toString();
      }
      let date;
      if (today.getDate() < 10) {
        date = '0' + today.getDate();
      } else {
        date = today.getDate().toString();
      }
      document.getElementById('date').value = today.getFullYear() + '-' + month + '-' + date;

      function datestrToDate(date) {
          const vals = date.split('-');
          const year = parseInt(vals[0], 10);
          const month = parseInt(vals[1], 10);
          const day = parseInt(vals[2], 10);
          return new Date(year, month - 1, day);
      }

      function go() {
        const date = datestrToDate(document.getElementById('date').value).valueOf();
        const amount = document.getElementById('amount').value;
        const description = document.getElementById('description').value;
        const recipient = document.getElementById('recipient').value;
        const payType = document.getElementById('payType').value;

        google.script.run.handleAddExpense(date, amount, description, recipient, payType);
        google.script.host.close();
      }
    </script>
    `;
}
/**
 * Returns the HTML as a string for the Add Statement Google Sheets menu option.
 */
export function addStatementHTML() {
  const idToPayType: Dictionary<number, string> = {};
  getPaymentTypes().forEach(entry => {
    if (!entry.id || !entry.name) throw ErrorType.AssertionError;
    idToPayType[entry.id.getValue()] = capitalizeString(entry.name.getValue());
  });

  const incomes: string[] = [];
  getIncomes().sort(compareByDateDesc).forEach(entry => {
    if (!entry.id || !entry.date || !entry.amount || !entry.description || !entry.paymentTypeId || !entry.statementId) throw ErrorType.AssertionError;
    if (entry.statementId.getValue() === -1) {
      incomes.push(`<input type="checkbox" class="income" value="${entry.id.toString()}"/>${entry.date.toDateString()}, ${centsToString(entry.amount)} (${idToPayType[entry.paymentTypeId.getValue()]}) - ${entry.description.toString()}\n`);
    }
  });

  const expenses: string[] = [];
  getExpenses().sort(compareByDateDesc).forEach(entry => {
    if (!entry.id || !entry.date || !entry.amount || !entry.description || !entry.paymentTypeId || !entry.statementId) throw ErrorType.AssertionError;
    if (entry.statementId.getValue() === -1) {
      expenses.push(`<input type="checkbox" class="expense" value="${entry.id.toString()}"/>${entry.date.toDateString()}, -${centsToString(entry.amount)} (${idToPayType[entry.paymentTypeId.getValue()]}) - ${entry.description.toString()}\n`);
    }
  });
  return `
    <!DOCTYPE html>
    <style>
    .wrapper {
      border-style: solid;
      border-color: #FFFFFF;
      height: 80px;
      overflow-y: scroll;
    }
    </style>
    
    <body>
    <p>
      Date:
      <input type="date" id="date">
    </p>

    <p>
      Incomes:
      <div class="wrapper">
        ${incomes.join('</br>')}
      </div>
    </p>
    <p>
      Expenses:
      <div class="wrapper">
        ${expenses.join('</br>')}
      </div>
    </p>

    <button onclick="go()">
      Go!
    </button>
    </body>

    <script>
      const today = new Date();
      let month;
      if (today.getMonth() + 1 < 10) {
        month = '0' + (today.getMonth() + 1);
      } else {
        month = (today.getMonth() + 1).toString();
      }
      let date;
      if (today.getDate() < 10) {
        date = '0' + today.getDate();
      } else {
        date = today.getDate().toString();
      }
      document.getElementById('date').value = today.getFullYear() + '-' + month + '-' + date;

      function datestrToDate(date) {
          const vals = date.split('-');
          const year = parseInt(vals[0], 10);
          const month = parseInt(vals[1], 10);
          const day = parseInt(vals[2], 10);
          return new Date(year, month - 1, day);
      }

      function go() {
        const date = datestrToDate(document.getElementById('date').value).valueOf();
        
        const incomeList = [];
        for (const box of document.getElementsByClassName('income')) {
          if (box.checked) {
            incomeList.push(box.value);
          }
        }
        const incomes = incomeList.join('\\n');

        const expenseList = [];
        for (const box of document.getElementsByClassName('expense')) {
          if (box.checked) {
            expenseList.push(box.value);
          }
        }
        const expenses = expenseList.join('\\n');

        google.script.run.handleAddStatement(date, incomes, expenses);
        google.script.host.close();
      }
    </script>
    `;
}
/**
 * Returns the HTML as a string for the Add Recipient Google Sheets menu option.
 */
export function addRecipientHTML() {
  return `
    <!DOCTYPE html>
    <style>
    </style>
    
    <body>
    <p>
      Name:
      <input type="text" id="name">
    </p>
    
    <button onclick="go()">
      Go!
    </button>
    </body>

    <script>
      function go() {
        const name = document.getElementById('name').value;
        google.script.run.handleAddRecipient(name);
        google.script.host.close();
      }
    </script>
    `;
}
/**
 * Returns the HTML as a string for the Add Pay Type Google Sheets menu option.
 */
export function addPayTypeHTML() {
  return `
    <!DOCTYPE html>
    <style>
    </style>
    
    <body>
    <p>
      Name:
      <input type="text" id="name">
    </p>
    
    <button onclick="go()">
      Go!
    </button>
    </body>

    <script>
      function go() {
        const name = document.getElementById('name').value;
        google.script.run.handleAddPayType(name);
        google.script.host.close();
      }
    </script>
    `;
}
//   Rename
/**
 * Returns the HTML as a string for the Rename Member Google Sheets menu option.
 */
export function renameMemberHTML() {
  const memberNames = getMembers().sort((a, b) => {
    if (!a.name || !b.name) throw ErrorType.AssertionError;
    return a.name.getValue().localeCompare(b.name.getValue());
  }).map(member => {
    if (!member.name) throw ErrorType.AssertionError;
    return `<option>${capitalizeString(member.name.getValue())}</option>`;
  });
  return `
    <!DOCTYPE html>
    <style>
    </style>
    
    <body>
    <p>
      Old Name: 
      <select id="oldName">\n ${memberNames}</select>
    </p>

    <p>
      New Name:
      <input type="text" id="newName">
    </p>
    
    <button onclick="go()">
      Go!
    </button>
    </body>

    <script>
      function go() {
        const oldName = document.getElementById('oldName').value;
        const newName = document.getElementById('newName').value;
        google.script.run.handleRenameMember(oldName, newName);
        google.script.host.close();
      }
    </script>
    `;
}
/**
 * Returns the HTML as a string for the Rename Pay Type Google Sheets menu option.
 */
export function renamePaymentTypeHTML() {
  const payTypes = getPaymentTypes().sort((a, b) => {
    if (!a.name || !b.name) throw ErrorType.AssertionError;
    return a.name.getValue().localeCompare(b.name.getValue());
  }).map(member => {
    if (!member.name) throw ErrorType.AssertionError;
    return `<option>${capitalizeString(member.name.getValue())}</option>`;
  });
  return `
    <!DOCTYPE html>
    <style>
    </style>
    
    <body>
    <p>
      Old Name: 
      <select id="oldName">\n ${payTypes}</select>
    </p>

    <p>
      New Name:
      <input type="text" id="newName">
    </p>
    
    <button onclick="go()">
      Go!
    </button>
    </body>

    <script>
      function go() {
        const oldName = document.getElementById('oldName').value;
        const newName = document.getElementById('newName').value;
        google.script.run.handleRenamePaymentType(oldName, newName);
        google.script.host.close();
      }
    </script>
    `;
}
/**
 * Returns the HTML as a string for the Rename Recipient Google Sheets menu option.
 */
export function renameRecipientHTML() {
  const recipients = getRecipients().sort((a, b) => {
    if (!a.name || !b.name) throw ErrorType.AssertionError;
    return a.name.getValue().localeCompare(b.name.getValue());
  }).map(member => {
    if (!member.name) throw ErrorType.AssertionError;
    return `<option>${capitalizeString(member.name.getValue())}</option>`;
  });
  return `
    <!DOCTYPE html>
    <style>
    </style>
    
    <body>
    <p>
      Old Name: 
      <select id="oldName">\n ${recipients}</select>
    </p>

    <p>
      New Name:
      <input type="text" id="newName">
    </p>
    
    <button onclick="go()">
      Go!
    </button>
    </body>

    <script>
      function go() {
        const oldName = document.getElementById('oldName').value;
        const newName = document.getElementById('newName').value;
        google.script.run.handleRenameRecipient(oldName, newName);
        google.script.host.close();
      }
    </script>
    `;
}
//   Merge
/**
 * Returns the HTML as a string for the Merge Member Google Sheets menu option.
 */
export function mergeMemberHTML() {
  const nameSelect: string[] = [];
  const nameCheckbox: string[] = [];
  getMembers().sort((a, b) => {
    if (!a.name || !b.name) throw ErrorType.AssertionError;
    return a.name.getValue().localeCompare(b.name.getValue());
  }).forEach(member => {
    if (!member.name) throw ErrorType.AssertionError;
    nameSelect.push(`<option>${capitalizeString(member.name.getValue())}</option>`);
    nameCheckbox.push(`<input type="checkbox" class="name" value="${capitalizeString(member.name.toString())}"/> ${capitalizeString(member.name.toString())}\n`);
  });
  return `
    <!DOCTYPE html>
    <style>
    #wrapper {
      border-style: solid;
      border-color: #FFFFFF;
      width: 250px;
      height: 80px;
      overflow-y: scroll;
    }
    </style>
    
    <body>
    <p>
      Aliases:
      <div id="wrapper">
        ${nameCheckbox.join('</br>')}
      </div>
    </p>

    <p>
      Merge into:
      <select id="name">\n ${nameSelect}</select>
    </p>
    
    <button onclick="go()">
      Go!
    </button>
    </body>

    <script>
      function go() {
        const nameList = [];
        const nameBoxes = document.getElementsByClassName('name');
        for (const box of nameBoxes) {
          if (box.checked) {
            nameList.push(box.value);
          }
        }
        const aliases = nameList.join('\\n');
        const name = document.getElementById('name').value;
        google.script.run.handleMergeMember(aliases, name);
        google.script.host.close();
      }
    </script>
    `;
}
/**
 * Returns the HTML as a string for the Merge Payment Type Google Sheets menu option.
 */
export function mergePaymentTypeHTML() {
  const nameSelect: string[] = [];
  const nameCheckbox: string[] = [];
  getPaymentTypes().sort((a, b) => {
    if (!a.name || !b.name) throw ErrorType.AssertionError;
    return a.name.getValue().localeCompare(b.name.getValue());
  }).forEach(payType => {
    if (!payType.name) throw ErrorType.AssertionError;
    nameSelect.push(`<option>${capitalizeString(payType.name.getValue())}</option>`);
    nameCheckbox.push(`<input type="checkbox" class="name" value="${capitalizeString(payType.name.toString())}"/> ${capitalizeString(payType.name.toString())}\n`);
  });
  return `
    <!DOCTYPE html>
    <style>
    #wrapper {
      border-style: solid;
      border-color: #FFFFFF;
      width: 250px;
      height: 80px;
      overflow-y: scroll;
    }
    </style>
    
    <body>
    <p>
      Aliases:
      <div id="wrapper">
        ${nameCheckbox.join('</br>')}
      </div>
    </p>

    <p>
      Merge into:
      <select id="name">\n ${nameSelect}</select>
    </p>
    
    <button onclick="go()">
      Go!
    </button>
    </body>

    <script>
      function go() {
        const nameList = [];
        const nameBoxes = document.getElementsByClassName('name');
        for (const box of nameBoxes) {
          if (box.checked) {
            nameList.push(box.value);
          }
        }
        const aliases = nameList.join('\\n');
        const name = document.getElementById('name').value;
        google.script.run.handleMergePaymentType(aliases, name);
        google.script.host.close();
      }
    </script>
    `;
}
/**
 * Returns the HTML as a string for the Merge Recipient Google Sheets menu option.
 */
export function mergeRecipientHTML() {
  const nameSelect: string[] = [];
  const nameCheckbox: string[] = [];
  getRecipients().sort((a, b) => {
    if (!a.name || !b.name) throw ErrorType.AssertionError;
    return a.name.getValue().localeCompare(b.name.getValue());
  }).forEach(recipient => {
    if (!recipient.name) throw ErrorType.AssertionError;
    nameSelect.push(`<option>${capitalizeString(recipient.name.getValue())}</option>`);
    nameCheckbox.push(`<input type="checkbox" class="name" value="${capitalizeString(recipient.name.toString())}"/> ${capitalizeString(recipient.name.toString())}\n`);
  });
  return `
    <!DOCTYPE html>
    <style>
    #wrapper {
      border-style: solid;
      border-color: #FFFFFF;
      width: 250px;
      height: 80px;
      overflow-y: scroll;
    }
    </style>
    
    <body>
    <p>
      Aliases:
      <div id="wrapper">
        ${nameCheckbox.join('</br>')}
      </div>
    </p>

    <p>
      Merge into:
      <select id="name">\n ${nameSelect}</select>
    </p>
    
    <button onclick="go()">
      Go!
    </button>
    </body>

    <script>
      function go() {
        const nameList = [];
        const nameBoxes = document.getElementsByClassName('name');
        for (const box of nameBoxes) {
          if (box.checked) {
            nameList.push(box.value);
          }
        }
        const aliases = nameList.join('\\n');
        const name = document.getElementById('name').value;
        google.script.run.handleMergeRecipient(aliases, name);
        google.script.host.close();
      }
    </script>
    `;
}
/**
 * Returns the HTML as a string for the Poll Notification Google Sheets menu option.
 */
export function pollNotificationHTML() {
  return `
    <!DOCTYPE html>
    <style>
    </style>
    
    <body>
    <p>
      Title:
      <input type="text" id="title"/>
    </p>

    <p>
      Deadline:
      <input type="datetime-local" id="deadline"/>
    </p>

    <p>
      Link:
      <input type="text" id="link"/>
    </p>
    
    <button onclick="go()">
      Go!
    </button>
    </body>

    <script>
      document.getElementById('deadline').value = new Date().toISOString().substring(0, 11) + '23:59';

      function go() {
        const title = document.getElementById('title').value;
        const deadline = document.getElementById('deadline').value;
        const link = document.getElementById('link').value;
        
        google.script.run.handlePollNotification(title, deadline, link);
        google.script.host.close();
      }
    </script>
    `;
}
/**
 * Returns the HTML as a string for the Notify Members Google Sheets menu option.
 */
export function notifyMembersHTML() {
  const members: string[] = [];
  getMembers().sort((a, b) => {
    if (!a.name || !b.name) throw ErrorType.AssertionError;
    return a.name.getValue().localeCompare(b.name.getValue());
  }).forEach(member => {
    if (!member.name || !member.email) throw ErrorType.AssertionError;
    if (member.email.getValue()) {
      members.push(`<input type="checkbox" class="memberName" value="${capitalizeString(member.name.toString())}"/> ${capitalizeString(member.name.toString())}\n`);
    }
  });
  return `
    <!DOCTYPE html>
    <style>
    #memberWrapper {
      border-style: solid;
      border-color: #FFFFFF;
      width: 250px;
      height: 80px;
      overflow-y: scroll;
    }
    </style>

    <body>
    <p>
      Members:
      <div id="memberWrapper">
        ${members.join('</br>')}
      </div>
    </p>

    <p>
      Subject:
      <input type="text" id="subject"/>
    </p>

    <p>
      Body:
      <textarea rows="4" cols="30" id="body"></textarea>
    </p>
    
    <button onclick="go()">
      Go!
    </button>
    </body>

    <script>
      function go() {
        const memberList = [];
        const memberBoxes = document.getElementsByClassName('memberName');
        for (const box of memberBoxes) {
          if (box.checked) {
            memberList.push(box.value);
          }
        }
        const members = memberList.join('\\n');
        const subject = document.getElementById('subject').value;
        const body = document.getElementById('body').value;
        
        google.script.run.handleNotifyMembers(members, subject, body);
        google.script.host.close();
      }
    </script>
    `;
}
