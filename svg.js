var svg = document.getElementById("svg1");

//플래그 모음(xy라인 그려졌는지, 표 그려져있는지, play버튼 눌렀는지)
var flagObj = {
    xylineFlag: false,
    tableFlag: false,
    playFlag: true
}
//좌표 모음(xy한번에, 실제xy좌표, 변환된 xy좌표, 프레임시간, xyline찍은 좌표)
var coordsObj = {
    xycoords: [],
    realx: [],
    realy: [],
    xcd: [],
    ycd: [],
    frameTime: [],
    xylineDot: []
}
var clickCnt = 0;
var defalut = 1;
var screendot = 0;
//-------------------------------------------

function init() {
    var saveButton = document.getElementById("save");
    var inputform = document.getElementById("inputform");
    var input = document.getElementById("input1");

    var seekBar = document.getElementById("seek-bar");
    var video = document.getElementById("vd1");
    var analysisButton = document.getElementById("analysis");

    //비디오 크기
    var w = video.offsetWidth;
    var h = video.offsetHeight;
    seekBar.style.width = w;
    //시작 시
    svg.style.visibility = "hidden";
    saveButton.disabled = true;
    input.disabled = true;
    analysisButton.disabled = false;

    //input 리로딩 해제
    inputform.addEventListener('submit', handleSubmit);
    resizeSVG();


}

//창크기 변경시 
window.onresize = function (event) {
    resizeSVG();
}

function getMousePosition(evt) {
    var CTM = svg.getScreenCTM();
    return {
        x: (evt.clientX - CTM.e) / CTM.a,
        y: (evt.clientY - CTM.f) / CTM.d
    };
}

function makeDraggable(evt) {
    var line = evt.target;
    line.addEventListener('mousedown', startDrag);
    line.addEventListener('mousemove', drag);
    line.addEventListener('mouseup', endDrag);
    line.addEventListener('mouseleave', endDrag);
    var selectedElement = false;
    var offset, transform;
    function startDrag(evt) {
        if (evt.target.classList.contains('draggable')) {
            selectedElement = evt.target;
            offset = getMousePosition(evt);
            var transforms = selectedElement.transform.baseVal;
            var translate = svg.createSVGTransform();
            translate.setTranslate(0, 0);
            selectedElement.transform.baseVal.insertItemBefore(translate, 0);
            transform = transforms.getItem(0);
            offset.x -= transform.matrix.e;
            offset.y -= transform.matrix.f;
        }
    }
    function drag(evt) {
        if (selectedElement) {
            //evt.preventDefault();
            var coord = getMousePosition(evt);
            var transx = coord.x - offset.x;
            var transy = coord.y - offset.y;
            transform.setTranslate(transx, transy);
            console.log(transx.toFixed(3), -transy.toFixed(3));
        }
    }

    function endDrag(evt) {
        selectedElement = null;
    }


}



// SVG리사이징 
function resizeSVG() {
    var video = document.getElementById("vd1");
    var seekBar = document.getElementById("seek-bar");
    var vcontrols = document.getElementById("vcontrols");
    var w = video.offsetWidth;
    var h = video.offsetHeight;
    svg.style.width = w;
    svg.style.height = h;
    vcontrols.style.marginTop = h;
    seekBar.style.width = w;
}

svg.onmousemove = function (e) {

};

function playPause() {
    resizeSVG();
    var video = document.getElementById("vd1");
    var playpause = document.getElementById("pause");
    var analysisButton = document.getElementById("analysis")

    if (flagObj.playFlag == true) {
        analysisButton.disabled = false;
        video.pause();
        playpause.innerText = "▷";
        flagObj.playFlag = false;
    }
    else {
        video.play();
        analysisButton.disabled = true;
        playpause.innerText = "||";
        flagObj.playFlag = true;
    }
}

//SVG input 값 가져오기
function getInput() {
    var input = document.getElementById("input1");
    return input.value;
}

//찍은좌표저장
function storexcoords(x, xarray) {
    xarray.push(x);

}
function storeycoords(y, yarray) {
    yarray.push(y);
}

//좌표찍기함수화 circle
function getNode(n, v) {
    n = document.createElementNS("http://www.w3.org/2000/svg", n);
    for (var p in v) {
        n.setAttributeNS(null, p, v[p]);
    }
    return n;
}
//마우스위치
function onMousePosSVG(e) {
    var p = svg.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    var ctm = svg.getScreenCTM().inverse();
    var p = p.matrixTransform(ctm);
    return p;
}

