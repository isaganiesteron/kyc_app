(function() {
	function showSlide(n) {
		slides[currentSlide].classList.remove("active-slide");
		slides[n].classList.add("active-slide");
		currentSlide = n;

		if (currentSlide === 0) {
			previousButton.style.display = "none";
		} else {
			previousButton.style.display = "inline-block";
		}

		if (currentSlide === slides.length - 1) {
			nextButton.style.display = "none";
			submitButton.style.display = "inline-block";
		} else {
			nextButton.style.display = "inline-block";
			submitButton.style.display = "none";
		}
	}

	function showNextSlide() {
		showSlide(currentSlide + 1);
	}

	function showPreviousSlide() {
		showSlide(currentSlide - 1);
	}

//	const quizContainer = document.getElementById("quiz");
//	const resultsContainer = document.getElementById("results");
	const submitButton = document.getElementById("submit");

	const previousButton = document.getElementById("previous");
	const nextButton = document.getElementById("next");
	const slides = document.querySelectorAll(".slide");
	let currentSlide = 0;

	showSlide(0);

	previousButton.addEventListener("click", showPreviousSlide);
	nextButton.addEventListener("click", showNextSlide);
	submitButton.addEventListener("click",  function(){
		document.getElementById("form").submit()
	})
  
})();