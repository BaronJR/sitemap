console.log("Hello World!");

var Converter = require("csvtojson").Converter;
var converter = new Converter({
  checkType:false //turn off auto type check to increase performance 
});
 
//end_parsed will be emitted once parsing finished 
converter.on("end_parsed", function (jsonArray) {
    //console.log(jsonArray); //here is your result jsonarray 

    var finalTree = [];

	var siteTree = function (siteArray) {
		
		//the loop below removes the Locales from the page urls;
		for (var page in siteArray) {
			
			for (var i=0; i<siteArray[page].Page.length; i++) {
				if ((siteArray[page].Page[i] === "L")&&(siteArray[page].Page[i+1] === "O")&&(siteArray[page].Page[i+2] === "C")) {
					siteArray[page].Page = siteArray[page].Page.substring(i+6,siteArray[page].Page.length);
				}
			};
		};

		//The function below sorts all of the pages alphabetically, so that locales can be joined.
		siteArray.sort(function (a, b) {
		
		if (a.Page > b.Page) {
			return 1;
		}
		if (a.Page < b.Page) {
			return -1;
		}
		  // a must be equal to b
			return 0;
		});

		for (var i=0; i<siteArray.length; i++) {
			siteArray[i].Pageviews = parseInt(siteArray[i].Pageviews.replace(/,/g,""),10);
		}

		//The function below removes and adds together any duplicates.  Views are combined.
		for (var i=(siteArray.length-1); i>0; i--) {
			if (siteArray[i].Pageviews < 10) {
				delete siteArray[i];
			}
			else if (siteArray[i].Page === siteArray[i-1].Page) {	
				siteArray[i-1].Pageviews += siteArray[i].Pageviews;
				delete siteArray[i];
			}
			// else if (siteArray[i].Page.length < (siteArray[i-1].Page.length + 2)) {	
			// 	siteArray[i-1].Pageviews += siteArray[i].Pageviews;
			// 	delete siteArray[i];
			// }
		};

		newArray = [];
		for (var i=0; i<siteArray.length; i++) {
			if (siteArray[i] !== undefined) {
				newArray.push(siteArray[i]);
			}
		}

		// console.log(newArray);

		//Then I create a new object for every line in the new array that will be our final tree.  Each page gets its own children object and we don't care about sorting yet.
		for (var i=0; i<newArray.length; i++){
			finalTree[i] = new Object();
			finalTree[i]["name"] = newArray[i].Page;
			finalTree[i]["group"] = 1;
			finalTree[i]["views"] = newArray[i].Pageviews;
			finalTree[i]["children"] = [];
		}

		// console.log(finalTree);

		//After creating the array above, we're going to sort all children into their parents.  It works by creating an object for every line in the existing array, and then sorting children objects into parents.
		for (i=(finalTree.length-1); i>0; i--) {
			var check = true;
			var j=1;

			while (check) {
				if (finalTree[i]["name"].substring(0,finalTree[i-j]["name"].length) === finalTree[i-j]["name"]) {
					finalTree[i]["name"] = finalTree[i]["name"].substring(finalTree[i-j]["name"].length, finalTree[i]["name"].length);
					finalTree[i-j]["children"].push(finalTree[i]);
					check = false;
				}
				else {
					j++;
				};
			}
		}

		finalTree[0]["name"] = "Home";
		var data = finalTree[0];
		
		fs = require ('fs');

		fs.writeFile('data.js', JSON.stringify(data), function (err) {
  			if (err) throw err;
  			console.log('It\'s saved!');
		});

	};

	var addViews = function(siteArray) {

	}

	siteTree(jsonArray);
});
 
//read from file 
require("fs").createReadStream("./sc2.csv").pipe(converter);