//좌표고정 
function setxyLine() {
    console.log("원점 고정");
    flagObj.xylineFlag = true;
    if (flagObj.xylineFlag == true) {
        //svg클릭이벤트
        svg.addEventListener('click', function (ev) {
            console.log("SVG Click");
            var video = document.getElementById("vd1");
            var xylinebutton = document.getElementById("xyline");
            var save_time = 0;//클릭시 동영상의 시간
            var find = 0;//프레임중복제거변수 
            if (flagObj.xylineFlag == false) {    //좌표 고정 안했을 경우 
                alert("좌표 고정 버튼을 눌러주세요");
            }
            else if (flagObj.xylineFlag == true) {//좌표고정 했을 경우
                //onclick이벤트 제거
                document.getElementById('xyline').classList.replace('draggable', 'static');
                //한 프레임에 하나만 찍기 : time배열에 동일한 시간이 존재하지 않도록함
                save_time = video.currentTime;//클릭시 시간
                function findtime(element) {
                    if (element === save_time) return true;
                }
                find = coordsObj.frameTime.findIndex(findtime);
                if ((find === -1)) {
                    let m = onMousePosSVG(ev);
                    console.log("(" + m.x.toFixed(3), m.y.toFixed(3) + ")");
                    svg.appendChild(getNode('circle', { cx: m.x, cy: m.y, r: 3, width: 20, height: 20, fill: 'red' }));
                }
                else {
                    console.log("?");
                    //이상없음
                }
            }

        });
    }
}



//다시찍기
function retry() {
    //현재 비디오 프레임값(video.currentTime)을 저장된 coordsObj의 frametime에서 찾은후 그 위치의 index를 찾아서 
    //x,y인덱스를 찾아서 삭제하고 (오브젝트에서 삭제)
    //그 위치를 clearrect한다..

    console.log("현재 점 모든값 삭제 !!")
    var video = document.getElementById("vd1");
    var playpause = document.getElementById("pause");
    var fixcurrentTime = video.currentTime
    var frameindex = coordsObj.frameTime.indexOf((fixcurrentTime - 0.04).toFixed(3));
    var analysisButton = document.getElementById("analysis");
    analysisButton.disabled = true;
    playpause.disabled = false;
    if (frameindex === -1) {
        console.log("삭제하려는 프레임" + (fixcurrentTime - 0.04).toFixed(3) + "에 찍힌 좌표가 존재하지 않음");
    }
    console.log("frametime : " + coordsObj.frameTime);
    console.log("fixcurrentTime.toFixed(3)-0.04: " + (fixcurrentTime - 0.04).toFixed(3));
    console.log("frameindex: " + frameindex);
    coordsObj.frameTime.splice(frameindex, 1);
    coordsObj.xcd.splice(frameindex, 1);
    coordsObj.ycd.splice(frameindex, 1);
    coordsObj.realx.splice(frameindex, 1);
    coordsObj.realy.splice(frameindex, 1);
    video.currentTime = video.currentTime - 0.04;
}
//-------------------------------------------------------------------------------------------

//readout 좌표 update(innerText)
function updateReadout(x, y) { //div 부분에 좌표 입력(readout)
    var readout = document.getElementById('readout');
    readout.innerText = '좌표 : (' + x.toFixed(3) + ',' + y.toFixed(3) + ')';//고정 소수점 표기법으로 표기
}

//clear버튼 : 배열들 초기화 
function arrayinitialize() {
    coordsObj.xylineDot = [];//초기화
    coordsObj.xycoords = [];
    coordsObj.frameTime = [];
    coordsObj.realx = [];
    coordsObj.realy = [];
    coordsObj.xcd = [];
    coordsObj.ycd = [];
}

//비디오 replay
function replay() {
    var input = document.getElementById("input1");
    var saveButton = document.getElementById("save");
    var analysisButton = document.getElementById("analysis");
    var video = document.getElementById("vd1");
    coordsObj.xylineDot = [];//초기화
    video.currentTime = 0.0;
    video.play();
    analysisButton.disabled = false;//분석모드버튼 활성화
    saveButton.disabled = true;
    input.disabled = true;
    // clearButton.disabled = true;
    // flagObj.xylineFlag = "false";
}

function clearSVG() {
    var analysisButton = document.getElementById("analysis");
    var input = document.getElementById("input1");
    var saveButton = document.getElementById("save");

    var analysisButton = document.getElementById("analysis");


    analysisButton.disabled = false;//분석모드버튼 활성화

    saveButton.disabled = true;
    input.disabled = true;
    arrayinitialize();

}

