var svg = document.getElementById("svg1");

//플래그 모음(boolean)
var flagObj = {
    xylineFlag: false,
    tableFlag: false,
    playFlag: true
}
//좌표모음
var coords = {
    realx: 0,
    realy: 0,
    xcd: [],
    ycd: [],
    frameTime: [],
}
//변수모음
var gloVar = {
    pxtoCM: 1,//input에 따라 좌표에 곱해질 변수
    circleID: 0,//동적으로 생성될 <circle>의 id값
    dragCnt: 0,//드래그 횟수 count
    customFrame: 0.04,//임의로 정해놓은 Frame값
    pathD: 50,//<path 태그의 d위치값 (html에서 사용자 지정)
    guidePx: 100//<path id=guideline의 L150 -M50
}

//초기
function init() {
    var inputform = document.getElementById("inputform");
    var input = document.getElementById("input1");
    var xylinebutton = document.getElementById("xylinebutton");
    var seekBar = document.getElementById("seek-bar");
    var video = document.getElementById("vd1");
    var analysisButton = document.getElementById("analysis");

    //비디오 크기
    var w = video.offsetWidth;
    var h = video.offsetHeight;
    seekBar.style.width = w;
    //시작 시
    svg.style.visibility = "hidden";

    input.disabled = true;
    analysisButton.disabled = false;
    xylinebutton.disabled = true;

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
    if (evt.touches) { evt = evt.touches[0]; }//모바일환경
    return {
        x: (evt.clientX - CTM.e) / CTM.a,
        y: (evt.clientY - CTM.f) / CTM.d
    };
}

function makeDraggable(evt) {
    var line = evt.target;
    //----------------------pc 환경------------------------
    line.addEventListener('mousedown', startDrag);
    line.addEventListener('mousemove', drag);
    line.addEventListener('mouseup', endDrag);
    line.addEventListener('mouseleave', endDrag);

    //---------------------모바일 환경--------------------
    line.addEventListener('touchstart', startDrag);
    line.addEventListener('touchmove', drag);
    line.addEventListener('touchend', endDrag);
    line.addEventListener('touchleave', endDrag);
    line.addEventListener('touchcancel', endDrag);


    var selectedElement = false;
    var offset, transform;
    function startDrag(evt) {
        if (evt.target.classList.contains('draggable')) {
            gloVar.dragCnt++;
            selectedElement = evt.target;
            offset = getMousePosition(evt);//마우스 포지션 가져와

            var transforms = selectedElement.transform.baseVal;//젤처음 요소 가져와
            var translate = svg.createSVGTransform();//svg
            translate.setTranslate(0, 0);//시작할때마다 0,0

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
        }
    }

    function endDrag(evt) {
        selectedElement = null;
    }
}

//좌표찍기 함수화 circle
function getNode(n, v) {
    n = document.createElementNS("http://www.w3.org/2000/svg", n);
    for (var p in v) {
        n.setAttributeNS(null, p, v[p]);
    }
    return n;
}

//원점변환
function setOrigin() {
    var transforms = xyline.transform.baseVal;//요소 가져옴
    var translate = svg.createSVGTransform();//svgTransform
    transform = transforms.getItem(0);//transforms중에 제일 최근값
    translate.setTranslate(0, 0);//원점으로 설정
    var beforeCoords = {//drag할때마다 누적되는 x,y값 
        x: 0,
        y: 0
    }
    //드래그 횟수가 2회 이상일 경우 누적된 x,y값을 함께 더해줌
    if (gloVar.dragCnt > -1) {
        for (var i = 0; i < gloVar.dragCnt; i++) {
            beforeCoords.x += transforms.getItem(i).matrix.e;
            beforeCoords.y += transforms.getItem(i).matrix.f;
        }
    }
    coords.realx = beforeCoords.x;//drag로 이동된 x값
    coords.realy = beforeCoords.y;//drag로 이동된 y값
}

