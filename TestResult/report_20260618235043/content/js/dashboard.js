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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9090909090909091, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "JP01_TC03_Search_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC05_Select_SubProduct/actions/Catalog.action-184"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC14_SignOut_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC07_Click_AddToCart_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC08_Click_ProceedToCheckout/actions/Order.action-224"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC10_Click_Confirm_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC03_Login2/actions/Catalog.action-217"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC02_SignIN/actions/Account.action-215"], "isController": false}, {"data": [1.0, 500, 1500, "JP03_TC08_SignOut1/actions/Account.action-188"], "isController": false}, {"data": [1.0, 500, 1500, "JP03_TC02_SignIN/actions/Account.action;jsessionid=64794F0FA7C8E7F671060090EA8E315B-179"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC13_Click_OrderID_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP02_TC04_Select_SubProduct_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC03_Login_1_1"], "isController": true}, {"data": [0.5, 500, 1500, "JP03_TC01_HomePage_Launch/actions/Catalog.action-175"], "isController": false}, {"data": [1.0, 500, 1500, "JP03_TC06_SelectItemID_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC04_SelectProduct_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC08_SignOut2/actions/Catalog.action-189"], "isController": false}, {"data": [0.5, 500, 1500, "JP04_TC01_HomePage_Launch/actions/Catalog.action-212"], "isController": false}, {"data": [0.5, 500, 1500, "JP04_TC12_GoTo_MyOrders_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC10_Click_Confirm/actions/Order.action-226"], "isController": false}, {"data": [0.5, 500, 1500, "JP01_TC01_HomePage_launch/-4"], "isController": false}, {"data": [0.5, 500, 1500, "JP04_TC12_GoTo_MyOrders/actions/Order.action-228"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC04_SelectProduct/actions/Catalog.action-218"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC14_SignOut2/actions/Catalog.action-231"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC05_SelectSubProduct_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP01_TC02_Click_EnterTheStore/actions/Catalog.action-13"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC06_Select_ITEMID/actions/Catalog.action-221"], "isController": false}, {"data": [1.0, 500, 1500, "JP02_TC03_Select_Product_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC13_Click_OrderID/actions/Order.action-229"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC09_Click_Continue/actions/Order.action-225"], "isController": false}, {"data": [1.0, 500, 1500, "JP02_TC05_Select_ItemID/actions/Catalog.action-61"], "isController": false}, {"data": [0.5, 500, 1500, "JP01_TC01_HomePage_launch_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC09_Click_Continue_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC03_Login_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP02_TC05_Select_ItemID_1_1"], "isController": true}, {"data": [0.0, 500, 1500, "JP02_TC02_Click_EnterTheStore_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC04_Select_Product/actions/Catalog.action-183"], "isController": false}, {"data": [1.0, 500, 1500, "JP03_TC06_SelectItemID/actions/Catalog.action-186"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC07_Click_AddToCart/actions/Cart.action-223"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC14_SignOut1/actions/Account.action-230"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC07_Click_AddToCart_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP01_TC02_Click_EnterTheStore_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP01_TC03_Search/actions/Catalog.action;jsessionid=FBAEF459EE3D12E0BBF243058232AB9F-31"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC02_SignIN_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC08_SignOut_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC07_Click_AddToCart/actions/Cart.action-187"], "isController": false}, {"data": [1.0, 500, 1500, "JP02_TC04_Select_SubProduct/actions/Catalog.action-60"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC03_Login1/actions/Account.action-216"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC06_Select_ITEMID_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC08_Click_ProceedToCheckout_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC04_Select_Product_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC05_SelectSubProduct/actions/Catalog.action-219"], "isController": false}, {"data": [1.0, 500, 1500, "JP03_TC03_Login2/actions/Catalog.action-182"], "isController": false}, {"data": [1.0, 500, 1500, "JP02_TC03_Select_Product/actions/Catalog.action-58"], "isController": false}, {"data": [1.0, 500, 1500, "JO03_TC02_SignIN_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC03_Login1/actions/Account.action-181"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC11_GoTo_MyAccount/actions/Account.action-227"], "isController": false}, {"data": [0.5, 500, 1500, "JP03_TC01_HomePage_Launch_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC11_GoTo_MyAccount_1_1"], "isController": true}, {"data": [0.5, 500, 1500, "JP04_TC01_HomePage_Launch_1_1"], "isController": true}, {"data": [0.0, 500, 1500, "JP02_TC02_Click_EnterTheStore/actions/Catalog.action-57"], "isController": false}, {"data": [1.0, 500, 1500, "JP03_TC05_Select_SubProduct_1_1"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 37, 0, 0.0, 295.05405405405395, 2, 1529, 157.0, 1449.2, 1487.6000000000001, 1529.0, 0.4687935534551352, 1.763184917676051, 0.2736196326305653], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["JP01_TC03_Search_1_1", 1, 0, 0.0, 159.0, 159, 159, 159.0, 159.0, 159.0, 159.0, 6.289308176100629, 25.065104166666668, 5.9392197327044025], "isController": true}, {"data": ["JP03_TC05_Select_SubProduct/actions/Catalog.action-184", 1, 0, 0.0, 160.0, 160, 160, 160.0, 160.0, 160.0, 160.0, 6.25, 24.25537109375, 4.046630859375], "isController": false}, {"data": ["JP04_TC14_SignOut_1_1", 1, 0, 0.0, 313.0, 313, 313, 313.0, 313.0, 313.0, 313.0, 3.1948881789137378, 16.46740215654952, 3.921850039936102], "isController": true}, {"data": ["JP03_TC07_Click_AddToCart_1_1", 1, 0, 0.0, 165.0, 165, 165, 165.0, 165.0, 165.0, 165.0, 6.0606060606060606, 28.539299242424242, 3.888494318181818], "isController": true}, {"data": ["JP04_TC08_Click_ProceedToCheckout/actions/Order.action-224", 1, 0, 0.0, 175.0, 175, 175, 175.0, 175.0, 175.0, 175.0, 5.714285714285714, 30.99888392857143, 3.599330357142857], "isController": false}, {"data": ["JP04_TC10_Click_Confirm_1_1", 1, 0, 0.0, 165.0, 165, 165, 165.0, 165.0, 165.0, 165.0, 6.0606060606060606, 31.966145833333332, 3.6754261363636362], "isController": true}, {"data": ["JP04_TC03_Login2/actions/Catalog.action-217", 1, 0, 0.0, 153.0, 153, 153, 153.0, 153.0, 153.0, 153.0, 6.5359477124183005, 32.82015931372549, 3.90625], "isController": false}, {"data": ["JP04_TC02_SignIN/actions/Account.action-215", 1, 0, 0.0, 155.0, 155, 155, 155.0, 155.0, 155.0, 155.0, 6.451612903225806, 25.80015120967742, 3.8558467741935485], "isController": false}, {"data": ["JP03_TC08_SignOut1/actions/Account.action-188", 1, 0, 0.0, 153.0, 153, 153, 153.0, 153.0, 153.0, 153.0, 6.5359477124183005, 1.4680351307189543, 4.097732843137255], "isController": false}, {"data": ["JP03_TC02_SignIN/actions/Account.action;jsessionid=64794F0FA7C8E7F671060090EA8E315B-179", 1, 0, 0.0, 157.0, 157, 157, 157.0, 157.0, 157.0, 157.0, 6.369426751592357, 25.483927149681527, 4.080414012738854], "isController": false}, {"data": ["JP04_TC13_Click_OrderID_1_1", 1, 0, 0.0, 161.0, 161, 161, 161.0, 161.0, 161.0, 161.0, 6.211180124223602, 32.29934976708074, 3.8455939440993787], "isController": true}, {"data": ["JP02_TC04_Select_SubProduct_1_1", 1, 0, 0.0, 153.0, 153, 153, 153.0, 153.0, 153.0, 153.0, 6.5359477124183005, 26.20761846405229, 4.225388071895425], "isController": true}, {"data": ["JP04_TC03_Login_1_1", 1, 0, 0.0, 305.0, 305, 305, 305.0, 305.0, 305.0, 305.0, 3.278688524590164, 17.20030737704918, 5.062115778688525], "isController": true}, {"data": ["JP03_TC01_HomePage_Launch/actions/Catalog.action-175", 1, 0, 0.0, 1449.0, 1449, 1449, 1449.0, 1449.0, 1449.0, 1449.0, 0.6901311249137336, 3.8172877846790887, 0.35382699275362317], "isController": false}, {"data": ["JP03_TC06_SelectItemID_1_1", 1, 0, 0.0, 159.0, 159, 159, 159.0, 159.0, 159.0, 159.0, 6.289308176100629, 24.346501572327043, 4.029088050314465], "isController": true}, {"data": ["JP04_TC04_SelectProduct_1_1", 1, 0, 0.0, 154.0, 154, 154, 154.0, 154.0, 154.0, 154.0, 6.493506493506494, 24.12870332792208, 4.0203936688311686], "isController": true}, {"data": ["JP03_TC08_SignOut2/actions/Catalog.action-189", 1, 0, 0.0, 165.0, 165, 165, 165.0, 165.0, 165.0, 165.0, 6.0606060606060606, 29.876893939393938, 3.7464488636363633], "isController": false}, {"data": ["JP04_TC01_HomePage_Launch/actions/Catalog.action-212", 1, 0, 0.0, 1483.0, 1483, 1483, 1483.0, 1483.0, 1483.0, 1483.0, 0.6743088334457181, 3.7297707349966283, 0.3457149780849629], "isController": false}, {"data": ["JP04_TC12_GoTo_MyOrders_1_1", 1, 0, 0.0, 542.0, 542, 542, 542.0, 542.0, 542.0, 542.0, 1.8450184501845017, 9.79625518911439, 1.1297134455719557], "isController": true}, {"data": ["JP04_TC10_Click_Confirm/actions/Order.action-226", 1, 0, 0.0, 165.0, 165, 165, 165.0, 165.0, 165.0, 165.0, 6.0606060606060606, 31.966145833333332, 3.6754261363636362], "isController": false}, {"data": ["JP01_TC01_HomePage_launch/-4", 1, 0, 0.0, 1450.0, 1450, 1450, 1450.0, 1450.0, 1450.0, 1450.0, 0.689655172413793, 0.9779094827586208, 0.3064385775862069], "isController": false}, {"data": ["JP04_TC12_GoTo_MyOrders/actions/Order.action-228", 1, 0, 0.0, 542.0, 542, 542, 542.0, 542.0, 542.0, 542.0, 1.8450184501845017, 9.79625518911439, 1.1297134455719557], "isController": false}, {"data": ["JP04_TC04_SelectProduct/actions/Catalog.action-218", 1, 0, 0.0, 154.0, 154, 154, 154.0, 154.0, 154.0, 154.0, 6.493506493506494, 24.12870332792208, 4.0203936688311686], "isController": false}, {"data": ["JP04_TC14_SignOut2/actions/Catalog.action-231", 1, 0, 0.0, 157.0, 157, 157, 157.0, 157.0, 157.0, 157.0, 6.369426751592357, 31.399283439490446, 3.881369426751592], "isController": false}, {"data": ["JP04_TC05_SelectSubProduct_1_1", 1, 0, 0.0, 156.0, 156, 156, 156.0, 156.0, 156.0, 156.0, 6.41025641025641, 26.74278846153846, 4.169170673076923], "isController": true}, {"data": ["JP01_TC02_Click_EnterTheStore/actions/Catalog.action-13", 1, 0, 0.0, 168.0, 168, 168, 168.0, 168.0, 168.0, 168.0, 5.952380952380952, 32.92410714285714, 3.0517578125], "isController": false}, {"data": ["JP04_TC06_Select_ITEMID/actions/Catalog.action-221", 1, 0, 0.0, 153.0, 153, 153, 153.0, 153.0, 153.0, 153.0, 6.5359477124183005, 25.192759395424837, 4.187091503267974], "isController": false}, {"data": ["JP02_TC03_Select_Product_1_1", 1, 0, 0.0, 156.0, 156, 156, 156.0, 156.0, 156.0, 156.0, 6.41025641025641, 24.58934294871795, 3.9438100961538463], "isController": true}, {"data": ["JP04_TC13_Click_OrderID/actions/Order.action-229", 1, 0, 0.0, 161.0, 161, 161, 161.0, 161.0, 161.0, 161.0, 6.211180124223602, 32.29934976708074, 3.8455939440993787], "isController": false}, {"data": ["JP04_TC09_Click_Continue/actions/Order.action-225", 1, 0, 0.0, 161.0, 161, 161, 161.0, 161.0, 161.0, 161.0, 6.211180124223602, 28.49014945652174, 7.412170031055901], "isController": false}, {"data": ["JP02_TC05_Select_ItemID/actions/Catalog.action-61", 1, 0, 0.0, 161.0, 161, 161, 161.0, 161.0, 161.0, 161.0, 6.211180124223602, 23.09176048136646, 3.972971661490683], "isController": false}, {"data": ["JP01_TC01_HomePage_launch_1_1", 1, 0, 0.0, 1450.0, 1450, 1450, 1450.0, 1450.0, 1450.0, 1450.0, 0.689655172413793, 0.9779094827586208, 0.3064385775862069], "isController": true}, {"data": ["JP04_TC09_Click_Continue_1_1", 1, 0, 0.0, 161.0, 161, 161, 161.0, 161.0, 161.0, 161.0, 6.211180124223602, 28.49014945652174, 7.412170031055901], "isController": true}, {"data": ["JP03_TC03_Login_1_1", 1, 0, 0.0, 319.0, 319, 319, 319.0, 319.0, 319.0, 319.0, 3.134796238244514, 16.445434952978054, 5.066491967084639], "isController": true}, {"data": ["JP02_TC05_Select_ItemID_1_1", 1, 0, 0.0, 161.0, 161, 161, 161.0, 161.0, 161.0, 161.0, 6.211180124223602, 23.09176048136646, 3.972971661490683], "isController": true}, {"data": ["JP02_TC02_Click_EnterTheStore_1_1", 1, 0, 0.0, 1529.0, 1529, 1529, 1529.0, 1529.0, 1529.0, 1529.0, 0.6540222367560498, 3.6175604970569, 0.33531413505559193], "isController": true}, {"data": ["JP03_TC04_Select_Product/actions/Catalog.action-183", 1, 0, 0.0, 156.0, 156, 156, 156.0, 156.0, 156.0, 156.0, 6.41025641025641, 23.80684094551282, 3.9500701121794872], "isController": false}, {"data": ["JP03_TC06_SelectItemID/actions/Catalog.action-186", 1, 0, 0.0, 159.0, 159, 159, 159.0, 159.0, 159.0, 159.0, 6.289308176100629, 24.346501572327043, 4.029088050314465], "isController": false}, {"data": ["JP04_TC07_Click_AddToCart/actions/Cart.action-223", 1, 0, 0.0, 154.0, 154, 154, 154.0, 154.0, 154.0, 154.0, 6.493506493506494, 30.539772727272727, 4.166243912337662], "isController": false}, {"data": ["JP04_TC14_SignOut1/actions/Account.action-230", 1, 0, 0.0, 156.0, 156, 156, 156.0, 156.0, 156.0, 156.0, 6.41025641025641, 1.439803685897436, 3.962590144230769], "isController": false}, {"data": ["JP04_TC07_Click_AddToCart_1_1", 1, 0, 0.0, 154.0, 154, 154, 154.0, 154.0, 154.0, 154.0, 6.493506493506494, 30.539772727272727, 4.166243912337662], "isController": true}, {"data": ["JP01_TC02_Click_EnterTheStore_1_1", 1, 0, 0.0, 168.0, 168, 168, 168.0, 168.0, 168.0, 168.0, 5.952380952380952, 32.92410714285714, 3.0517578125], "isController": true}, {"data": ["JP01_TC03_Search/actions/Catalog.action;jsessionid=FBAEF459EE3D12E0BBF243058232AB9F-31", 1, 0, 0.0, 159.0, 159, 159, 159.0, 159.0, 159.0, 159.0, 6.289308176100629, 25.065104166666668, 5.9392197327044025], "isController": false}, {"data": ["JP04_TC02_SignIN_1_1", 1, 0, 0.0, 155.0, 155, 155, 155.0, 155.0, 155.0, 155.0, 6.451612903225806, 25.80015120967742, 3.8558467741935485], "isController": true}, {"data": ["JP03_TC08_SignOut_1_1", 1, 0, 0.0, 318.0, 318, 318, 318.0, 318.0, 318.0, 318.0, 3.1446540880503147, 16.20848073899371, 3.915462853773585], "isController": true}, {"data": ["JP03_TC07_Click_AddToCart/actions/Cart.action-187", 1, 0, 0.0, 165.0, 165, 165, 165.0, 165.0, 165.0, 165.0, 6.0606060606060606, 28.539299242424242, 3.888494318181818], "isController": false}, {"data": ["JP02_TC04_Select_SubProduct/actions/Catalog.action-60", 1, 0, 0.0, 153.0, 153, 153, 153.0, 153.0, 153.0, 153.0, 6.5359477124183005, 26.20761846405229, 4.225388071895425], "isController": false}, {"data": ["JP04_TC03_Login1/actions/Account.action-216", 1, 0, 0.0, 152.0, 152, 152, 152.0, 152.0, 152.0, 152.0, 6.578947368421052, 1.4776932565789473, 6.2255859375], "isController": false}, {"data": ["JP04_TC06_Select_ITEMID_1_1", 1, 0, 0.0, 153.0, 153, 153, 153.0, 153.0, 153.0, 153.0, 6.5359477124183005, 25.192759395424837, 4.187091503267974], "isController": true}, {"data": ["JP04_TC08_Click_ProceedToCheckout_1_1", 1, 0, 0.0, 175.0, 175, 175, 175.0, 175.0, 175.0, 175.0, 5.714285714285714, 30.99888392857143, 3.599330357142857], "isController": true}, {"data": ["JP03_TC04_Select_Product_1_1", 1, 0, 0.0, 156.0, 156, 156, 156.0, 156.0, 156.0, 156.0, 6.41025641025641, 23.80684094551282, 3.9500701121794872], "isController": true}, {"data": ["JP04_TC05_SelectSubProduct/actions/Catalog.action-219", 1, 0, 0.0, 156.0, 156, 156, 156.0, 156.0, 156.0, 156.0, 6.41025641025641, 26.74278846153846, 4.169170673076923], "isController": false}, {"data": ["JP03_TC03_Login2/actions/Catalog.action-182", 1, 0, 0.0, 156.0, 156, 156, 156.0, 156.0, 156.0, 156.0, 6.41025641025641, 32.18900240384615, 4.106570512820513], "isController": false}, {"data": ["JP02_TC03_Select_Product/actions/Catalog.action-58", 1, 0, 0.0, 156.0, 156, 156, 156.0, 156.0, 156.0, 156.0, 6.41025641025641, 24.58934294871795, 3.9438100961538463], "isController": false}, {"data": ["JO03_TC02_SignIN_1_1", 1, 0, 0.0, 157.0, 157, 157, 157.0, 157.0, 157.0, 157.0, 6.369426751592357, 25.483927149681527, 4.080414012738854], "isController": true}, {"data": ["JP03_TC03_Login1/actions/Account.action-181", 1, 0, 0.0, 163.0, 163, 163, 163.0, 163.0, 163.0, 163.0, 6.134969325153374, 1.377971625766871, 5.9851898006134965], "isController": false}, {"data": ["Debug Sampler", 4, 0, 0.0, 5.0, 2, 10, 4.0, 10.0, 10.0, 10.0, 0.0621204826761504, 0.1018557523566958, 0.0], "isController": false}, {"data": ["JP04_TC11_GoTo_MyAccount/actions/Account.action-227", 1, 0, 0.0, 161.0, 161, 161, 161.0, 161.0, 161.0, 161.0, 6.211180124223602, 39.09282802795031, 3.8819875776397517], "isController": false}, {"data": ["JP03_TC01_HomePage_Launch_1_1", 1, 0, 0.0, 1449.0, 1449, 1449, 1449.0, 1449.0, 1449.0, 1449.0, 0.6901311249137336, 3.8172877846790887, 0.35382699275362317], "isController": true}, {"data": ["JP04_TC11_GoTo_MyAccount_1_1", 1, 0, 0.0, 161.0, 161, 161, 161.0, 161.0, 161.0, 161.0, 6.211180124223602, 39.09282802795031, 3.8819875776397517], "isController": true}, {"data": ["JP04_TC01_HomePage_Launch_1_1", 1, 0, 0.0, 1483.0, 1483, 1483, 1483.0, 1483.0, 1483.0, 1483.0, 0.6743088334457181, 3.7297707349966283, 0.3457149780849629], "isController": true}, {"data": ["JP02_TC02_Click_EnterTheStore/actions/Catalog.action-57", 1, 0, 0.0, 1529.0, 1529, 1529, 1529.0, 1529.0, 1529.0, 1529.0, 0.6540222367560498, 3.6175604970569, 0.33531413505559193], "isController": false}, {"data": ["JP03_TC05_Select_SubProduct_1_1", 1, 0, 0.0, 160.0, 160, 160, 160.0, 160.0, 160.0, 160.0, 6.25, 24.25537109375, 4.046630859375], "isController": true}]}, function(index, item){
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
