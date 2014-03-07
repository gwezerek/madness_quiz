
// SETUP VARIABLES
// =============================================

var data = "";
// Plz don't be messing with the form if you happen to be checking out the guts of this guy :)
var formURL = "https://docs.google.com/forms/d/1cV-mVthjntVQGz7eK_PE80gPAKZbJ4SN9qLnXg3B--w/formResponse"; // Example: "https://docs.google.com/forms/d/KEYGOESHERE/formResponse"
var spreadsheetURL = "https://docs.google.com/spreadsheet/pub?key=0AmqQKSPoegtOdEcyWldpLWpKY0txU0NRNzBDdW5wZlE&single=true&gid=0&output=csv"; // Example: "https://docs.google.com/spreadsheet/pub?key=KEYGOESHERE&single=true&gid=0&output=csv"

// For template
var vizEven = false; 
var vizQuiz = false;
var quizTemplate = _.template(
    $( ".viz-designer-template" ).html()
);

// For quiz
var indicesRound1 = [0,7,1,6,2,5,3,4,8,15,9,14,10,13,11,12];
var indicesRound2 = [16,23,17,22,18,21,19,20,24,31,25,30,26,29,27,28];
var indicesRound3 = [16,23,17,22,18,21,19,20,24,31,25,30,26,29,27,28];
var indicesRound4 = [16,23,17,22,18,21,19,20];
var indicesRound5 = [16,23,17,22];
var indicesRound6 = [16,23];

// For rankings
var division1Round = 1;
var division2Round = 1;
var division3Round = 1;
var division4Round = 1;
var division5Round = 1;
var division6Round = 1;

var division1Round1 = [0,7,1,6,2,5,3,4];
var division1Round2 = [0,7,1,6,2,5,3,4];
var division1Round3 = [0,7,1,6,2,5,3,4];

var division2Round1 = [8,15,9,14,10,13,11,12];
var division2Round2 = [8,15,9,14,10,13,11,12];
var division2Round3 = [8,15,9,14,10,13,11,12];

var division3Round1 = [16,23,17,22,18,21,19,20];
var division3Round2 = [16,23,17,22,18,21,19,20];
var division3Round3 = [16,23,17,22,18,21,19,20];

var division4Round1 = [24,31,25,30,26,29,27,28];
var division4Round2 = [24,31,25,30,26,29,27,28];
var division4Round3 = [24,31,25,30,26,29,27,28];

var division5Round1 = [0,1,2,3];
var division5Round2 = [2,4];

var division6Round1 = [2];



// SETUP
// =============================================

$('.viz-form').attr("action", formURL);





// LOAD DAT DATA
// =============================================

d3.csv(spreadsheetURL, function(error, data) {
	// populateQuiz(data);
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
	var divisions = $('.viz-division');
	vizQuiz = false; // This flag hides the viz-choice-target and ul wrapper element in the template

	// Populate each divison with designers
	divisions.each(function() {
		var toAppendString = "";
		var myObj = {};
		var $this = $(this);
		var divisionID = $this.attr("id");
		var divisionRound = $this.data("round");
		var desiredIndices = eval(divisionID + "Round" + divisionRound);

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
		$this.find(".viz-division-list").append(toAppendString);

	});
}

function filterData(data, desiredIndices) {
	var filteredArray = [];

	for (i = 0; i < desiredIndices.length; i++) {
	  filteredArray.push(data[desiredIndices[i]]);
	}  
	return filteredArray;
}




