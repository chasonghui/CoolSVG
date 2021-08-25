var coeObj = {
    a: 0,
    b: 0,
    c: 0,
    d: 0,
    a10: 0,
    b10: 0,
    c10: 0,
    d10: 0
};

// var period;//주기
// var phase_x; // x원점으로 부터의 떨어진 정도
var arrphase = [];
var arrperiod = [];
var arrObj = {
    rows: 0,//엑셀 파일의 내용을 json으로 바꾼 것
    xData: 0,//x좌표값 배열 선언
    yData: 0,//y좌표값 배열 선언

    xDatafitdata: 0, //피팅할 범위 x
    yDatafitdata: 0,  //피팅할 범위 y

    xRange: 0, //드래그된 x범위
    yRange: 0, //드래그된 y범위

    xmatrix: 0,//x좌표의 행렬
    T_xmatrix: 0// 전치행렬
};


var ymatrix = new Array(1); //y좌표를 행렬로 받아올 변수 
var type = 0; //옵션 선택 값
var roof_type = 0;
var values_2x = [];
var values_final = [];
// 피팅함수 종류가 뭔지 type을 숫자로 받아오는 함수
function change_Type(e) {
    const value = e.value;
    type = value;
}
function change_Roof_Type(e) {
    const value = e.value;
    roof_type = value;
}

// function change_cycle_show(sVal)
// {
// 	var obValueView = document.getElementById("cycle_view");
// 	obValueView.innerHTML = sVal
// }





// function  change_phase_x_show(sVal)
// {
// 	var obValueView = document.getElementById("phase_x_view");
// 	obValueView.innerHTML = sVal
// }


// function change_phase_x(){
//   var obValueView = document.getElementById("phase_x_view");
//   const value = obValueView.value;
//   phase_x=parseFloat(value);
//   arrphase.push(phase_x);
// }

function action_button() {
    arrObj.yData = [];
    arrObj.xData = [];
    // getdata();
    getGraph_select_range(coords.xcd, coords.ycd);
}

// //좌표이름 바꾸는 곳
// function getdata() {
//     arrObj.xData.push(coords.xcd);
//     arrObj.yData.push(coords.ycd);
//     console.log("나와봐" + arrObj.xData);

// }

//다중 그래프 그리기 
function getGraph(data_x, data_y, fitdata_x, fitdata_y, type) {

    var Graph = document.getElementById('myGraph');
    var labels = ['Original', 'Fitting'];

    //trace1 : 선택된 범위의 원래data 그래프 
    var original = {
        x: data_x,
        y: data_y,
        name: 'original',
        type: 'scatter',
        mode: 'lines', // 점 안찍히고 라인만 
        line: {
            color: "black"
        }
    };
    //trace2 : 선택된 범위의 피팅 그래프 
    var fit = {
        x: fitdata_x,
        y: fitdata_y,
        name: 'fitting',
        type: 'scatter',
        mode: 'lines', // 점 안찍히고 라인만 
        line: {
            color: "red"
        },
        text: labels[1]
    };


    var data = [original, fit];




    var layout = {
        autosize: true,
        text: labels[0],
        title: 'Fitting Graph',
        font: { size: 20, family: "Times New Roman" },
        showlegend: true,
        paper_bgcolor: "rgba(255, 255, 255, 1)",//전체 배경
        plot_bgcolor: "rgba(255, 255, 255, 1)"//그래프 부분 색

    };
    var config = {
        displayModeBar: true,
        responsive: true,
        modeBarButtonsToRemove: ['lasso2d', 'autoScale2d', 'toggleSpikelines', 'select2d'],
        displaylogo: false
    };
    Plotly.newPlot(Graph, data, layout, config);

    coeObj.a10 = coeObj.a.toFixed(4);//10자리수까지 반올림
    coeObj.b10 = coeObj.b.toFixed(4);
    coeObj.c10 = coeObj.c.toFixed(4);//10자리수까지 반올림
    coeObj.d10 = coeObj.d.toFixed(4);

    if (type == 1) {
        document.getElementById('fitting_result').innerHTML = "f(X) = " + coeObj.a10 + "x + (" + coeObj.b10 + ")"
        //Plotly.relayout(where, 'title',`y = ${a10}x + ${b10}`);
    } else if (type == 2) {
        document.getElementById('fitting_result').innerHTML = "f(X) = " + coeObj.a10 + "x² + (" + coeObj.b10 + ")x + (" + coeObj.c10 + ")"
        //Plotly.relayout(where, 'title',`y = ${a10}x² + ${b10}x + ${c10}`);
    }
}


