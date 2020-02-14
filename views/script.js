$(document).ready(function(){
	const slides = $(".inset");
	let curSlideIndex = 0;
	
	setSize()
	function show(slide){
		slides.each(function(ind,cur){
			if(slide != ind)
				$(cur).addClass('hidden')
			else
				$(cur).removeClass('hidden')
		})
		
		if(slide == 0)
			$('#prev').css("display","none")
		else
			$('#prev').css("display","inline-block");
		
		if(slide == slides.length - 1){
			$('#nex').css("display","none")
			$('#sub').css("display","inline-block");
		} else {
			$('#nex').css("display","inline-block");
			$('#sub').css("display","none")
		}
	}
	
	$("#nex").click(function(){
		var cur_elem = $(slides[curSlideIndex]).find('input.text')
		if(curSlideIndex < slides.length){
			inputValid = true
			
			if(cur_elem.length > 0){
				inputValid = cur_elem[0].checkValidity()
			}
					
			if(inputValid){
				$(slides[curSlideIndex]).addClass('hidden')
				curSlideIndex++
				$(slides[curSlideIndex]).removeClass('hidden')
				show(curSlideIndex)
				$('label.alert').text('')
			} else {
				cur_elem.css('borderColor','red')
				$('label.alert').text(cur_elem.attr('title'))
			}
			
		}
	});	
	
	$("#prev").click(function(){		//curSlideIndex
		if(curSlideIndex > 0){
			if(curSlideIndex == (slides.length - 1))
				console.log("SHOW THE PREVIOUS SLIDE SHOW THE NEXT BUTTON AND HIDE SUBMIT")
				
			//do this to show the previous slide
			$(slides[curSlideIndex]).addClass('hidden')
			curSlideIndex--
			$(slides[curSlideIndex]).removeClass('hidden')
			show(curSlideIndex)
		}
	});
	
	function setSize(){
		var finalSize = "10vh";
		if(size_size == "small")
			finalSize = "3vh"
		else if(size_size == "medium")
			finalSize = "5vh"
		else if(size_size == "large")
			finalSize = "10vh"
		else
			finalSize = "10vh"
			
			
		
		$("input, textarea").css("font-size",finalSize)
	}
	show(0)
});