$(document).ready(function () {
    $('.graph').html(`<div class="col-md-12 text-center p-t-15">${loading_template_plain}</div>`);

});

function formatNumber(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/* 
    plotGraph(
        x_array,    //array of x values e.g. months
        x_title,    //string
        y_data,     //array of objects e.g [{name:"Year 2018", data:[1,2,3], color: "#3330ff"}],
        y_title,    //string
        title,      //string title of entire graph
        subtitle,   //string subtitle
        container, //DOM object, preferrably document.getElementBlaBlaBla
        chartype,   //string, 'bar', 'line'
        colours,    //array of string colors e.g [ '#7CB799', '#1e779a', '#2A2E79']
    )
*/

let plotGraph = (
    x_array,
    x_title,
    y_data,
    y_title,
    title,
    subtitle,
    container,
    chartype,
    colours,
) => {
    let colo = colours || ["#1e77bf", "#8B0000", "#008000", "#2A2E79"];
    // if((chartype == 'column' || chartype == 'bar') && !JSON.stringify(colours).includes('#d88842')){colo.unshift('#d88842')}
    let chartoptions = {
        dataLabels: { enabled: true },
        colors: colo
    }
    let chart_type = chartype
    if(typeof chartype == "object" && chartype[1] == 'stack'){chartoptions.stacking = 'normal';chart_type = chartype[0]}
    Highcharts.chart(container, {
        chart: {
            type: chart_type,
        },
        title: {
            text: title,
        },
        subtitle: {
            text: subtitle || null,
        },
        exporting: {
            enabled: true,
        },
        xAxis: {
            categories: x_array,
            title: {
                text: x_title || null,
                style: {
                    color: "#333755",
                },
            },
        },
        yAxis: {
            title: {
                text: y_title || null,
                style: {
                    color: "#333755",
                },
            },
            labels: {
                overflow: "justify",
            },
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true,
                },
            },
            line: {
                dataLabels: {
                    enabled: true,
                },
            },
            column: chartoptions,
        },
        credits: {
            enabled: false,
        },
        series: y_data,
        colors: colo,
    });
};


let justFetch = async (endpoint, postoptions) => {
    if (endpoint == null || endpoint.length < 4) {
        return { error: true, type: "url", message: "Invalid endpoint URL" };
    }
    let options = postoptions || {};
    let req_method = options.method || "GET"; //PUT //POST //DELETE etc.
    let req_hd = {};
    let headers = {};
    let final_endpoint = endpoint;
    // if (!location.hostname.includes("localhost")) {
    //     let encurl = window.encodeURIComponent(window.btoa(endpoint));
    //     // console.log('encurl = '+encurl);
    //     final_endpoint = "http://localhost:5600/request/" + encurl;
    // }
    req_hd.headers = headers;
    req_hd.method = req_method;
    req_hd.Accept = "application/json";

    // console.log(`justFetch: ${final_endpoint} with headers: ${JSON.stringify(req_hd)}`);
    try {
        let result = await window.fetch(final_endpoint, req_hd);
        let result_json = await result.json();
        if (result_json.status === "ERROR") {
            throw result_json;
        }
        return result_json;
    } catch (err) {
        return { error: true, msg: err.message };
    }
};

function dateRange(startDate, endDate) {
    startDate = startDate+''
    endDate = endDate+''
    var start      = startDate.substr(4)     // startDate.split('-');
    var end        = endDate.substr(4)   // endDate.split('-');
    var startYear  = parseInt(
        startDate.substring(0,4)
        // start[0]
    );
    var endYear    = parseInt(
        endDate.substring(0,4)
        // end[0]
    );
    var dates      = [];

    for(var i = startYear; i <= endYear; i++) {
        var endMonth = i != endYear ? 12 : parseInt(end) - 1;
        var startMon = i === startYear ? parseInt(start[1])-1 : 0;
        for(var j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j+1) {
            var month = j+1;
            var displayMonth = month < 10 ? '0'+month : month;
            // dates.push([i, displayMonth, '01'].join('-'));
            dates.push(i+''+displayMonth)
        }
    }
    return dates.join(';');
}
function dateRangeBiWeek(startDate, endDate) {
    startDate = startDate+''
    endDate = endDate+''
    var start      = startDate.substr(7)   // startDate.split('-');
    var end        = endDate.substr(7)   // endDate.split('-');
    var startYear  = parseInt(
        startDate.substring(0,4)
        // start[0]
    );
    var endYear    = parseInt(
        endDate.substring(0,4)
        // end[0]
    );
    var dates      = [];
    for(var i = startYear; i <= endYear; i++) {
        var endMonth = i != endYear ? 25 : parseInt(end[1]) - 1;
        var startMon = i === startYear ? parseInt(start[1])-1 : 1;
        console.log(endMonth)
        console.log(startMon)
        for (var K = start; K <= end; K++) {
            var week = K;
            
            var displayWeek = week < 10 ? '0'+week : week;
            // dates.push([i, displayMonth, '01'].join('-'));
            dates.push(i+'BiW'+''+displayWeek)
        }
    }
    return dates.join(';');
}


