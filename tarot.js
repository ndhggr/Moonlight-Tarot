//You've pulled the curtain. This is the real Wizard of Oz, reading your fate.
//Here we set up some global variables, since we'll use them in multiple functions.
//First we make a simple deck of cards. Essentially just filling an array with it's own indices.
var deck = [];

for (i = 0; i < 22; i++){
	deck.push(i);
}

//Then we copy deck so we don't have to make again later
var cards = [...deck];

//We're going to turn the user's birthday into a "seed" to personalize their reading.
var birthdaySeed = 0;
//Dealt hand will simply store the arcana numbers the user draws, simple data we can use for most of what we need.
var dealtHand = [];
//Read hand will only be used when we fetch the meaning of the cards from our json file. It will store the interpretation, we could say.
var readHand = [];

//This is a simple function to return the corresponding image url for each card.
function img(card){
		return ("images/"+card+".jpg");
}

//This is how we draw the cards. We don't really shuffle the deck, just draw randomly. We draw n cards. In this program, always 3.
function draw(n)
{
	for (i=0; i < n; i++) {
		//Here we combine a randomly generated number with our birthday seed.
		//JS doesn't have an easy built-in way to seed random numbers so we just add them together and decrease by 1 if the result is too big.
		//We then multiply our "seeded" random number with our card total and floor it so we get an index within our bounds.
		cardIndex = Math.random() + birthdaySeed;
		if (cardIndex >= 1) {cardIndex = cardIndex-1;}
		cardIndex = Math.floor(cardIndex*cards.length);
		//This is where the draw happens. We store our drawn card in a temporary variable and then take it out of the deck so we don't draw it again.
		//Then we put it at the front of the dealt hand
		currentCard = cards[cardIndex];
		cards.splice(cardIndex, 1);
		dealtHand.unshift(currentCard);
		//Now we use JQuery so our page reflects this draw. We clone our card template (which represents the face down deck).
		//We remove the template class so we don't have more than one of those, and we add the class kill so we can remove the card when we reset.
		//We change the src attribute to the url corresponding to the right card file and then add it to the spread.
		newCard = $(".template").clone();
		newCard.removeClass("template");
		newCard.addClass("kill");
		newCard.attr("src",img(currentCard));
		$("#dealtHand").prepend(newCard);
	}
}
//Clicking the read button will deal the cards and perform the reading itself.
$("#dealbtn").click(function(){
	//We reset the game every time the button is pressed. Even the first time, since it's not inconvenient.
	resetGame();
	//A regex makes sure users input a valid birthday so we can do our "seeding" later. There's a warning on the page.
	if( !$('#birthday').val() || !$('#birthday').val().match(/^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/)){
		$("#birthdaywarn").removeClass("hidden");
		}
	else {
		//In case the user typed an invalid birthday before this, we hide the warning.
		$("#birthdaywarn").addClass("hidden");
		//We turn our seed into an int representing the time at that date. We turn all those numbers into a float of val < 1 by prepending a "." and parsing back into a number. 
		birthdaySeed = new Date($('#birthday').val()).getTime();
		birthdaySeed = parseFloat("." + birthdaySeed);
		//We draw 3 cards.
		draw(3);
		//Here we do an ajax call to retrieve our card interpretations from our json file.
		$.ajax({ 
				type: 'GET', 
				url: ("arcana.json"), 
				data: { get_param: 'value' }, 
				dataType: 'json',
				success: function (arcana) { 
					//The numbers on dealtHand can be used to access that card at that index in the json array. We put these more detailed card objects into readHand.
					dealtHand.forEach(function(index){
						readHand.push(arcana[index]);
					});
				}
			}).done(function(){
				//After we fetch our data we can put it into the modal that pops up on our page, and we're done.
				$("#pastName").text(readHand[0].name);
				$("#pastDesc").text(readHand[0].past);
				$("#presentName").text(readHand[1].name);
				$("#presentDesc").text(readHand[1].present);
				$("#adviceName").text(readHand[2].name);
				$("#adviceDesc").text(readHand[2].advice);
				});
		//We change the text in the submit button to clarify that the user can get their cards read again witout reloading the page.
		$("#dealbtn").html('read again');
		
		setTimeout(function() {
			$('#reading').modal();
		});
	}
});
//We reset all our arrays and delete the elements we created on the page.
function resetGame(){
	cards = [...deck];
	dealtHand = [];
	readHand = [];
	$(".kill").remove();

}