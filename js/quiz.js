
// SETUP VARIABLES

var vizEven = false; 
var submitted=false;
var data = "";
var formURL = "https://docs.google.com/forms/d/1cV-mVthjntVQGz7eK_PE80gPAKZbJ4SN9qLnXg3B--w/formResponse"; // Example: "https://docs.google.com/forms/d/KEYGOESHERE/formResponse"
var spreadsheetURL = "https://docs.google.com/spreadsheet/pub?key=0AmqQKSPoegtOdEcyWldpLWpKY0txU0NRNzBDdW5wZlE&single=true&gid=0&output=csv"; // Example: "https://docs.google.com/spreadsheet/pub?key=KEYGOESHERE&single=true&gid=0&output=csv"
var indicesRound1 = [0,7,1,6,2,5,3,4,8,15,9,14,10,13,11,12];
var indicesRound2 = [16,23,17,22,18,21,19,20,24,31,25,30,26,29,27,28];

// SETUP
$('.viz-form').attr("action", formURL);


// LOAD DAT DATA
d3.csv(spreadsheetURL, function(error, data) {
	var myObj = {};

	// Get and order only the day's designers
	data = filterData(data, indicesRound1);

	// Create an object that underscore likes
	myObj['designers'] = data;
	data = myObj;

	// Populate the quiz
	populateQuiz(data);
});



// HANDLERS

// Get out the vote!
$('.viz-quiz-wrapper').on("click", '.viz-quiz-target', function() {
	var $this = $(this);
	var winner = $this.closest('.viz-choice-item');
	var winnerInput = winner.find('.viz-radio');
	var loser = $this.closest('.viz-choice-item').siblings('.viz-choice-item');
	var loserTarget = loser.find('.viz-quiz-target');
	var submittedAlert = winner.siblings('.viz-submitted-alert');

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
$('.viz-quiz-wrapper').on("click", '.viz-choice-item', function() {
	var $this = $(this);
	$this.find('.viz-designer-description').slideToggle(200);
});

// Stops voting from showing the description the first time
$('.viz-quiz-wrapper').on("click", '.viz-choice-item .viz-quiz-target', function(e) {
	e.stopPropagation();
});



// HELPERS

function populateQuiz(data) {
	var firstTemplate = _.template(
	    $( ".viz-quiz-template" ).html()
	);
	var secondTemplate = _.template(
	    $( ".viz-quiz-template" ).html()
	);

	var toAppendString = "";

	for (i = 0; i < data.designers.length; i++) {
		if( i % 2 ) {
			vizEven = true;
		} else {
			vizEven = false;
		}
		toAppendString += secondTemplate(data.designers[i]);
	}  

	$(".viz-quiz-wrapper").prepend(
	    toAppendString
	);
}

function filterData(data, desiredIndices) {
	var filteredArray = [];

	for (i = 0; i < desiredIndices.length; i++) {
	  filteredArray.push(data[desiredIndices[i]]);
	}  

	console.log(filteredArray);

	return filteredArray;

}