const munchHash = (hash) => {
    let tt = hash.split("&").reduce((rs, itm) => {
        let pt = itm.split("=");
        rs[pt[0]] = pt[1];
        return rs;
    }, {});
    let tt_ = {}
    Object.keys(tt).map(t=>{
        let val = tt[t]
        let corr_val = decodeURIComponent(val)
        tt_[t] = corr_val
    })

    return tt_
};

const spreadHash = (hashObj) => {
    var str = "#";
    for (var key in hashObj) {
        if (str != "") {
            str += "&";
        }
        str += key + "=" + encodeURIComponent(hashObj[key]);
    }
    return str.replace("&", "");
};

window.addEventListener("hashchange", (hash_event) => {
    var hash = window.location.hash.substr(1);
    var hashObj = munchHash(hash);
    console.log("hashchange: ", hashObj);
    window.fetchData(hashObj);
});

const sumArr = (array) => {
    let sum_total = 0;
    if (array == null || array == undefined) {
        array = [0];
    }
    array.map((val) => {
        if (val == null || val == undefined) {
            val = 0;
        }
        sum_total += parseFloat(val);
    });
    return sum_total;
};
function drawbargraphs(cName,periodname,fperiodname,mechanismName,cTitle,dataToPlot,stacking){

        Highcharts.chart(cName, {
                chart: {
                type: 'column'
            },
            title: {
                text: cTitle
            },
            subtitle: {
                text: fperiodname[0] +' - '+fperiodname[1]+' '+mechanismName
            },
            xAxis: {
                categories: 
                periodname
                ,
                crosshair: true
            },
            yAxis: {
                min: 0,
                title: {
                text: 'Number '
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} </b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                stacking: stacking,
                pointPadding: 0.2,
                borderWidth: 0
                }
            },
            series: dataToPlot
            });
}
function drawArea(cName,periodname,fperiodname,mechanismName,cTitle,dataToPlot,stacking){

    console.log(dataToPlot)
    Highcharts.chart(cName, {
            chart: {
            type: 'area'
        },
        title: {
            text: cTitle
        },
        subtitle: {
            text: fperiodname[0] +' - '+fperiodname[1]+' '+mechanismName
        },
        xAxis: {
            categories: 
            periodname
            ,
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
            text: 'Number '
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f} </b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            area: {
                marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 2,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },
        series: [ {
            name: dataToPlot[0].name,
            data: dataToPlot[0].data
        }]
        });
}


