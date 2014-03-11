 
// SETUP VARIABLES
// =============================================

var data = "";
// Plz don't be messing with the form if you happen to be checking out the guts of this page :)
var formURL = "https://docs.google.com/forms/d/1cV-mVthjntVQGz7eK_PE80gPAKZbJ4SN9qLnXg3B--w/formResponse"; // Example: "https://docs.google.com/forms/d/KEYGOESHERE/formResponse"
var spreadsheetURL = "https://docs.google.com/spreadsheet/pub?key=0AmqQKSPoegtOdEcyWldpLWpKY0txU0NRNzBDdW5wZlE&single=true&gid=0&output=csv"; // Example: "https://docs.google.com/spreadsheet/pub?key=KEYGOESHERE&single=true&gid=0&output=csv"

// For template
var vizEven = false; 
var vizQuiz = false;
var quizTemplate = _.template(
    $( ".viz-designer-template" ).html()
);

// For quiz
var indicesRound1 = [0,7,1,6,2,5,3,4,8,15,9,14,10,13,11,12,16,23,17,22,18,21,19,20,24,31,25,30,26,29,27,28];
var indicesRound2 = [16,23,17,22,18,21,19,20,24,31,25,30,26,29,27,28];
var indicesRound3 = [16,23,17,22,18,21,19,20];
var indicesRound4 = [16,23,17,22];
var indicesRound5  = [16,23];

// For rankings
var divisions = {
	division1: {
		roundNumber: 1,
		roundArray: [1],
		round1: [0,7,1,6,2,5,3,4],
		round2: [2,7,1,6,0,5,3,4],
		round3: [0,7,1,6,2,5,3,4]
	},
	division2: {
		roundNumber: 1,
		roundArray: [1],
		round1: [8,15,9,14,10,13,11,12],
		round2: [8,15,9,14,10,13,11,12],
		round3: [8,15,9,14,10,13,11,12]
	},
	division3: {
		roundNumber: 1,
		roundArray: [1],
		round1: [16,23,17,22,18,21,19,20],
		round2: [16,23,17,22,18,21,19,20],
		round3: [16,23,17,22,18,21,19,20]
	},
	division4: {
		roundNumber: 1,
		roundArray: [1],
		round1: [24,31,25,30,26,29,27,28],
		round2: [24,31,25,30,26,29,27,28],
		round3: [24,31,25,30,26,29,27,28]
	},
	division5: {
		roundNumber: 1,
		roundArray: [1],
		round1: [0,1,2,3],
		round2: [2,3,1,0]
	},
	division6: {
		roundNumber: 1,
		roundArray: [1],
		round1: [2]
	}
}



// SETUP
// =============================================

// Set the form url
$('.viz-form').attr("action", formURL);

// Set each rankings division's round to the latest we've defined above
populateRounds();






// LOAD DAT DATA
// =============================================

d3.csv(spreadsheetURL, function(error, data) {
	buildBracket(data);
	populateQuiz(data);
	populateRankings(data);
});






// HANDLERS
// =============================================

// Vote functionality
$('.viz-quiz-wrapper').on("click", '.viz-quiz-target', function() {
	var $this = $(this);
	var winner = $this.closest('.viz-choice-item');
	var winnerInput = winner.find('.viz-radio');
	var loser = $this.closest('.viz-choice-item').siblings('.viz-choice-item');
	var loserTarget = loser.find('.viz-quiz-target');
	var submittedAlert = $this.closest('.viz-choices-group').next('.viz-submitted-alert');

	// Add classes
	loser.addClass('viz-choice-loser');
	winner.addClass('viz-choice-winner');

	// Remove handlers
	$this.off("click");
	loserTarget.off("click");

	// Let the user know the vote was submitted
	submittedAlert.slideDown(200).delay(1000).slideUp(200);

	// Enable and select our answer, submit the quiz
	winnerInput.attr("disabled", false);
	winnerInput.attr("checked", true);

	// Delay form submission to give submittedAlert time to finish
	setTimeout(function() {

		$(".viz-form").submit();

		// Disable selected answer so it doesn't get sent
		// When the user selects another answer
		winnerInput.attr("disabled", true);

	}, 2000);
	
});