//좌표고정 + 점찍기
function drawDot() {
    console.log("좌표고정");
    var xylinebutton = document.getElementById("xylinebutton");
    var xyline = document.getElementById("xyline");
    var video = document.getElementById("vd1");
    var inputform = document.getElementById("input1");
    var save_time = 0;//클릭시 동영상의 시간
    var find = 0;//프레임중복제거변수 

    xyline.classList.remove('draggable');//drag금지
    flagObj.xylineFlag = true;
    xylinebutton.disabled = true;//좌표고정버튼 비활성화
    inputform.disabled = false;

    setOrigin();//원점변환

    if (flagObj.xylineFlag == true) {
        //svg클릭이벤트
        buttonDisable();//버튼 비활성화
        svg.addEventListener('click', function (ev) {
            console.log("Click!");
            save_time = video.currentTime;//클릭시 시간
            function findtime(element) {//한 프레임에 하나만 찍기 : time배열에 동일한 시간이 존재하지 않도록함
                if (element === save_time.toFixed(3)) return true;
            }
            find = coords.frameTime.findIndex(findtime);//찾는값이 없을 시 -1 return
            video.currentTime = save_time + gloVar.customFrame;//프레임이동
            if ((find === -1)) {//동일한 프레임에 찍은 점이 없음
                let m = getMousePosition(ev);
                var pushx = (m.x - coords.realx - gloVar.pathD) * gloVar.pxtoCM;
                var pushy = (m.y - coords.realy - gloVar.pathD) * gloVar.pxtoCM;
                svg.appendChild(getNode('circle', { id: gloVar.circleID, class: "allCircle", cx: m.x, cy: m.y, r: 3, width: 20, height: 20, fill: 'red' }));
                gloVar.circleID++;//id값 증가
                coords.frameTime.push(save_time.toFixed(3));//클릭시 시간 push(소수점3자리로 끊음)
                coords.xcd.push(pushx.toFixed(3));//클릭시 x좌표 push
                coords.ycd.push(-pushy.toFixed(3));//클릭시 y좌표 push
                drawTable();
            }
            else {//동일한 프레임에 찍은 점이 존재
                console.log("이미찍은 Frame");
            }
        });
    } else {
        console.log("좌표 고정 버튼을 클릭하세요.");
    }
}

