function AddFormAntiForgeryToken(data) {
	data.__RequestVerificationToken = $("input[name='__RequestVerificationToken']").val();
	return data;
}
var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
var IE = navigator.appName === 'Microsoft Internet Explorer' || !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)) || (typeof $.browser !== "undefined" && $.browser.msie === 1);


if (isChrome) {
	//alert("You are using Chrome!");
	windowScroll = $('html');
} else if (isFirefox) {
	//alert("You are using FF!");
	windowScroll = $('html');
} else if (isSafari) {
	//alert("You are using SAFARI!");
	windowScroll = $('html');
} else if (IE) {
	//alert("You are using IE!");
	windowScroll = $('html');
} else {
	windowScroll = $('body');
	//alert("You are NOOOT using Chrome! or EDGE");
}
function closefancybox() {
	parent.$.fancybox.close();
}
$(document).ready(function () {
	loadfancybox();
	if ($(window).width() > 920) {
		AOS.init({
			easing: 'ease-in-out-sine'
		});
	}
	$(".selectedMenu").on("click", function (event) {
		event.preventDefault();
		$(this).parent(".subMenuLinks").find("ul").slideToggle();
	});
});


//$(window).one('scroll',function() {

//if($('.inlineList').offset().top + 100){
//animateValue('apartment', 0, 300, 5000);
//animateValue('apartments', 0, 40, 5000);
//animateValue('countries', 0, 5, 5000);
//animateValue('office', 0, 2, 2000);
//animateValue('shops', 0, 2, 2000);
//}

//});




function animateValue(id, start, end, duration) {
	var range = end - start;
	var current = start;
	var increment = end > start ? 1 : -1;
	var stepTime = Math.abs(Math.floor(duration / range));
	var obj = document.getElementById(id);
	var timer = setInterval(function () {
		current += increment;
		if (obj != null) {
			obj.innerHTML = current;
		}
		
		if (current == end) {
			clearInterval(timer);
		}
	}, stepTime);
}





function loadfancybox() {
	$("[data-fancybox-fullscreen]").fancybox({
		iframe: {
			preload: true,
			css: {
				width: '100%',
				height: '100%'
			}
		}
	});

}
$(window).load(function () {
	$('body').addClass('loaded');

	if ($(window).width() < 768) {
		var tabText = $(".subMenuLinks ul li.active a").html();
		$(".subMenuLinks .selectedMenu").text(tabText);
	}

	AOS.refresh();
	
	mediaHpCall();
	appSlider();
	progressSliderCall();
	floorSliderCall();

	subBannerSlider();

	
	

	
});

$(window).scroll(function () {
	if ($('.latestOffers') != null && $('.latestOffers').length > 0) {
		if ($(this).scrollTop() >= ($('.latestOffers').offset().top - 500)) { // this refers to window
			$('.latestOffers').addClass('active');
		}
		else {
			$('.latestOffers').removeClass('active');
		}
	}

	if ($('.backgroundBlock') != null && $('.backgroundBlock').length > 0) {
		if ($(this).scrollTop() >= ($('.backgroundBlock').offset().top - 500)) { // this refers to window
			$('.backgroundBlock').addClass('active');
		}
		else {
			$('.backgroundBlock').removeClass('active');
		}
	}
	
});

function highlightmenu(div) {
	$("#" + div).addClass("active");
}
$(document).ready(function () {
	tabsTrigger();
	expandCollapse();
$('.languageHolder span').click(function () {
		$(this).toggleClass('active');
		$(this).parent('.languageHolder').find('ul').slideToggle();
});

	//$('.languageHolder span').click(function () {
	//	$(this).toggleClass('active');
	//	$(this).parent('.languageHolder').find('ul').slideToggle();
	//});

	$('#nav-icon3').click(function () {
		$('body').toggleClass('active');
	});

	$('.uploadFile').change(function () {
		var srt = $(this).val();
		$('.uploadValue').text(srt);
	});


	$('.filterTtile').click(function () {
		$(this).toggleClass('active');
		$(this).parent('.filterItem').find('.filterList').slideToggle();

	});

	$('.chooseProject').click(function () {
		$(this).toggleClass('active');
		$(this).parent('.otherProjects').find('ul').slideToggle();

	});

	$('.floorSlider .swiper-slide').click(function () {
		$(this).addClass('checked');
		$('.floorSlider .swiper-slide').not($(this)).removeClass('checked');
	});

});




function tabsTrigger() {
	$('.tabsLinks a').click(function () {
		var $this = $(this);
		var getParent = $this.closest('.tabsMain');
		getParent.find('> .tabsHolder > .tab').fadeOut();
		getParent.find('> .tabsLinks a').not($(this)).removeClass('active');
		$(this).addClass('active');
		getParent.find('> .tabsHolder > .tab:eq(' + $(this).index() + ')').fadeIn();
	});
	$('.tabsMain').each(function (index, element) {
		$(this).find('.tabsLinks a:first').click();
	});
}


function mediaHpCall() {
	$('.videosList .flexslider').flexslider({
		animation: "fade",
		animationLoop: false,
		mousewheel: false
	});

}

function expandCollapse() {
	$('.toggleTitle').click(function () {
		$(this).parent().find($('.toggleContent')).slideToggle();
		$(this).toggleClass('active');
		$('.toggleContent').not($(this).parent().find($('.toggleContent'))).slideUp();
		$('.toggleTitle').not($(this)).removeClass('active');
	});
}
function appSlider() {
	var swiper = new Swiper('.appSlider .swiper-container', {
		pagination: {
			el: '.swiper-pagination',
			clickable: true,
			renderBullet: function (index, className) {
				return '<span class="' + className + '">' + '</span>';
			}
		}
	});

}
function subBannerSlider() {

	var swiper = new Swiper('.projectdetails.subBanner .swiper-container', {
		pagination: {
			el: '.swiper-pagination',
			clickable: true,
			renderBullet: function (index, className) {
				return '<span class="' + className + '">' + '</span>';
			}
		}
	});


}

function progressSliderCall() {
	var swiper = new Swiper('.progresslLider .swiper-container', {
		effect: 'slide',
		slidesPerView: 3,
		grabCursor: true,
		breakpoints: {
			100: {
				slidesPerView: 1,
			},
			768: {
				slidesPerView: 1,
			},
			1024: {
				slidesPerView: 3,
			},
		}
	});
}


function floorSliderCall() {
	var swiper = new Swiper('.floorSlider .swiper-container', {
		effect: 'slide',
		slidesPerView: 3,
		spaceBetween: 10,
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev'
		},
		breakpoints: {
			640: {
				slidesPerView: 1,
				spaceBetween: 10,
			},
			768: {
				slidesPerView: 1,
				spaceBetween: 10,
			},
			1024: {
				slidesPerView: 3,
				spaceBetween: 10,
			},
		}
	});
}