// Show/hide the description
$('.viz-container').on("click", '.viz-choice-item', function() {
	var $this = $(this);
	var selectedDescription = $this.find('.viz-designer-description');

	$(".viz-designer-description").not(selectedDescription).slideUp(200);
	selectedDescription.slideToggle(200);
});

// Stops voting from showing the description the first time
$('.viz-container').on("click", '.viz-choice-item .viz-quiz-target', function(e) {
	e.stopPropagation();
});

// Iterating through rounds
$(".viz-division-button").on("click", function() {
	var toAppendString = "";
	var $this = $(this);
	var division = $this.closest(".viz-division");
	var divisionID = division.attr("id");
	var oldRoundNumber = divisions[divisionID]['roundNumber'];
	var divisionRoundArray = divisions[divisionID]['roundArray'];
	var addRound = false;
	var subRound = false;

	if ($this.hasClass("viz-next")) {
		addRound = true
	} else {
		subRound = true
	}

	var currentDivisionRound = updateRoundNumber(oldRoundNumber, addRound, subRound);
	var desiredIndices = divisions[divisionID]['round' + currentDivisionRound];

	updateTopperText(division, currentDivisionRound);
	divisions[divisionID]['roundNumber'] = currentDivisionRound;
	setButtons(currentDivisionRound, divisionRoundArray, division);

	// Reorder elements
	toAppendString = refilterData(division, desiredIndices);
	division.find(".viz-division-designers-list").html(toAppendString);

	setLosers(currentDivisionRound, division);

});








// HELPERS
// =============================================

function populateQuiz(data) {
	var myObj = {};
	var toAppendString = "";
	vizQuiz = true;  // This flag shows the viz-choice-target and ul wrapper element in the template

	// Get and order only the day's designers
	quizData = filterData(data, indicesRound1);

	// Create objects that underscore likes
	myObj['designers'] = quizData;
	quizData = myObj;

	// Compile the list for that round
	for (i = 0; i < quizData.designers.length; i++) {
		if( i % 2 ) {
			vizEven = true;
		} else {
			vizEven = false;
		}
		toAppendString += quizTemplate(quizData.designers[i]);
	}  

	// Append the list
	$(".viz-quiz-wrapper").prepend( toAppendString );
}

function populateRankings(data, container) {
	var divisionElements = $('.viz-division');
	vizQuiz = false; // This flag hides the viz-choice-target and ul wrapper element in the template

	// Populate each divison with designers
	divisionElements.each(function() {
		var toAppendString = "";
		var myObj = {};
		var $this = $(this);
		var divisionID = $this.attr("id");
		var divisionRound = divisions[divisionID]['roundNumber'];
		var divisionRoundArray = divisions[divisionID]['roundArray'];
		var desiredIndices = divisions[divisionID]['round'+divisionRound];

		// Get and order only the division's designers
		rankingsData = filterData(data, desiredIndices);

		// Create objects that underscore likes
		myObj['designers'] = rankingsData;
		rankingsData = myObj;

		// Compile the list for that division
		for (i = 0; i < rankingsData.designers.length; i++) {
			toAppendString += quizTemplate(rankingsData.designers[i]);
		}  

		// Append the list
		$this.find(".viz-division-designers-list").append(toAppendString);

		// Fade out the losers
		setLosers(divisionRound, $this);

		// Show and hide the right buttons
		setButtons(divisionRound, divisionRoundArray, $this);

	});
}

function filterData(data, desiredIndices) {
	var filteredArray = [];

	for (i = 0; i < desiredIndices.length; i++) {
	  filteredArray.push(data[desiredIndices[i]]);
	}  
	return filteredArray;
}

