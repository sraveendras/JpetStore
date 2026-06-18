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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9242424242424242, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "JP01_TC03_Search_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC05_Select_SubProduct/actions/Catalog.action-184"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC14_SignOut_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC07_Click_AddToCart_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC08_Click_ProceedToCheckout/actions/Order.action-224"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC10_Click_Confirm_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC03_Login2/actions/Catalog.action-217"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC02_SignIN/actions/Account.action-215"], "isController": false}, {"data": [1.0, 500, 1500, "JP03_TC08_SignOut1/actions/Account.action-188"], "isController": false}, {"data": [1.0, 500, 1500, "JP03_TC02_SignIN/actions/Account.action;jsessionid=64794F0FA7C8E7F671060090EA8E315B-179"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC13_Click_OrderID_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP02_TC04_Select_SubProduct_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC03_Login_1_1"], "isController": true}, {"data": [0.5, 500, 1500, "JP03_TC01_HomePage_Launch/actions/Catalog.action-175"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC04_SelectProduct_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC06_SelectItemID_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC08_SignOut2/actions/Catalog.action-189"], "isController": false}, {"data": [0.5, 500, 1500, "JP04_TC01_HomePage_Launch/actions/Catalog.action-212"], "isController": false}, {"data": [0.5, 500, 1500, "JP04_TC12_GoTo_MyOrders_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC10_Click_Confirm/actions/Order.action-226"], "isController": false}, {"data": [0.5, 500, 1500, "JP01_TC01_HomePage_launch/-4"], "isController": false}, {"data": [0.5, 500, 1500, "JP04_TC12_GoTo_MyOrders/actions/Order.action-228"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC04_SelectProduct/actions/Catalog.action-218"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC14_SignOut2/actions/Catalog.action-231"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC05_SelectSubProduct_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP01_TC02_Click_EnterTheStore/actions/Catalog.action-13"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC06_Select_ITEMID/actions/Catalog.action-221"], "isController": false}, {"data": [1.0, 500, 1500, "JP02_TC03_Select_Product_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC13_Click_OrderID/actions/Order.action-229"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC09_Click_Continue/actions/Order.action-225"], "isController": false}, {"data": [1.0, 500, 1500, "JP02_TC05_Select_ItemID/actions/Catalog.action-61"], "isController": false}, {"data": [0.5, 500, 1500, "JP01_TC01_HomePage_launch_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC09_Click_Continue_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC03_Login_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP02_TC05_Select_ItemID_1_1"], "isController": true}, {"data": [0.5, 500, 1500, "JP02_TC02_Click_EnterTheStore_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC04_Select_Product/actions/Catalog.action-183"], "isController": false}, {"data": [1.0, 500, 1500, "JP03_TC06_SelectItemID/actions/Catalog.action-186"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC07_Click_AddToCart/actions/Cart.action-223"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC14_SignOut1/actions/Account.action-230"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC07_Click_AddToCart_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP01_TC02_Click_EnterTheStore_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP01_TC03_Search/actions/Catalog.action;jsessionid=FBAEF459EE3D12E0BBF243058232AB9F-31"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC02_SignIN_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC08_SignOut_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC07_Click_AddToCart/actions/Cart.action-187"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC03_Login1/actions/Account.action-216"], "isController": false}, {"data": [1.0, 500, 1500, "JP02_TC04_Select_SubProduct/actions/Catalog.action-60"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC06_Select_ITEMID_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC08_Click_ProceedToCheckout_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC04_Select_Product_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC05_SelectSubProduct/actions/Catalog.action-219"], "isController": false}, {"data": [1.0, 500, 1500, "JP02_TC03_Select_Product/actions/Catalog.action-58"], "isController": false}, {"data": [1.0, 500, 1500, "JP03_TC03_Login2/actions/Catalog.action-182"], "isController": false}, {"data": [1.0, 500, 1500, "JO03_TC02_SignIN_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP03_TC03_Login1/actions/Account.action-181"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [1.0, 500, 1500, "JP04_TC11_GoTo_MyAccount/actions/Account.action-227"], "isController": false}, {"data": [0.5, 500, 1500, "JP03_TC01_HomePage_Launch_1_1"], "isController": true}, {"data": [1.0, 500, 1500, "JP04_TC11_GoTo_MyAccount_1_1"], "isController": true}, {"data": [0.5, 500, 1500, "JP04_TC01_HomePage_Launch_1_1"], "isController": true}, {"data": [0.5, 500, 1500, "JP02_TC02_Click_EnterTheStore/actions/Catalog.action-57"], "isController": false}, {"data": [1.0, 500, 1500, "JP03_TC05_Select_SubProduct_1_1"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 37, 0, 0.0, 297.40540540540553, 3, 1310, 172.0, 1276.6, 1285.7, 1310.0, 0.4510599909788002, 1.685903384778554, 0.2633762716539273], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["JP01_TC03_Search_1_1", 1, 0, 0.0, 189.0, 189, 189, 189.0, 189.0, 189.0, 189.0, 5.291005291005291, 21.086516203703702, 4.996486441798941], "isController": true}, {"data": ["JP03_TC05_Select_SubProduct/actions/Catalog.action-184", 1, 0, 0.0, 169.0, 169, 169, 169.0, 169.0, 169.0, 169.0, 5.9171597633136095, 22.917437130177515, 3.84846523668639], "isController": false}, {"data": ["JP04_TC14_SignOut_1_1", 1, 0, 0.0, 379.0, 379, 379, 379.0, 379.0, 379.0, 379.0, 2.638522427440633, 13.59972790237467, 3.238889346965699], "isController": true}, {"data": ["JP03_TC07_Click_AddToCart_1_1", 1, 0, 0.0, 172.0, 172, 172, 172.0, 172.0, 172.0, 172.0, 5.813953488372093, 27.326716933139537, 3.730241642441861], "isController": true}, {"data": ["JP04_TC08_Click_ProceedToCheckout/actions/Order.action-224", 1, 0, 0.0, 184.0, 184, 184, 184.0, 184.0, 184.0, 184.0, 5.434782608695652, 29.482634171195652, 3.423276154891304], "isController": false}, {"data": ["JP04_TC10_Click_Confirm_1_1", 1, 0, 0.0, 172.0, 172, 172, 172.0, 172.0, 172.0, 172.0, 5.813953488372093, 30.6651980377907, 3.5258448401162794], "isController": true}, {"data": ["JP04_TC03_Login2/actions/Catalog.action-217", 1, 0, 0.0, 165.0, 165, 165, 165.0, 165.0, 165.0, 165.0, 6.0606060606060606, 30.433238636363637, 3.622159090909091], "isController": false}, {"data": ["JP04_TC02_SignIN/actions/Account.action-215", 1, 0, 0.0, 170.0, 170, 170, 170.0, 170.0, 170.0, 170.0, 5.88235294117647, 23.523667279411764, 3.5156249999999996], "isController": false}, {"data": ["JP03_TC08_SignOut1/actions/Account.action-188", 1, 0, 0.0, 167.0, 167, 167, 167.0, 167.0, 167.0, 167.0, 5.9880239520958085, 1.3449663173652693, 3.754210329341317], "isController": false}, {"data": ["JP03_TC02_SignIN/actions/Account.action;jsessionid=64794F0FA7C8E7F671060090EA8E315B-179", 1, 0, 0.0, 171.0, 171, 171, 171.0, 171.0, 171.0, 171.0, 5.847953216374268, 23.374680190058477, 3.746345029239766], "isController": false}, {"data": ["JP04_TC13_Click_OrderID_1_1", 1, 0, 0.0, 181.0, 181, 181, 181.0, 181.0, 181.0, 181.0, 5.524861878453039, 28.730360842541437, 3.4206664364640886], "isController": true}, {"data": ["JP02_TC04_Select_SubProduct_1_1", 1, 0, 0.0, 176.0, 176, 176, 176.0, 176.0, 176.0, 176.0, 5.681818181818182, 21.195845170454547, 3.678755326704546], "isController": true}, {"data": ["JP04_TC03_Login_1_1", 1, 0, 0.0, 331.0, 331, 331, 331.0, 331.0, 331.0, 331.0, 3.0211480362537766, 15.849225830815708, 4.664487348942598], "isController": true}, {"data": ["JP03_TC01_HomePage_Launch/actions/Catalog.action-175", 1, 0, 0.0, 1275.0, 1275, 1275, 1275.0, 1275.0, 1275.0, 1275.0, 0.7843137254901961, 4.338235294117648, 0.40211397058823534], "isController": false}, {"data": ["JP04_TC04_SelectProduct_1_1", 1, 0, 0.0, 168.0, 168, 168, 168.0, 168.0, 168.0, 168.0, 5.952380952380952, 22.117978050595237, 3.6853608630952377], "isController": true}, {"data": ["JP03_TC06_SelectItemID_1_1", 1, 0, 0.0, 170.0, 170, 170, 170.0, 170.0, 170.0, 170.0, 5.88235294117647, 22.62752757352941, 3.768382352941176], "isController": true}, {"data": ["JP03_TC08_SignOut2/actions/Catalog.action-189", 1, 0, 0.0, 170.0, 170, 170, 170.0, 170.0, 170.0, 170.0, 5.88235294117647, 28.99816176470588, 3.63625919117647], "isController": false}, {"data": ["JP04_TC01_HomePage_Launch/actions/Catalog.action-212", 1, 0, 0.0, 1283.0, 1283, 1283, 1283.0, 1283.0, 1283.0, 1283.0, 0.779423226812159, 4.311184723304755, 0.39960663484021824], "isController": false}, {"data": ["JP04_TC12_GoTo_MyOrders_1_1", 1, 0, 0.0, 905.0, 905, 905, 905.0, 905.0, 905.0, 905.0, 1.1049723756906078, 5.536731698895028, 0.6765797651933702], "isController": true}, {"data": ["JP04_TC10_Click_Confirm/actions/Order.action-226", 1, 0, 0.0, 172.0, 172, 172, 172.0, 172.0, 172.0, 172.0, 5.813953488372093, 30.6651980377907, 3.5258448401162794], "isController": false}, {"data": ["JP01_TC01_HomePage_launch/-4", 1, 0, 0.0, 1310.0, 1310, 1310, 1310.0, 1310.0, 1310.0, 1310.0, 0.7633587786259541, 1.082418893129771, 0.3391877385496183], "isController": false}, {"data": ["JP04_TC12_GoTo_MyOrders/actions/Order.action-228", 1, 0, 0.0, 905.0, 905, 905, 905.0, 905.0, 905.0, 905.0, 1.1049723756906078, 5.536731698895028, 0.6765797651933702], "isController": false}, {"data": ["JP04_TC04_SelectProduct/actions/Catalog.action-218", 1, 0, 0.0, 168.0, 168, 168, 168.0, 168.0, 168.0, 168.0, 5.952380952380952, 22.117978050595237, 3.6853608630952377], "isController": false}, {"data": ["JP04_TC14_SignOut2/actions/Catalog.action-231", 1, 0, 0.0, 183.0, 183, 183, 183.0, 183.0, 183.0, 183.0, 5.46448087431694, 26.93818306010929, 3.3299180327868854], "isController": false}, {"data": ["JP04_TC05_SelectSubProduct_1_1", 1, 0, 0.0, 169.0, 169, 169, 169.0, 169.0, 169.0, 169.0, 5.9171597633136095, 24.685650887573964, 3.84846523668639], "isController": true}, {"data": ["JP01_TC02_Click_EnterTheStore/actions/Catalog.action-13", 1, 0, 0.0, 189.0, 189, 189, 189.0, 189.0, 189.0, 189.0, 5.291005291005291, 29.265873015873016, 2.712673611111111], "isController": false}, {"data": ["JP04_TC06_Select_ITEMID/actions/Catalog.action-221", 1, 0, 0.0, 167.0, 167, 167, 167.0, 167.0, 167.0, 167.0, 5.9880239520958085, 23.080791541916167, 3.836077844311377], "isController": false}, {"data": ["JP02_TC03_Select_Product_1_1", 1, 0, 0.0, 174.0, 174, 174, 174.0, 174.0, 174.0, 174.0, 5.747126436781609, 20.575161637931036, 3.5414421695402303], "isController": true}, {"data": ["JP04_TC13_Click_OrderID/actions/Order.action-229", 1, 0, 0.0, 181.0, 181, 181, 181.0, 181.0, 181.0, 181.0, 5.524861878453039, 28.730360842541437, 3.4206664364640886], "isController": false}, {"data": ["JP04_TC09_Click_Continue/actions/Order.action-225", 1, 0, 0.0, 183.0, 183, 183, 183.0, 183.0, 183.0, 183.0, 5.46448087431694, 25.065104166666668, 6.521089480874317], "isController": false}, {"data": ["JP02_TC05_Select_ItemID/actions/Catalog.action-61", 1, 0, 0.0, 171.0, 171, 171, 171.0, 171.0, 171.0, 171.0, 5.847953216374268, 21.68425621345029, 3.746345029239766], "isController": false}, {"data": ["JP01_TC01_HomePage_launch_1_1", 1, 0, 0.0, 1310.0, 1310, 1310, 1310.0, 1310.0, 1310.0, 1310.0, 0.7633587786259541, 1.082418893129771, 0.3391877385496183], "isController": true}, {"data": ["JP04_TC09_Click_Continue_1_1", 1, 0, 0.0, 183.0, 183, 183, 183.0, 183.0, 183.0, 183.0, 5.46448087431694, 25.065104166666668, 6.521089480874317], "isController": true}, {"data": ["JP03_TC03_Login_1_1", 1, 0, 0.0, 369.0, 369, 369, 369.0, 369.0, 369.0, 369.0, 2.710027100271003, 14.217056233062332, 4.379975440379404], "isController": true}, {"data": ["JP02_TC05_Select_ItemID_1_1", 1, 0, 0.0, 171.0, 171, 171, 171.0, 171.0, 171.0, 171.0, 5.847953216374268, 21.68425621345029, 3.746345029239766], "isController": true}, {"data": ["JP02_TC02_Click_EnterTheStore_1_1", 1, 0, 0.0, 1283.0, 1283, 1283, 1283.0, 1283.0, 1283.0, 1283.0, 0.779423226812159, 4.311184723304755, 0.39960663484021824], "isController": true}, {"data": ["JP03_TC04_Select_Product/actions/Catalog.action-183", 1, 0, 0.0, 169.0, 169, 169, 169.0, 169.0, 169.0, 169.0, 5.9171597633136095, 21.9871024408284, 3.66355399408284], "isController": false}, {"data": ["JP03_TC06_SelectItemID/actions/Catalog.action-186", 1, 0, 0.0, 170.0, 170, 170, 170.0, 170.0, 170.0, 170.0, 5.88235294117647, 22.62752757352941, 3.768382352941176], "isController": false}, {"data": ["JP04_TC07_Click_AddToCart/actions/Cart.action-223", 1, 0, 0.0, 184.0, 184, 184, 184.0, 184.0, 184.0, 184.0, 5.434782608695652, 25.56046195652174, 3.4869650135869565], "isController": false}, {"data": ["JP04_TC14_SignOut1/actions/Account.action-230", 1, 0, 0.0, 196.0, 196, 196, 196.0, 196.0, 196.0, 196.0, 5.1020408163265305, 1.1459661989795917, 3.1538982780612246], "isController": false}, {"data": ["JP04_TC07_Click_AddToCart_1_1", 1, 0, 0.0, 184.0, 184, 184, 184.0, 184.0, 184.0, 184.0, 5.434782608695652, 25.56046195652174, 3.4869650135869565], "isController": true}, {"data": ["JP01_TC02_Click_EnterTheStore_1_1", 1, 0, 0.0, 189.0, 189, 189, 189.0, 189.0, 189.0, 189.0, 5.291005291005291, 29.265873015873016, 2.712673611111111], "isController": true}, {"data": ["JP01_TC03_Search/actions/Catalog.action;jsessionid=FBAEF459EE3D12E0BBF243058232AB9F-31", 1, 0, 0.0, 189.0, 189, 189, 189.0, 189.0, 189.0, 189.0, 5.291005291005291, 21.086516203703702, 4.996486441798941], "isController": false}, {"data": ["JP04_TC02_SignIN_1_1", 1, 0, 0.0, 170.0, 170, 170, 170.0, 170.0, 170.0, 170.0, 5.88235294117647, 23.523667279411764, 3.5156249999999996], "isController": true}, {"data": ["JP03_TC08_SignOut_1_1", 1, 0, 0.0, 337.0, 337, 337, 337.0, 337.0, 337.0, 337.0, 2.967359050445104, 15.294649480712165, 3.694709755192878], "isController": true}, {"data": ["JP03_TC07_Click_AddToCart/actions/Cart.action-187", 1, 0, 0.0, 172.0, 172, 172, 172.0, 172.0, 172.0, 172.0, 5.813953488372093, 27.326716933139537, 3.730241642441861], "isController": false}, {"data": ["JP04_TC03_Login1/actions/Account.action-216", 1, 0, 0.0, 166.0, 166, 166, 166.0, 166.0, 166.0, 166.0, 6.024096385542169, 1.3530685240963856, 5.700536521084337], "isController": false}, {"data": ["JP02_TC04_Select_SubProduct/actions/Catalog.action-60", 1, 0, 0.0, 176.0, 176, 176, 176.0, 176.0, 176.0, 176.0, 5.681818181818182, 21.195845170454547, 3.678755326704546], "isController": false}, {"data": ["JP04_TC06_Select_ITEMID_1_1", 1, 0, 0.0, 167.0, 167, 167, 167.0, 167.0, 167.0, 167.0, 5.9880239520958085, 23.080791541916167, 3.836077844311377], "isController": true}, {"data": ["JP04_TC08_Click_ProceedToCheckout_1_1", 1, 0, 0.0, 184.0, 184, 184, 184.0, 184.0, 184.0, 184.0, 5.434782608695652, 29.482634171195652, 3.423276154891304], "isController": true}, {"data": ["JP03_TC04_Select_Product_1_1", 1, 0, 0.0, 169.0, 169, 169, 169.0, 169.0, 169.0, 169.0, 5.9171597633136095, 21.9871024408284, 3.66355399408284], "isController": true}, {"data": ["JP04_TC05_SelectSubProduct/actions/Catalog.action-219", 1, 0, 0.0, 169.0, 169, 169, 169.0, 169.0, 169.0, 169.0, 5.9171597633136095, 24.685650887573964, 3.84846523668639], "isController": false}, {"data": ["JP02_TC03_Select_Product/actions/Catalog.action-58", 1, 0, 0.0, 174.0, 174, 174, 174.0, 174.0, 174.0, 174.0, 5.747126436781609, 20.575161637931036, 3.5414421695402303], "isController": false}, {"data": ["JP03_TC03_Login2/actions/Catalog.action-182", 1, 0, 0.0, 198.0, 198, 198, 198.0, 198.0, 198.0, 198.0, 5.050505050505051, 25.361032196969695, 3.235479797979798], "isController": false}, {"data": ["JO03_TC02_SignIN_1_1", 1, 0, 0.0, 171.0, 171, 171, 171.0, 171.0, 171.0, 171.0, 5.847953216374268, 23.374680190058477, 3.746345029239766], "isController": true}, {"data": ["JP03_TC03_Login1/actions/Account.action-181", 1, 0, 0.0, 171.0, 171, 171, 171.0, 171.0, 171.0, 171.0, 5.847953216374268, 1.3135051169590641, 5.705180921052631], "isController": false}, {"data": ["Debug Sampler", 4, 0, 0.0, 5.0, 3, 7, 5.0, 7.0, 7.0, 7.0, 0.059186481807555154, 0.09726176978678071, 0.0], "isController": false}, {"data": ["JP04_TC11_GoTo_MyAccount/actions/Account.action-227", 1, 0, 0.0, 184.0, 184, 184, 184.0, 184.0, 184.0, 184.0, 5.434782608695652, 34.22745414402174, 3.3967391304347827], "isController": false}, {"data": ["JP03_TC01_HomePage_Launch_1_1", 1, 0, 0.0, 1275.0, 1275, 1275, 1275.0, 1275.0, 1275.0, 1275.0, 0.7843137254901961, 4.338235294117648, 0.40211397058823534], "isController": true}, {"data": ["JP04_TC11_GoTo_MyAccount_1_1", 1, 0, 0.0, 184.0, 184, 184, 184.0, 184.0, 184.0, 184.0, 5.434782608695652, 34.22745414402174, 3.3967391304347827], "isController": true}, {"data": ["JP04_TC01_HomePage_Launch_1_1", 1, 0, 0.0, 1283.0, 1283, 1283, 1283.0, 1283.0, 1283.0, 1283.0, 0.779423226812159, 4.311184723304755, 0.39960663484021824], "isController": true}, {"data": ["JP02_TC02_Click_EnterTheStore/actions/Catalog.action-57", 1, 0, 0.0, 1283.0, 1283, 1283, 1283.0, 1283.0, 1283.0, 1283.0, 0.779423226812159, 4.311184723304755, 0.39960663484021824], "isController": false}, {"data": ["JP03_TC05_Select_SubProduct_1_1", 1, 0, 0.0, 169.0, 169, 169, 169.0, 169.0, 169.0, 169.0, 5.9171597633136095, 22.917437130177515, 3.84846523668639], "isController": true}]}, function(index, item){
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
