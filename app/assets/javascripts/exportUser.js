// exportUser.js

// csv

function convertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
          console.log(index + "---" + array[i][index]);
            if (line != '') line += ','
            if(String(index) == "foodName" || String(index) == "info") {
              // replace all commas
                array[i][index] = array[i][index].replace(/,/g,'');
                // replace all # to commas
                if(String(index) == "foodName") array[i][index] = array[i][index].replace(/#/g,',');
            }
            line += array[i][index];
        }

        str += line + '\r\n';
    }
    return str;
}

function exportCSVFile(headers, items, fileTitle) {
    if (headers) {
        items.unshift(headers);
    }

    var jsonObject = JSON.stringify(items);

    var csv = this.convertToCSV(jsonObject);

    var exportedFilename = fileTitle + '.csv' || 'export.csv';

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { 
        navigator.msSaveBlob(blob, exportedFilename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { 
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

function download(){
  var headers = {
      general: 'General',
      info:'info',
      medication: "Medication Name",
      dose: "Dose", 
      glucoseDate: "Glucose Date",
      glucoseval: "Glucose Value",
      stepsDate: "Steps Date", 
      stepsVal: "Steps Value",
      foodDateTime:"Food's Date",
      foodTime:" Time",
      cal:"calories",
      carbs:"carbs",
      protein:"protein",
      fat:"fat",
      foodName:"Food's Name"
  };
  // download the infop of the patient we selected
   var mainMenu = document.getElementById('participants-menu');
       $.ajax( {url: "/api/patients", dataType: "json", type:"get", data: {patient: mainMenu.selectedIndex}})
          .done(function(data){
            // clear the arrays 
                var itemsFormatted = [];
                var stepItems = [];
                var gluItems = [];
                var generalItems = [];
                var medItems = [];
                var items = JSON.stringify(data);

                var stepsArr = data.steps == null? [] : data.steps;
                var gluArr = data.glucose == null? [] : data.glucose;
                var generalArr = data.general == null? [] : data.general;
                var medArr = data.medications == null? [] : data.medications;


                var nutritionData =  JSON.parse(data.nutrition)
      
                var fatData = nutritionData.fat
                var carbsData = nutritionData.carbs
                var proteinData = nutritionData.protein
                var calsData = nutritionData.cals
                var namesData = nutritionData.names


                var genLen = generalArr == null? 0 : generalArr.length;
                var gluLen = gluArr == null? 0 : gluArr.length;
                var medLen = medArr == null? 0 : medArr.length;
                var foodLen = namesData == null? 0 : namesData.length;
                var stepsLen = stepsArr == null? 0 : stepsArr.length;
                var lenArr = [genLen, gluLen, medLen, stepsLen, foodLen];
                var max = Math.max(...lenArr);

                generalArr.length = max;
                stepsArr.length = max;
                gluArr.length = max;
                medArr.length = max;
                namesData.length = max;
                fatData.length = max;
                carbsData.length = max;
                proteinData.length = max;
                calsData.length = max;


                // fill the arrays to be equal lenth, in order to print neatly
                stepsArr.fill([' ',' '], stepsLen, max);
                generalArr.fill([' ',' '], genLen, max);
                gluArr.fill([' ',' '], gluLen, max);
                medArr.fill([' ',' '], medLen, max);
                namesData.fill([' ',' '], foodLen, max);
                fatData.fill([' ',' '], foodLen, max);
                carbsData.fill([' ',' '], foodLen, max);
                proteinData.fill([' ',' '], foodLen, max);
                calsData.fill([' ',' '], foodLen, max);


                for (var i = 0; i < max; i++) {
                          // if the data is null, we dont convert it, but use a blank space instead
                          if(stepsArr[i][0] == 0){formattedTimeStep = " ";}
                          else{
	                          var dateStep = new Date(stepsArr[i][0]*1);
	                          var formattedTimeStep = (dateStep.getMonth()+1) + '/' + dateStep.getDate() + '/' + dateStep.getFullYear();
                      		}

                          if(gluArr[i][0] == 0){formattedTimeGlu = " ";}
                          else{
	                          var dateGlu = new Date(gluArr[i][0]*1);
	                          var formattedTimeGlu = (dateGlu.getMonth()+1) + '/' + dateGlu.getDate() + '/' + dateGlu.getFullYear();
                      	}
                      	// use names date for food 
                      	if(namesData[i][0] == 0){formattedTimeFood = " ";}
                          else{
	                          var dateFood = new Date(namesData[i][0]*1);
	                          var minutes = "0" + dateFood.getMinutes();
							              var seconds = "0" + dateFood.getSeconds();
                            console.log("<<<>>>" + dateFood)
	                          var formattedTimeFood = (dateFood.getMonth()+1) + '/' + dateFood.getDate() + '/' + dateFood.getFullYear() + ',' + dateFood.getHours() + ':' + minutes.substr(-2); //+ ':' + seconds.substr(-2);
                      	}

                            if(medArr[i][0] == "email"){
                              continue;
                            } 


                          itemsFormatted.push({
                                    general: generalArr[i][0],
                                    info: generalArr[i][1],
                                    medication: medArr[i][0],
                                    dose: medArr[i][1],
                                    glucoseDate: formattedTimeGlu,
                                    glucoseval: gluArr[i][1],
                                    stepsDate:formattedTimeStep,
                                    stepsVal: stepsArr[i][1],
                                    foodDateTime:formattedTimeFood,
								    cal:calsData[i][1] === ' ' ?  ' ' : Math.round(calsData[i][1] * 100) / 100 + 'cal',
								    carbs:carbsData[i][1] === ' ' ?  ' ' : Math.round(carbsData[i][1] * 100) / 100 +'g',
								    protein:proteinData[i][1] === ' ' ?  ' ' : Math.round(proteinData[i][1] * 100) / 100 +'g',
								    fat:fatData[i][1] === ' ' ?  ' ' : Math.round(fatData[i][1] * 100) / 100 + 'g',
								    foodName:namesData[i][1]
                                });

                }

                  var fileTitle = 'Patient'+(mainMenu.selectedIndex+1) + 'data'; 

                  exportCSVFile(headers, itemsFormatted, fileTitle); 


         });
}