//submit 입력 버튼 클릭시 리로딩 없이 값 초기화
function handleSubmit(event) {
    var input = document.getElementById("input1");
    event.preventDefault();
    defalut = getValue();
    console.log(
        "좌표에 곱해질 값 : " + defalut
    );
    //input 초기화
    input.value = '';
    input.disabled = true;
}

//값받기
function getValue() {
    var input = document.getElementById("input1");
    var origin = screendot;
    var currentValue = input.value;
    console.log("입력한 x의 값: " + currentValue);
    input.placeholder = "x의 길이: " + currentValue + "cm";
    //값 보내기
    if (input.value = '') {
        currentValue = 8;
    }
    else {
        currentValue = currentValue / origin;
    }
    return currentValue;
}

//분석모드 버튼 클릭 시 
function analysisMode() {
    var saveButton = document.getElementById("save");
    var xyline = document.getElementById("xyline");
    var analysisButton = document.getElementById("analysis");
    var video = document.getElementById("vd1");
    svg.style.visibility = "visible";
    pause.disabled = true;
    console.log("분석모드 진입");
    coordsObj.xylineDot = [];//원점 초기화
    flagObj.xylineFlag = false;
    coordsObj.xycoords = [];
    resizeSVG();//SVG 크기 조절
    video.pause();

    analysisButton.disabled = true;//분석모드 버튼 비활성화
    saveButton.disabled = true;

}

function gobackFrame() {
    var video = document.getElementById("vd1");
    video.currentTime = video.currentTime - 0.04;
}

function gofowardFrame() {
    var video = document.getElementById("vd1");
    video.currentTime = video.currentTime + 0.04;
}

//테이블 생성: handsontable 생성(동적)
function drawTable() {
    console.log("표로 저장, 분석모드 버튼끄기");
    var analysisButton = document.getElementById("analysis");
    analysisButton.disabled = true;
    if (flagObj.tableFlag === true) {
        divRemove();
    }
    flagObj.tableFlag = true;
    var _tb1 = document.createElement("div");
    var _element = document.getElementById("handson");
    _tb1.id = "table";
    _element.appendChild(_tb1);
    var _data = [
        coordsObj.xcd,
        coordsObj.ycd,
        coordsObj.frameTime
    ];
    console.log("coordsObj.xcd: " + coordsObj.xcd);
    console.log("coordsObj.ycd: " + coordsObj.ycd);
    console.log("coordsObj.frameTime: " + coordsObj.frameTime);
    var _container = document.getElementById('table');
    var hot = new Handsontable(_container, {
        data: _data,
        rowHeaders: ['x', 'y', 'time'],
        contextMenu: true,
        afterChange: (change) => {
            tableChange(change);
        }
    });
    function tableChange(c) {
        //c[0]=행,0->x값, 1->y값, 3->시간
        //c[1]=열, 좌표의 순서 
        //c[2]=원본값 : 값 그자체
        //c[3]=수정된 값 : 값 그자체
        console.log("coordsObj.xcd: " + coordsObj.xcd);
        console.log("coordsObj.ycd: " + coordsObj.ycd);
        console.log("coordsObj.frameTime: " + coordsObj.frameTime);

    }
    var handson = document.getElementById("hot-display-license-info");
    handson.parentNode.removeChild(handson);

}

//테이블 remove 버튼 : id가 table인 div 삭제 
function divRemove() {
    //표가 없을경우 
    if (flagObj.tableFlag === false) {
        return;
    }
    flagObj.tableFlag = false;
    var _child = document.getElementById("table");

    var analysisButton = document.getElementById("analysis");
    _child.parentNode.removeChild(_child);

}


//비디오 컨트롤러, 버튼들---------------------------------------------------------
window.onload = function () {
    var video = document.getElementById("vd1");
    var seekBar = document.getElementById("seek-bar");
    seekBar.addEventListener("change", function () {
        var seektime = video.duration * (seekBar.value / 100);
        video.currentTime = seektime;
    });

    // 재생시간에 따른 재생바 이동
    video.addEventListener("timeupdate", function () {
        // Calculate the slider value
        var value = (100 / video.duration) * video.currentTime;
        // Update the slider value
        seekBar.value = value;
    });
    // 재생바 드래그하려고 클릭시에 동영상 정지
    seekBar.addEventListener("mousedown", function () {
        video.pause();

    });
}

init();