//버튼비활성화
function buttonDisable() {
    var gobackbutton = document.getElementById("goback");
    var playbutton = document.getElementById("pause");
    var replaybutton = document.getElementById("replay");
    var seekbar = document.getElementById("seek-bar");
    gobackbutton.disabled = true;
    playbutton.disabled = true;
    replaybutton.disabled = true;
    seekbar.disabled = true;
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

//readout
svg.onmousemove = function (e) {
    var readout = document.getElementById("readout");
    var offset = getMousePosition(e);
    offset.x -= coords.realx;
    offset.y -= coords.realy;
    //<path d="M 50 50 ..." 이기 때문에 -50을 해줘야함.
    readout.innerHTML = "(" + ((offset.x - gloVar.pathD) * gloVar.pxtoCM).toFixed(3) + "," + -((offset.y - gloVar.pathD) * gloVar.pxtoCM).toFixed(3) + ")";
};

//재생 일시정지
function playPause() {
    resizeSVG();
    var video = document.getElementById("vd1");
    var playpause = document.getElementById("pause");
    if (flagObj.playFlag == true) {
        video.pause();
        playpause.innerText = "▷";
        flagObj.playFlag = false;
    }
    else {
        video.play();
        playpause.innerText = "||";
        flagObj.playFlag = true;
    }
}

//SVG input 값 가져오기
function getInput() {
    var input = document.getElementById("input1");
    return input.value;
}

//x좌표저장
function storexcoords(x, xarray) {
    xarray.push(x);

}

//y좌표 저장
function storeycoords(y, yarray) {
    yarray.push(y);
}

//다시찍기
function retry() {
    //현재 비디오 프레임값(video.currentTime)을 coords의 frametime에서 찾은 후 그 위치의 index를 찾음
    //찾은 인덱스값과 같은 x,y인덱스를 찾아서 그 위치의 값을 삭제하고 (오브젝트에서 삭제)
    //찾은 인덱스값을 id값으로 가진 <circle>태그 자체를 삭제
    console.log("다시찍기");
    var video = document.getElementById("vd1");
    var fixcurrentTime = video.currentTime
    var frameindex = coords.frameTime.indexOf((fixcurrentTime - gloVar.customFrame).toFixed(3));

    if (gloVar.circleID > 0) {
        gloVar.circleID--;// <circle>에 부여되는 id값 감소(다시찍기를 다시할때 필요)
        if (frameindex === -1) {//찾으려는 값이 없을때 
            console.log("삭제하려는 프레임" + (fixcurrentTime - gloVar.customFrame).toFixed(3) + "에 찍힌 좌표가 존재하지 않음");
        }
        else if (frameindex != -1) {//찾으려는 값이 있을때
            document.getElementById(frameindex).remove();
            //framTime,x,y 를 저장된 오브젝트에서 삭제 param:(index,num)
            coords.frameTime.splice(frameindex, 1);
            coords.xcd.splice(frameindex, 1);
            coords.ycd.splice(frameindex, 1);
            divRemove();//표 삭제 
            drawTable();//표 생성

            video.currentTime = video.currentTime - gloVar.customFrame;//한프레임 앞으로
            console.log("삭제완 : " + coords.frameTime);
        }
        console.log("저장된 프레임들 : " + coords.frameTime);
        console.log("삭제하려는 프레임 :" + (fixcurrentTime - gloVar.customFrame).toFixed(3));
        console.log("frame index: " + frameindex);

    }
    if (gloVar.circleID == 0 && frameindex != -1) {
        console.log("마지막 좌표값");
        divRemove();//표 형태까지 삭제
    }
    else {
        console.log("저장된 좌표가 존재하지 않음");
        //video.currentTime = video.currentTime - gloVar.customFrame;//한프레임 앞으로
    }
}
//-------------------------------------------------------------------------------------------

//좌표 초기화
function arrayinitialize() {
    coords.frameTime = [];
    coords.xcd = [];
    coords.ycd = [];
    coords.realx = 0;
    coords.realy = 0;
}

//비디오 replay
function replay() {
    var video = document.getElementById("vd1");
    var playbutton = document.getElementById("pause");
    video.currentTime = 0.0;
    video.play();
    playbutton.innerText = "||";
    flagObj.playFlag = true;
}

//좌표모두지우기
function clearSVG() {

}

//input form enter -> 리로딩 없이 값 초기화
//리로딩하면 동영상이 다시 재생됨
function handleSubmit(event) {
    var input = document.getElementById("input1");
    event.preventDefault();
    gloVar.pxtoCM = getValue();
    console.log(
        "좌표에 곱해질 값 : " + gloVar.pxtoCM
    );
    //input 초기화
    input.value = '';
    input.disabled = true;
}

//값 받기, 좌표변환
function getValue() {
    var input = document.getElementById("input1");
    var guidetext = document.getElementById("guidetext");
    var inputVal = input.value;

    input.placeholder = "x의 길이: " + inputVal + "cm";
    guidetext.innerHTML = inputVal + " cm";//svg guidetext

    if (input.value = '') {
        inputVal = 100;//현재 px 
    }
    else {
        //현재 가이드라인: 100px -> 입력값으로 변환하려면
        //100*(입력값/100)
        inputVal = inputVal / gloVar.guidePx;
        gloVar.pxtoCM = inputVal;
    }
    return inputVal;
}

//분석모드
function analysisMode() {
    console.log("분석모드");
    var analysisButton = document.getElementById("analysis");
    var video = document.getElementById("vd1");
    var xylinebutton = document.getElementById("xylinebutton");
    var playbutton = document.getElementById("pause");
    var seekBar = document.getElementById("seek-bar");
    var replayButton = document.getElementById("replay");

    // replayButton.disabled = true;
    // playbutton.disabled = true;
    svg.style.visibility = "visible";
    flagObj.xylineFlag = false;
    // seekBar.disabled = true;

    resizeSVG();//SVG 크기 조절
    video.pause();
    playbutton.innerText = "▷";

    flagObj.playFlag = false;//playflag
    analysisButton.disabled = true;//분석모드 버튼 비활성화
    xylinebutton.disabled = false;//좌표고정 버튼 활성화
}

function gobackFrame() {
    var video = document.getElementById("vd1");
    video.currentTime = video.currentTime - gloVar.customFrame;
}

function gofowardFrame() {
    var video = document.getElementById("vd1");
    video.currentTime = video.currentTime + gloVar.customFrame;
}

//테이블 생성: handsontable 생성(동적)
function drawTable() {
    console.log("Call drawTable()");
    var analysisButton = document.getElementById("analysis");
    analysisButton.disabled = true;
    //한번찍을때마다 테이블이 update되야하므로 tableflag가 true일땐
    //table을 지우고 다시그림
    if (flagObj.tableFlag === true) {
        divRemove();
    }
    flagObj.tableFlag = true;
    var _tb1 = document.createElement("div");
    var _element = document.getElementById("handson");
    _tb1.id = "table";
    _element.appendChild(_tb1);
    var _data = [
        coords.xcd,
        coords.ycd,
        coords.frameTime
    ];
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
        console.log("coords.xcd: " + coords.xcd);
        console.log("coords.ycd: " + coords.ycd);
        console.log("coords.frameTime: " + coords.frameTime);

    }
    var handson = document.getElementById("hot-display-license-info");
    handson.parentNode.removeChild(handson);

}

//table remove
function divRemove() {
    //표가 없을경우 
    if (flagObj.tableFlag === false) {
        return;
    }
    flagObj.tableFlag = false;
    //id=table인 div 자체를 삭제 
    var _child = document.getElementById("table");
    _child.parentNode.removeChild(_child);

}


//video control
window.onload = function () {
    var video = document.getElementById("vd1");
    var seekBar = document.getElementById("seek-bar");
    seekBar.addEventListener("change", function () {
        var seektime = video.duration * (seekBar.value / 100);
        video.currentTime = seektime;
    });

    //재생시간에 따른 재생바 이동
    video.addEventListener("timeupdate", function () {
        // Calculate the slider value
        var value = (100 / video.duration) * video.currentTime;
        // Update the slider value
        seekBar.value = value;
    });
    // 재생바 클릭시 동영상 중지
    seekBar.addEventListener("mousedown", function () {
        video.pause();

    });
}

init();