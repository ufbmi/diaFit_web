
function update_graphs() {
    var mainMenu = document.getElementById('participants-menu');
  $.ajax( {url: "/api/patients", dataType: "json", type:"get", data: {patient: mainMenu.selectedIndex}})
    .done(function(data){
      clean_tables();
      display_graphs(data);
      display_general_data(data.general);
      display_medications(data.medications);

    });
}
function display_general_data(data){

for (x in data){
if(data[x][0]== "age"){
  document.getElementById('age').innerHTML = data[x][1];
} else if (data[x][0]== "height"){
  document.getElementById('height').innerHTML = data[x][1];
} else if (data[x][0]== "weight"){
  document.getElementById('weight').innerHTML = data[x][1];
} else if (data[x][0]== "gender"){
  document.getElementById('gender').innerHTML = data[x][1];
}
else if (data[x][0]== "race"){
  document.getElementById('race').innerHTML = data[x][1];
}
else if (data[x][0]== "familyHistory"){
  document.getElementById('familyHistory').innerHTML = data[x][1];
}
}
}
function createMenu() {
  $(function() {
    console.log("his ran at init2")
          //Call mainMenu the main drop-down menu
          document.getElementById('menu');
          var dropDownMenu = document.getElementById('participants-menu');
          //Create options
          for (i = 1; i <= gon.total_options; i++) {
            var stringValue = "Participant: "  + i;
            var optionField=document.createElement("option");
            optionField.text=stringValue;
            dropDownMenu.add(optionField,dropDownMenu.options[null]);
          }
          $.ajax( {url: "/api/patients", dataType: "json", type:"get", data: {patient: 0}})
          .done(function(data){
            display_graphs(data);
            display_general_data(data.general);
            display_medications(data.medications);
          });

        });
}



function getData() {
  console.log("GETDATA");
  $( document ).ready(function() {
    $(".message-form").on("submit", function() {
      $.ajax( {url: "/api/patients", dataType: "json", type:"get", data: {patient_name: $("input[name='patient-name']").val(), message: $("textarea[name='message']").val()}})
      .done(function(data){
        alert(data);
      });
    });
  });
  console.log("This ran at init")
}

function clean_tables(){
    document.getElementById('age').innerHTML = "N/A";
    document.getElementById('height').innerHTML = "N/A";
    document.getElementById('weight').innerHTML = "N/A";
    document.getElementById('gender').innerHTML = "N/A";
    document.getElementById('race').innerHTML = "N/A";
    document.getElementById('familyHistory').innerHTML = "N/A";
    // clean the med table
    $("#meds-table tr").remove(); 
}


function display_medications(data){
  var table = document.getElementById("meds-table");

  var row_title = table.insertRow(0);
    // using i to make medicine and dose title show up at first (index 0)
    for(x in data){
      if(data[x][0] != "email"){
        var newRow = table.insertRow(x-1);
        cell_title = newRow.insertCell(0);
        cell_content = newRow.insertCell(1);
        cell_title.innerHTML = data[x][0];
        cell_content.innerHTML = data[x][1];
        i++;
      }
    }
}

function display_graphs(data) {
      glucoseData = data.glucose
      stepsData = data.steps
      nutritionData =  JSON.parse(data.nutrition)
      // fiberData = nutritionData.fiber
      fatData = nutritionData.fat
      carbsData = nutritionData.carbs
      proteinData = nutritionData.protein
      calsData = nutritionData.cals
      namesData = nutritionData.names


      var glucoseData = 
        {
        //glucose
        data: glucoseData, color: '#ff005c', yaxis: 1, label:"Glucose"
        };

      var ActData = 
        {
        //steps
        data: stepsData, color: '#00b2ff', yaxis: 2, label:"Steps"
        };


      var nutritionData = [
        {
        data: calsData, color: '#ffb800',label:"Calories"
        }
      ];




      $.plot("#glucose-activity",
        // glucoseActData,
      [glucoseData,ActData],
      {
        series: {
          points: {
            show: true,
            radius: 5
          },
          lines: {
            show: true
          }
        },
        legend: {
            labelBoxBorderColor: null,
            noColumns: 3,
            position: "nw",
            // margin: 5,
            backgroundColor: "#ffffff" ,
            backgroundOpacity: 0.2,
            container: document.getElementById("gluLabels"),
            sorted: null
        },
        xaxis:  { mode: "time" } ,
        yaxes: [ { }, { position:"right" }],
        grid: {
          hoverable: true,
          clickable: true
        }
      }
      );

      $.plot("#nutrition",
      nutritionData,
      {
        series: {
          points: {
            show: true,
            radius: 5
          },
          lines: {
            show: true
          }
        },
        legend: {
            labelBoxBorderColor: null,
            noColumns: 3,
            position: "nw",
            // margin: 5,
            backgroundColor: "#ffffff",
            backgroundOpacity: 0.2,
            container: document.getElementById("nuLabel"),
            sorted: null
        },
        xaxis:
        {
          mode: "time"
        },
        grid: {
          hoverable: true,
          clickable: true
        }
      }
      );
      $("<div id='tooltip'></div>").css({
      position: "absolute",
      display: "none",
      border: "px solid #000",
      borderRadius:"8px",
      padding: "10px",
      "background-color": "black",
      opacity: 0.80
      }).appendTo("body");
      $("#glucose-activity").bind("plothover", function (event, pos, item) {
      if (item) {
        var y = parseInt (item.datapoint[1].toFixed(2));
        $("#tooltip").html(item.series.label + " is " + y)
        .css({top: item.pageY+5, left: item.pageX+5})
        .fadeIn(200);
      } else {
        $("#tooltip").hide();
      }
      });

      $("#nutrition").bind("plothover", function (event, pos, item) {
      if (item) {
        var date = parseInt (item.datapoint[0].toFixed(2));
        for (i = 0; i < namesData.length; i++) {
          if(date == namesData[i][0]) {
            var names = namesData[i][1].split("#")
          }
          if(date == fatData[i][0]) {
            var totalFat = fatData[i][1]
          }
          if(date == carbsData[i][0]) {
            var totalCarbs = carbsData[i][1]
          }
          // if(date == fiberData[i][0]) {
          //   var totalFiber = fiberData[i][1]
          // }
          if(date == proteinData[i][0]) {
            var totalProtein = proteinData[i][1]
          }
        }

        var labelCalories = item.series.label + ": " + item.datapoint[1]+"cals";
        // console.log(item.series.label)
        var labelFat = "<br/> Total Fat: " + totalFat+"g";
        var labelCarbs = "<br/> Total Carbs: " + totalCarbs+"g";
        // var labelFiber = "<br/> Total Fiber: " + totalFiber;
        var labelProtein = "<br/> Total Protein: " + totalProtein+"g";
        var labelNames= "<br/> Menu: ";
        for (i = 0; i< names.length; i++){
          labelNames = labelNames + "<br/>" + names[i]
        }
        var labelAllInfo =  labelCalories + labelFat + labelCarbs + labelProtein + labelNames
        $("#tooltip").html(labelAllInfo)
        .css({top: item.pageY + 10, left: item.pageX + 10})
        .fadeIn(200);
      } else {
        $("#tooltip").hide();
      }
      });
}

// '.tbl-content' consumed little space for vertical scrollbar, scrollbar width depend on browser/os/platfrom. Here calculate the scollbar width .
$(window).on("load resize ", function() {
  var scrollWidth = $('.tbl-content').width() - $('.tbl-content table').width();
  $('.tbl-header').css({'padding-right':scrollWidth});
}).resize();