//영역 선택할 수 있는 그래프 
function getGraph_select_range(data_x, data_y) {
    var Graph = document.getElementById('myGraph');

    var data = [{
        mode: 'lines+markers',
        x: data_x,
        y: data_y,
        line: { color: 'black' }
    }];
    var layout = {
        autosize: true,

        title: 'Graph',
        font: { size: 20, family: "Times New Roman" },
        dragmode: 'select',
        paper_bgcolor: "rgba(255,255,255, 1)",//전체 배경
        plot_bgcolor: "rgba(255,255,255, 1)"//그래프 부분 배경


    };
    var config = {
        displayModeBar: true,
        responsive: true,
        modeBarButtonsToRemove: ['lasso2d', 'autoScale2d', 'toggleSpikelines'], //plotly 기본 버튼 중 제거할 것 (선택하기)
        displaylogo: false
    };
    console.log("그려봐" + JSON.stringify(data));
    Plotly.newPlot(Graph, data, layout, config);
    //Lasso Select , Produced with Plotly
    Graph.on('plotly_selected', (eventData) => {
        arrObj.xRange = eventData.range.x;
        arrObj.yRange = eventData.range.y;
    });
}

//행렬만들기 - 행렬 반환
const metrix = () => {
    var x;
    var xx;
    var y;

    for (var i = 0; i < arrObj.xmatrix.length; i++) {
        arrObj.xmatrix[i] = new Array(3);
    }

    for (var j = 0; j < arrObj.T_xmatrix.length; j++) {
        arrObj.T_xmatrix[j] = new Array(arrObj.xDatafitdata.length);
    }

    for (var i = 0; i < arrObj.yDatafitdata.length; i++) {
        y = arrObj.yDatafitdata[i];
        ymatrix[i] = [y];
    }

    for (var i = 0; i < arrObj.xDatafitdata.length; i++) {
        x = arrObj.xDatafitdata[i];
        xx = x * x;
        arrObj.xmatrix[i] = [1, x, xx];
    }

    return arrObj.xmatrix;

};


//행렬 곱 구하기 - 곱한 결과 행렬 반환
function tarrXarr(tarr, arr) {
    return tarr.map((row) => arr[0].map((x, y) => row.reduce((a, b, c) => a + b * arr[c][y], 0)))
}

//선형최소제곱 알고리즘 1차
const findLineByLeastSquares_1 = (values_x, values_y) => {
    var x_sum = 0;
    var y_sum = 0;
    var xy_sum = 0;
    var xx_sum = 0;
    var count = 0;
    var x = 0;
    var y = 0;
    var values_length = values_x.length;

    if (values_length != values_y.length) {
        throw new Error('values_x 및 values_y 매개 변수의 크기가 같아야합니다!');
    }

    if (values_length === 0) {
        return [[], []];
    }


    for (let i = 0; i < values_length; i++) {
        x = values_x[i];
        y = values_y[i];
        x_sum += x;
        y_sum += y; //= Y
        xx_sum += x * x;
        xy_sum += x * y;
        count++;
    }

    coeObj.a = (count * xy_sum - x_sum * y_sum) / (count * xx_sum - x_sum * x_sum);
    coeObj.b = (y_sum / count) - (coeObj.a * x_sum) / count;


    var result_values_x = [];
    var result_values_y = [];

    for (let i = 0; i < values_length; i++) {
        x = values_x[i];
        y = x * coeObj.a + coeObj.b;
        result_values_x.push(x);
        result_values_y.push(y);
    }

    return [result_values_x, result_values_y];
};

