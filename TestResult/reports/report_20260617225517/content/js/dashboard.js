/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8636363636363636, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "JP01_TC03_Search_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC05_Select_SubProduct/actions/Catalog.action-184"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC14_SignOut_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC07_Click_AddToCart_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC08_Click_ProceedToCheckout/actions/Order.action-224"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC10_Click_Confirm_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC03_Login2/actions/Catalog.action-217"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC02_SignIN/actions/Account.action-215"], "isController": false}, {"data": [1.0, 500, 1500, "JP03_TC08_SignOut1/actions/Account.action-188"], "isController": false}, {"data": [1.0, 500, 1500, "JP03_TC02_SignIN/actions/Account.action;jsessionid=64794F0FA7C8E7F671060090EA8E315B-179"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC13_Click_OrderID_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP02_TC04_Select_SubProduct_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC03_Login_1_1"], "isController": true}, {"data": [0.0, 500, 1500, "JP03_TC01_HomePage_Launch/actions/Catalog.action-175"], "isController": false}, {"data": [1.0, 500, 1500, "JP03_TC06_SelectItemID_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC04_SelectProduct_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC08_SignOut2/actions/Catalog.action-189"], "isController": false}, {"data": [0.0, 500, 1500, "JP04_TC01_HomePage_Launch/actions/Catalog.action-212"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC12_GoTo_MyOrders_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC10_Click_Confirm/actions/Order.action-226"], "isController": false}, {"data": [0.0, 500, 1500, "JP01_TC01_HomePage_launch/-4"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC12_GoTo_MyOrders/actions/Order.action-228"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC04_SelectProduct/actions/Catalog.action-218"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC14_SignOut2/actions/Catalog.action-231"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC05_SelectSubProduct_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP01_TC02_Click_EnterTheStore/actions/Catalog.action-13"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC06_Select_ITEMID/actions/Catalog.action-221"], "isController": false}, {"data": [1.0, 500, 1500, "JP02_TC03_Select_Product_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC13_Click_OrderID/actions/Order.action-229"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC09_Click_Continue/actions/Order.action-225"], "isController": false}, {"data": [1.0, 500, 1500, "JP02_TC05_Select_ItemID/actions/Catalog.action-61"], "isController": false}, {"data": [0.0, 500, 1500, "JP01_TC01_HomePage_launch_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC09_Click_Continue_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC03_Login_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP02_TC05_Select_ItemID_1_1"], "isController": true}, {"data": [0.0, 500, 1500, "JP02_TC02_Click_EnterTheStore_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC04_Select_Product/actions/Catalog.action-183"], "isController": false}, {"data": [1.0, 500, 1500, "JP03_TC06_SelectItemID/actions/Catalog.action-186"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC07_Click_AddToCart/actions/Cart.action-223"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC14_SignOut1/actions/Account.action-230"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC07_Click_AddToCart_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP01_TC02_Click_EnterTheStore_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP01_TC03_Search/actions/Catalog.action;jsessionid=FBAEF459EE3D12E0BBF243058232AB9F-31"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC02_SignIN_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC08_SignOut_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC07_Click_AddToCart/actions/Cart.action-187"], "isController": false}, {"data": [1.0, 500, 1500, "JP02_TC04_Select_SubProduct/actions/Catalog.action-60"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC03_Login1/actions/Account.action-216"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC06_Select_ITEMID_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC08_Click_ProceedToCheckout_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC04_Select_Product_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC05_SelectSubProduct/actions/Catalog.action-219"], "isController": false}, {"data": [1.0, 500, 1500, "JP03_TC03_Login2/actions/Catalog.action-182"], "isController": false}, {"data": [1.0, 500, 1500, "JP02_TC03_Select_Product/actions/Catalog.action-58"], "isController": false}, {"data": [1.0, 500, 1500, "JO03_TC02_SignIN_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC03_Login1/actions/Account.action-181"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.5, 500, 1500, "JP04_TC11_GoTo_MyAccount/actions/Account.action-227"], "isController": false}, {"data": [0.0, 500, 1500, "JP03_TC01_HomePage_Launch_1_1"], "isController": true}, {"data": [0.5, 500, 1500, "JP04_TC11_GoTo_MyAccount_1_1"], "isController": true}, {"data": [0.0, 500, 1500, "JP04_TC01_HomePage_Launch_1_1"], "isController": true}, {"data": [0.0, 500, 1500, "JP02_TC02_Click_EnterTheStore/actions/Catalog.action-57"], "isController": false}, {"data": [1.0, 500, 1500, "JP03_TC05_Select_SubProduct_1_1"], "isController": true}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 37, 0, 0.0, 354.48648648648646, 1, 1879, 183.0, 1831.6000000000001, 1866.4, 1879.0, 0.4539431712224567, 1.698237251251411, 0.26483213304215536], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["JP01_TC03_Search_1_1", 1, 0, 0.0, 185.0, 185, 185, 185.0, 185.0, 185.0, 185.0, 5.405405405405405, 21.54244087837838, 5.104518581081082], "isController": true}, {"data": ["JP03_TC05_Select_SubProduct/actions/Catalog.action-184", 1, 0, 0.0, 169.0, 169, 169, 169.0, 169.0, 169.0, 169.0, 5.9171597633136095, 22.90010170118343, 3.8253513313609466], "isController": false}, {"data": ["JP04_TC14_SignOut_1_1", 1, 0, 0.0, 366.0, 366, 366, 366.0, 366.0, 366.0, 366.0, 2.73224043715847, 14.082778346994536, 3.3539318647540983], "isController": true}, {"data": ["JP03_TC07_Click_AddToCart_1_1", 1, 0, 0.0, 173.0, 173, 173, 173.0, 173.0, 173.0, 173.0, 5.780346820809248, 27.163114161849713, 3.6973898121387285], "isController": true}, {"data": ["JP04_TC08_Click_ProceedToCheckout/actions/Order.action-224", 1, 0, 0.0, 194.0, 194, 194, 194.0, 194.0, 194.0, 194.0, 5.154639175257732, 27.962910760309278, 3.2468186211340204], "isController": false}, {"data": ["JP04_TC10_Click_Confirm_1_1", 1, 0, 0.0, 193.0, 193, 193, 193.0, 193.0, 193.0, 193.0, 5.181347150259067, 27.3235103626943, 3.1422036917098444], "isController": true}, {"data": ["JP04_TC03_Login2/actions/Catalog.action-217", 1, 0, 0.0, 181.0, 181, 181, 181.0, 181.0, 181.0, 181.0, 5.524861878453039, 27.743007596685082, 3.301968232044199], "isController": false}, {"data": ["JP04_TC02_SignIN/actions/Account.action-215", 1, 0, 0.0, 187.0, 187, 187, 187.0, 187.0, 187.0, 187.0, 5.347593582887701, 21.39559659090909, 3.196022727272727], "isController": false}, {"data": ["JP03_TC08_SignOut1/actions/Account.action-188", 1, 0, 0.0, 163.0, 163, 163, 163.0, 163.0, 163.0, 163.0, 6.134969325153374, 1.377971625766871, 3.840347009202454], "isController": false}, {"data": ["JP03_TC02_SignIN/actions/Account.action;jsessionid=64794F0FA7C8E7F671060090EA8E315B-179", 1, 0, 0.0, 173.0, 173, 173, 173.0, 173.0, 173.0, 173.0, 5.780346820809248, 23.104452673410407, 3.7030346820809252], "isController": false}, {"data": ["JP04_TC13_Click_OrderID_1_1", 1, 0, 0.0, 192.0, 192, 192, 192.0, 192.0, 192.0, 192.0, 5.208333333333333, 27.079264322916668, 3.2246907552083335], "isController": true}, {"data": ["JP02_TC04_Select_SubProduct_1_1", 1, 0, 0.0, 178.0, 178, 178, 178.0, 178.0, 178.0, 178.0, 5.617977528089887, 21.050956811797754, 3.637420997191011], "isController": true}, {"data": ["JP04_TC03_Login_1_1", 1, 0, 0.0, 365.0, 365, 365, 365.0, 365.0, 365.0, 365.0, 2.73972602739726, 14.372859589041097, 4.2299871575342465], "isController": true}, {"data": ["JP03_TC01_HomePage_Launch/actions/Catalog.action-175", 1, 0, 0.0, 1826.0, 1826, 1826, 1826.0, 1826.0, 1826.0, 1826.0, 0.547645125958379, 3.0291621029572835, 0.28077508899233294], "isController": false}, {"data": ["JP03_TC06_SelectItemID_1_1", 1, 0, 0.0, 167.0, 167, 167, 167.0, 167.0, 167.0, 167.0, 5.9880239520958085, 23.11002994011976, 3.8302301646706582], "isController": true}, {"data": ["JP04_TC04_SelectProduct_1_1", 1, 0, 0.0, 187.0, 187, 187, 187.0, 187.0, 187.0, 187.0, 5.347593582887701, 19.839363302139038, 3.290023395721925], "isController": true}, {"data": ["JP03_TC08_SignOut2/actions/Catalog.action-189", 1, 0, 0.0, 167.0, 167, 167, 167.0, 167.0, 167.0, 167.0, 5.9880239520958085, 29.519086826347305, 3.6957335329341316], "isController": false}, {"data": ["JP04_TC01_HomePage_Launch/actions/Catalog.action-212", 1, 0, 0.0, 1879.0, 1879, 1879, 1879.0, 1879.0, 1879.0, 1879.0, 0.532197977647685, 2.9437200638637573, 0.27285540846194783], "isController": false}, {"data": ["JP04_TC12_GoTo_MyOrders_1_1", 1, 0, 0.0, 249.0, 249, 249, 249.0, 249.0, 249.0, 249.0, 4.016064257028112, 19.523406124497992, 2.459054969879518], "isController": true}, {"data": ["JP04_TC10_Click_Confirm/actions/Order.action-226", 1, 0, 0.0, 193.0, 193, 193, 193.0, 193.0, 193.0, 193.0, 5.181347150259067, 27.3235103626943, 3.1422036917098444], "isController": false}, {"data": ["JP01_TC01_HomePage_launch/-4", 1, 0, 0.0, 1854.0, 1854, 1854, 1854.0, 1854.0, 1854.0, 1854.0, 0.5393743257820928, 0.7648159385113268, 0.2396633967098166], "isController": false}, {"data": ["JP04_TC12_GoTo_MyOrders/actions/Order.action-228", 1, 0, 0.0, 249.0, 249, 249, 249.0, 249.0, 249.0, 249.0, 4.016064257028112, 19.523406124497992, 2.459054969879518], "isController": false}, {"data": ["JP04_TC04_SelectProduct/actions/Catalog.action-218", 1, 0, 0.0, 187.0, 187, 187, 187.0, 187.0, 187.0, 187.0, 5.347593582887701, 19.839363302139038, 3.290023395721925], "isController": false}, {"data": ["JP04_TC14_SignOut2/actions/Catalog.action-231", 1, 0, 0.0, 185.0, 185, 185, 185.0, 185.0, 185.0, 185.0, 5.405405405405405, 26.64695945945946, 3.293918918918919], "isController": false}, {"data": ["JP04_TC05_SelectSubProduct_1_1", 1, 0, 0.0, 192.0, 192, 192, 192.0, 192.0, 192.0, 192.0, 5.208333333333333, 21.6522216796875, 3.3721923828125], "isController": true}, {"data": ["JP01_TC02_Click_EnterTheStore/actions/Catalog.action-13", 1, 0, 0.0, 191.0, 191, 191, 191.0, 191.0, 191.0, 191.0, 5.235602094240838, 28.959424083769633, 2.6842686518324608], "isController": false}, {"data": ["JP04_TC06_Select_ITEMID/actions/Catalog.action-221", 1, 0, 0.0, 183.0, 183, 183, 183.0, 183.0, 183.0, 183.0, 5.46448087431694, 21.137508538251367, 3.5060194672131146], "isController": false}, {"data": ["JP02_TC03_Select_Product_1_1", 1, 0, 0.0, 178.0, 178, 178, 178.0, 178.0, 178.0, 178.0, 5.617977528089887, 20.11279845505618, 3.4618591994382024], "isController": true}, {"data": ["JP04_TC13_Click_OrderID/actions/Order.action-229", 1, 0, 0.0, 192.0, 192, 192, 192.0, 192.0, 192.0, 192.0, 5.208333333333333, 27.079264322916668, 3.2246907552083335], "isController": false}, {"data": ["JP04_TC09_Click_Continue/actions/Order.action-225", 1, 0, 0.0, 187.0, 187, 187, 187.0, 187.0, 187.0, 187.0, 5.347593582887701, 24.52895220588235, 6.381600935828877], "isController": false}, {"data": ["JP02_TC05_Select_ItemID/actions/Catalog.action-61", 1, 0, 0.0, 179.0, 179, 179, 179.0, 179.0, 179.0, 179.0, 5.58659217877095, 20.87879713687151, 3.5789106145251397], "isController": false}, {"data": ["JP01_TC01_HomePage_launch_1_1", 1, 0, 0.0, 1854.0, 1854, 1854, 1854.0, 1854.0, 1854.0, 1854.0, 0.5393743257820928, 0.7648159385113268, 0.2396633967098166], "isController": true}, {"data": ["JP04_TC09_Click_Continue_1_1", 1, 0, 0.0, 187.0, 187, 187, 187.0, 187.0, 187.0, 187.0, 5.347593582887701, 24.52895220588235, 6.381600935828877], "isController": true}, {"data": ["JP03_TC03_Login_1_1", 1, 0, 0.0, 337.0, 337, 337, 337.0, 337.0, 337.0, 337.0, 2.967359050445104, 15.567043768545993, 4.79587815281899], "isController": true}, {"data": ["JP02_TC05_Select_ItemID_1_1", 1, 0, 0.0, 179.0, 179, 179, 179.0, 179.0, 179.0, 179.0, 5.58659217877095, 20.87879713687151, 3.5789106145251397], "isController": true}, {"data": ["JP02_TC02_Click_EnterTheStore_1_1", 1, 0, 0.0, 1865.0, 1865, 1865, 1865.0, 1865.0, 1865.0, 1865.0, 0.5361930294906166, 2.965817694369973, 0.2749036528150134], "isController": true}, {"data": ["JP03_TC04_Select_Product/actions/Catalog.action-183", 1, 0, 0.0, 167.0, 167, 167, 167.0, 167.0, 167.0, 167.0, 5.9880239520958085, 23.770817739520957, 3.6840381736526946], "isController": false}, {"data": ["JP03_TC06_SelectItemID/actions/Catalog.action-186", 1, 0, 0.0, 167.0, 167, 167, 167.0, 167.0, 167.0, 167.0, 5.9880239520958085, 23.11002994011976, 3.8302301646706582], "isController": false}, {"data": ["JP04_TC07_Click_AddToCart/actions/Cart.action-223", 1, 0, 0.0, 193.0, 193, 193, 193.0, 193.0, 193.0, 193.0, 5.181347150259067, 24.368523316062177, 3.32436042746114], "isController": false}, {"data": ["JP04_TC14_SignOut1/actions/Account.action-230", 1, 0, 0.0, 181.0, 181, 181, 181.0, 181.0, 181.0, 181.0, 5.524861878453039, 1.240935773480663, 3.415271063535912], "isController": false}, {"data": ["JP04_TC07_Click_AddToCart_1_1", 1, 0, 0.0, 193.0, 193, 193, 193.0, 193.0, 193.0, 193.0, 5.181347150259067, 24.368523316062177, 3.32436042746114], "isController": true}, {"data": ["JP01_TC02_Click_EnterTheStore_1_1", 1, 0, 0.0, 191.0, 191, 191, 191.0, 191.0, 191.0, 191.0, 5.235602094240838, 28.959424083769633, 2.6842686518324608], "isController": true}, {"data": ["JP01_TC03_Search/actions/Catalog.action;jsessionid=FBAEF459EE3D12E0BBF243058232AB9F-31", 1, 0, 0.0, 185.0, 185, 185, 185.0, 185.0, 185.0, 185.0, 5.405405405405405, 21.54244087837838, 5.104518581081082], "isController": false}, {"data": ["JP04_TC02_SignIN_1_1", 1, 0, 0.0, 187.0, 187, 187, 187.0, 187.0, 187.0, 187.0, 5.347593582887701, 21.39559659090909, 3.196022727272727], "isController": true}, {"data": ["JP03_TC08_SignOut_1_1", 1, 0, 0.0, 330.0, 330, 330, 330.0, 330.0, 330.0, 330.0, 3.0303030303030303, 15.61908143939394, 3.7671638257575757], "isController": true}, {"data": ["JP03_TC07_Click_AddToCart/actions/Cart.action-187", 1, 0, 0.0, 173.0, 173, 173, 173.0, 173.0, 173.0, 173.0, 5.780346820809248, 27.163114161849713, 3.6973898121387285], "isController": false}, {"data": ["JP02_TC04_Select_SubProduct/actions/Catalog.action-60", 1, 0, 0.0, 178.0, 178, 178, 178.0, 178.0, 178.0, 178.0, 5.617977528089887, 21.050956811797754, 3.637420997191011], "isController": false}, {"data": ["JP04_TC03_Login1/actions/Account.action-216", 1, 0, 0.0, 184.0, 184, 184, 184.0, 184.0, 184.0, 184.0, 5.434782608695652, 1.220703125, 5.142875339673913], "isController": false}, {"data": ["JP04_TC06_Select_ITEMID_1_1", 1, 0, 0.0, 183.0, 183, 183, 183.0, 183.0, 183.0, 183.0, 5.46448087431694, 21.137508538251367, 3.5060194672131146], "isController": true}, {"data": ["JP04_TC08_Click_ProceedToCheckout_1_1", 1, 0, 0.0, 194.0, 194, 194, 194.0, 194.0, 194.0, 194.0, 5.154639175257732, 27.962910760309278, 3.2468186211340204], "isController": true}, {"data": ["JP03_TC04_Select_Product_1_1", 1, 0, 0.0, 167.0, 167, 167, 167.0, 167.0, 167.0, 167.0, 5.9880239520958085, 23.770817739520957, 3.6840381736526946], "isController": true}, {"data": ["JP04_TC05_SelectSubProduct/actions/Catalog.action-219", 1, 0, 0.0, 192.0, 192, 192, 192.0, 192.0, 192.0, 192.0, 5.208333333333333, 21.6522216796875, 3.3721923828125], "isController": false}, {"data": ["JP03_TC03_Login2/actions/Catalog.action-182", 1, 0, 0.0, 165.0, 165, 165, 165.0, 165.0, 165.0, 165.0, 6.0606060606060606, 30.433238636363637, 3.8825757575757573], "isController": false}, {"data": ["JP02_TC03_Select_Product/actions/Catalog.action-58", 1, 0, 0.0, 178.0, 178, 178, 178.0, 178.0, 178.0, 178.0, 5.617977528089887, 20.11279845505618, 3.4618591994382024], "isController": false}, {"data": ["JO03_TC02_SignIN_1_1", 1, 0, 0.0, 173.0, 173, 173, 173.0, 173.0, 173.0, 173.0, 5.780346820809248, 23.104452673410407, 3.7030346820809252], "isController": true}, {"data": ["JP03_TC03_Login1/actions/Account.action-181", 1, 0, 0.0, 172.0, 172, 172, 172.0, 172.0, 172.0, 172.0, 5.813953488372093, 1.3058684593023258, 5.672011264534884], "isController": false}, {"data": ["Debug Sampler", 4, 0, 0.0, 2.75, 1, 5, 2.5, 5.0, 5.0, 5.0, 0.06058219489292097, 0.09920038602217308, 0.0], "isController": false}, {"data": ["JP04_TC11_GoTo_MyAccount/actions/Account.action-227", 1, 0, 0.0, 566.0, 566, 566, 566.0, 566.0, 566.0, 566.0, 1.7667844522968197, 11.123495472614842, 1.1042402826855124], "isController": false}, {"data": ["JP03_TC01_HomePage_Launch_1_1", 1, 0, 0.0, 1826.0, 1826, 1826, 1826.0, 1826.0, 1826.0, 1826.0, 0.547645125958379, 3.0291621029572835, 0.28077508899233294], "isController": true}, {"data": ["JP04_TC11_GoTo_MyAccount_1_1", 1, 0, 0.0, 566.0, 566, 566, 566.0, 566.0, 566.0, 566.0, 1.7667844522968197, 11.123495472614842, 1.1042402826855124], "isController": true}, {"data": ["JP04_TC01_HomePage_Launch_1_1", 1, 0, 0.0, 1879.0, 1879, 1879, 1879.0, 1879.0, 1879.0, 1879.0, 0.532197977647685, 2.9437200638637573, 0.27285540846194783], "isController": true}, {"data": ["JP02_TC02_Click_EnterTheStore/actions/Catalog.action-57", 1, 0, 0.0, 1865.0, 1865, 1865, 1865.0, 1865.0, 1865.0, 1865.0, 0.5361930294906166, 2.965817694369973, 0.2749036528150134], "isController": false}, {"data": ["JP03_TC05_Select_SubProduct_1_1", 1, 0, 0.0, 169.0, 169, 169, 169.0, 169.0, 169.0, 169.0, 5.9171597633136095, 22.90010170118343, 3.8253513313609466], "isController": true}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 37, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
