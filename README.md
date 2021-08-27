# Web-based experimental video analysis

<img src=https://user-images.githubusercontent.com/44563011/131056297-2712f9c4-dfa9-401f-b427-02b1609e289a.PNG width="800" height="580">
<img src=https://user-images.githubusercontent.com/44563011/131056306-ffdc49b3-e57f-458a-b8c8-7a2b91a7211c.PNG width="800" height="480">
<img src=https://user-images.githubusercontent.com/44563011/131056309-248131f4-bb25-4781-b8a3-c1d015e0984c.PNG width="800" height="400">   


## function
1. 분석모드(analysis mode)
- XYLine : draggable SVG, reverse xaixs
- Video onmouse => readout coordinate
- Set origin => coordinate transformation
- Set guideline length => coordinate transformation
- Draw a circle by clicking on the desired location on the video.
- A table is created on every click(handsontable)
- The circle can be redrawn with the redraw button

2. 그래프 출력(create graph)
- Drawing graphs with tabular data
- Area selection and fitting graph (linear, curved) drawing
- Table is modified, reflected in the graph
- Zoom in, zoom out
- data hover
- save as png

3. Graphql API
- Put solverid and save the table
- Put UserdatasID to load table

### Prerequisites


```
grapql API(서버 연결시)
```


## Built With

* [kmj0792](https://github.com/kmj0792) - All functions related to graphs

## License