function drawSpines(cName,cTitle,periodname,fperiodname,mechanismName,dataToPlot,stacking,yAxis){
    // console.log(dataToPlot)
    Highcharts.chart(cName, {
    title: {
        text: cTitle
    },
    subtitle: {
        text: fperiodname[0] +' - '+fperiodname[1]+' '+mechanismName
    },
    
    xAxis: {
        categories: periodname
    },
    yAxis: [{ // Primary yAxis
        labels: {
            format: '{value}',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        title: {
            text: 'Number ',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        }
    }, { // Secondary yAxis
        title: {
            text: yAxis,
            style: {
                color: Highcharts.getOptions().colors[0]
            }
        },
        labels: {
            format: '{value} ',
            style: {
                color: Highcharts.getOptions().colors[0]
            }
        },
        opposite: true
    }],
    plotOptions: {
        // series: {
        //     dataLabels: {
        //         enabled: true,
        //         inside: true
        //     }
        // },
        column: {
        stacking: stacking,
        pointPadding: 0.2,
        borderWidth: 0
        }
    },

    series: [{
        name: dataToPlot[0].name,
        type: dataToPlot[0].type,
        data: dataToPlot[0].data,
        tooltip: {
            valueSuffix: ''
        }

    }, {
        name: dataToPlot[1].name,
        type: dataToPlot[1].type,
        data: dataToPlot[1].data,
        tooltip: {
            valueSuffix: ' '
        }

    },{
        name: dataToPlot[2].name,
        type: dataToPlot[2].type,
        yAxis: 1,
        data: dataToPlot[2].data,
        tooltip: {
            valueSuffix: ' '
        }
    }]
});
}

function drawmultipleSpines(cName,cTitle,periodname,fperiodname,mechanismName,dataToPlot,yAxis){

       Highcharts.chart(cName, {
        title: {
            text: cTitle
        },
        subtitle: {
            text: fperiodname[0] +' - '+fperiodname[1]+' '+mechanismName
        },
        xAxis: {
            categories: periodname
        },
        yAxis: [{ // Primary yAxis
            labels: {
                format: '{value}',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            },
            title: {
                text: 'Number ',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            }
        }, { // Secondary yAxis
            title: {
                text: yAxis,
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            labels: {
                format: '{value}',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            opposite: true
        }],
    
        series: [{
            name: dataToPlot[0].name,
            type: dataToPlot[0].type,
            data: dataToPlot[0].data,
            tooltip: {
                valueSuffix: ''
            }
    
        }, {
            name: dataToPlot[1].name,
            type:  dataToPlot[1].type,
            data: dataToPlot[1].data,
            tooltip: {
                valueSuffix: ' '
            }
    
        },{
            name: dataToPlot[2].name,
            type:  dataToPlot[2].type,
            data: dataToPlot[2].data,
            tooltip: {
                valueSuffix: ' '
            }
    
        },
        {
            name: dataToPlot[3].name,
            type:  dataToPlot[3].type,
            data: dataToPlot[3].data,
            tooltip: {
                valueSuffix: ' '
            }
    
        },{
            name: dataToPlot[4].name,
            type:  dataToPlot[4].type,
            yAxis: 1,
            data: dataToPlot[4].data,
            tooltip: {
                valueSuffix: ' '
            }
        }]
    }); 
}
function drawTestingCascade(cName,cTitle,periodname,fperiodname,mechanismName,dataToPlot,stacking,yAxis){
    // console.log(yAxis)

    Highcharts.chart(cName, {
     title: {
         text: cTitle
     },
     subtitle: {
         text: fperiodname[0] +' - '+fperiodname[1]+' '+mechanismName
     },
     xAxis: {
         categories: periodname
     },
     yAxis: [{ // Primary yAxis
         labels: {
             format: '{value}',
             style: {
                 color: Highcharts.getOptions().colors[1]
             }
         },
         title: {
             text: 'Number ',
             style: {
                 color: Highcharts.getOptions().colors[1]
             }
         }
     }, { // Secondary yAxis
         title: {
             text: yAxis,
             style: {
                 color: Highcharts.getOptions().colors[0]
             }
         },
         labels: {
             format: '{value}',
             style: {
                 color: Highcharts.getOptions().colors[0]
             }
         },
         opposite: true
     }],
 
     series: [{
         name: dataToPlot[0].name,
         type: dataToPlot[0].type,
         data: dataToPlot[0].data,
         tooltip: {
             valueSuffix: ''
         }
 
     }, {
         name: dataToPlot[1].name,
         type:  dataToPlot[1].type,
         data: dataToPlot[1].data,
         tooltip: {
             valueSuffix: ' '
         }
 
     },{
         name: dataToPlot[2].name,
         yAxis: 1,
         type:  dataToPlot[2].type,
         data: dataToPlot[2].data,
         tooltip: {
             valueSuffix: ' '
         }
 
     },
     {
         name: dataToPlot[3].name,
         type:  dataToPlot[3].type,
         data: dataToPlot[3].data,
         tooltip: {
             valueSuffix: ' '
         }
 
     },{
         name: dataToPlot[4].name,
         yAxis: 1,
         type:  dataToPlot[4].type,
         data: dataToPlot[4].data,
         tooltip: {
             valueSuffix: ''
         }
     },{
        name: dataToPlot[5].name,
        type:  dataToPlot[5].type,
        data: dataToPlot[5].data,
        tooltip: {
            valueSuffix: ''
        }
    },{
        name: dataToPlot[6].name,
        type:  dataToPlot[6].type,
        yAxis: 1,
        data: dataToPlot[6].data,
        tooltip: {
            valueSuffix: ''
        }
    },{
        name: dataToPlot[7].name,
        type:  dataToPlot[7].type,
        data: dataToPlot[7].data,
        tooltip: {
            valueSuffix: ''
        }
    },{
        name: dataToPlot[8].name,
        type:  dataToPlot[8].type,
        yAxis: 1,
        data: dataToPlot[8].data,
        tooltip: {
            valueSuffix: ''
        }
    },{
        name: dataToPlot[9].name,
        type:  dataToPlot[9].type,
        data: dataToPlot[9].data,
        tooltip: {
            valueSuffix: ''
        }
    },{
        name: dataToPlot[10].name,
        type:  dataToPlot[10].type,
        data: dataToPlot[10].data,
        tooltip: {
            valueSuffix: ''
        }
    }]
 }); 
}


$(document).ready(function () {
    setTimeout(() => {
        $('select').select2()
    }, 100);
});