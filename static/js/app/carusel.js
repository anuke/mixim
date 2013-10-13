var carusel_slide = 2;
var carusel_slide_mem = 1;

function change_slide_auto()
	{
		$(".carusellement_" + carusel_slide).css({"-moz-opacity":"1", "-khtml-opacity":"1", "opacity":"1"});
		$(".carusellement_" + carusel_slide_mem).css({"-moz-opacity":"0.25", "-khtml-opacity":"0.25", "opacity":"0.25"});
		$("#slide_" + carusel_slide_mem).hide("normal");
		$("#slide_" + carusel_slide).show("normal");
		carusel_slide_mem = carusel_slide++;
		if(carusel_slide > 3)
			carusel_slide = 1;
	}

function change_slide(carusel_slide)
	{
		$(".carusellement_" + carusel_slide).css({"-moz-opacity":"1", "-khtml-opacity":"1", "opacity":"1"});
		$(".carusellement_" + carusel_slide_mem).css({"-moz-opacity":"0.25", "-khtml-opacity":"0.25", "opacity":"0.25"});
		$("#slide_" + carusel_slide_mem).hide("normal");
		$("#slide_" + carusel_slide).show("normal");
		carusel_slide_mem = carusel_slide++;
	}

var carusel_slide_time = 10000;
var carusel_slide_interval_id;
$(document).ready(carusel_slide_interval_id = setInterval(change_slide_auto, carusel_slide_time));