function refilterData(container, desiredIndices) {
	var filteredArray = [];

	for (i = 0; i < desiredIndices.length; i++) {
		var desiredElement = container.find("[data-originalIndex='" + desiredIndices[i] + "']");
		filteredArray.push(desiredElement[0]);
	}  
	return filteredArray;
}

function populateRounds() {
	var divisionElements = $(".viz-division");
	divisionElements.each(function() {
		var $this = $(this);
		var roundNumber = divisions[$this.attr("id")]['roundNumber'];

		updateTopperText($this, roundNumber);
	});
}

function setButtons(roundNumber, roundArray, container) {
	var prevButton = container.find(".viz-prev");
	var nextButton = container.find(".viz-next");

	if (roundNumber == roundArray[0]) {
		prevButton.hide();
	} else {
		prevButton.show();
	}

	if (roundNumber == roundArray[roundArray.length - 1]) {
		nextButton.hide();
	} else {
		nextButton.show();
	}
}

function updateRoundNumber(oldRoundNumber, addRound, subRound) {
	return oldRoundNumber + addRound - subRound;
}

function updateTopperText(container, roundNumber) {
	container.find(".viz-division-round").text("Round " + roundNumber);
}

function setLosers(roundNumber, container) {

	var designers = container.find(".viz-choice-item");

	// Reset losers
	designers.removeClass("viz-choice-loser");

	if (roundNumber == 2) {
		designers.slice(-4).addClass("viz-choice-loser");
	} else if (roundNumber == 3) {
		designers.slice(-6).addClass("viz-choice-loser");
	}
	
}







// THE D3 BITS

var margin = {top: 10, right: 100, bottom: 0, left: 0},
    width = 500 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

var tree = d3.layout.tree()
    .separation(function(a, b) { return a.parent === b.parent ? 1 : 2; })
    .children(function(d) { return d.parents; })
    .size([height, width]);

var svg = d3.select(".viz-bracket-right").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function buildBracket(data) {
	d3.json("treeData.json", function(json) {

	  var nodes = tree.nodes(json);

	  var link = svg.selectAll(".link")
	      .data(tree.links(nodes))
	    .enter().append("path")
	      .attr("class", "viz-bracket-elbow")
	      .attr("d", elbow);

	  var node = svg.selectAll(".node")
	      .data(nodes)
	    .enter().append("g")
	      .attr("class", "node")
	      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })

	  var text = node.append("text")
	      .attr("class", function(d) {
	      	if (d.lost == "true") {
		      	console.log(d.lost);
	      		return "viz-designer-name viz-designer-loser"; 
	      	} else {
	      		return "viz-designer-name"; 
	      	}
	      })
	      .attr("text-anchor", "end")
	      .attr("x", 94)
	      .attr("y", -6);

	   var seed = text.append("tspan")
		  .attr("class", "viz-bracket-seed")
	      .text(function(d) {
	      	if (data[d.competitorIndex] && data[d.competitorIndex]['rank']) {
	      		return data[d.competitorIndex]['rank']; 
	      	}
	      });

	   var seed = text.append("tspan")
		  .attr("class", "viz-bracket-designer-name")
		  .attr("dx","3")
	      .text(function(d) {
	      	if (data[d.competitorIndex] && data[d.competitorIndex]['name']) {
	      		return data[d.competitorIndex]['name']; 
	      	}
	      });

	    adjustFinals();

	});
}

function adjustFinals() {
	var elbows = $(".viz-bracket-elbow");
	elbows.eq(0).attr("d","M0,340H100V135")
	elbows.eq(1).attr("d","M0,340H100V405")

	$(".node").eq(0).attr("transform", "translate(0,340)");
}

function elbow(d, i) {
  return "M" + d.source.y + "," + d.source.x
       + "H" + d.target.y + "V" + d.target.x
       + (d.target.children ? "" : "h" + margin.right);
}