//선형최소제곱 알고리즘 2차 
const findLineByLeastSquares_2 = (values_x, values_y) => {
    var inverted, abc;//x좌표의 역행렬, 계수행렬
    var Coe;//(A_t A)'(A_t)까지 한 것
    var x, y;

    metrix(); //arr 리턴
    zip = rows => rows[0].map((_, c) => rows.map(row => row[c]))
    arrObj.T_xmatrix = zip([...arrObj.xmatrix]) //전치된 행렬 t_arr
    inverted = math.inv(tarrXarr(arrObj.T_xmatrix, arrObj.xmatrix)); //역행렬 구하기 
    Coe = tarrXarr(inverted, arrObj.T_xmatrix);
    abc = tarrXarr(Coe, ymatrix); //이차함수 계수 행렬 abc
    coeObj.a = abc[2][0];
    coeObj.b = abc[1][0];
    coeObj.c = abc[0][0];

    if (values_x.length != values_y.length) {
        throw new Error('values_x 및 values_y 매개 변수의 크기가 같아야합니다!');
    }

    if (values_x.length === 0) {
        return [[], []];
    }
    //console.log("전 x:", values_x);


    var result_values_x = [];
    var result_values_y = [];

    for (var i = 0; i < roof_type; i++) {
        values_x = roof(values_x);
    }

    //console.log("후 x:", values_x);

    for (let i = 0; i < values_x.length; i++) {
        x = values_x[i];
        y = x * x * coeObj.a + coeObj.b * x + coeObj.c;
        result_values_x.push(x);
        result_values_y.push(y);
    }


    return [result_values_x, result_values_y];

};

function roof(roofdata) {
    var roofvalue = [];
    var roof_result = [];
    for (let i = 0; i < roofdata.length - 1; i++) {
        var sum = roofdata[i] + roofdata[i + 1];
        var squr = sum / 2;
        roofvalue.push(squr);
    }

    roof_result = roofdata.concat(roofvalue);

    roof_result.sort(function (a, b) {
        return a - b; //오름차순 청렬
    });
    return roof_result;

}


//fitdatating그래프 띄우기 
function fitting() {

    var max_value, min_value;
    var i_x_min = 0;
    var i_x_max = 0;




    while (coords.xcd[i_x_min] <= arrObj.xRange[0]) {
        i_x_min++;
    }
    while (coords.xcd[i_x_max] <= arrObj.xRange[1]) {
        i_x_max++;
    }
    min_value = i_x_min;
    max_value = i_x_max;

    arrObj.xDatafitdata = coords.xcd.slice(min_value, max_value); // 선택된 영역 
    arrObj.yDatafitdata = coords.ycd.slice(min_value, max_value); // 선택된 영역
    // arr를 배열로 만들어주는 위치가 중요함. 
    //chartLabels_zoom이 값을 가진 후에 놓여야함.

    arrObj.xmatrix = new Array(arrObj.xDatafitdata.length);//x좌표를 행렬로 받아올 변수
    var fitdata_xy;

    if (type == 1) {
        fitdata_xy = findLineByLeastSquares_1(arrObj.xDatafitdata, arrObj.yDatafitdata); //선형피팅
    }
    else if (type == 2) {
        arrObj.T_xmatrix = new Array(3);//전치행렬
        fitdata_xy = findLineByLeastSquares_2(arrObj.xDatafitdata, arrObj.yDatafitdata); //곡선피팅
    } else if (type == 0) {
        alert('옵션을 선택해 주세요'); //옵션선택 안함 -> 경고창
    }
    getGraph(arrObj.xDatafitdata, arrObj.yDatafitdata, fitdata_xy[0], fitdata_xy[1], type);
    arrphase = [];
    arrperiod = [];

}

function reset() {
    window.location.reload();
}


