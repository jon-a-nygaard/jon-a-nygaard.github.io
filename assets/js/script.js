// jQuery(document).ready(function() {
// 	setPageHeight();
// 	jQuery(window).on('resize', function() {
// 		setPageHeight();
// 	});

// 	// Add scrollanimation to button
// 	jQuery('a[href*=#]:not([href=#])').click(function() {
// 		if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
// 			var target = jQuery(this.hash);
// 			target = target.length ? target : jQuery('[name=' + this.hash.slice(1) +']');
// 			if (target.length) {
// 				jQuery('html,body').animate({
// 				scrollTop: target.offset().top
// 				}, 1000);
// 				return false;
// 			}
// 		}
// 	});
// });
// function setPageHeight() {
// 	height = jQuery(window).height();
// 	jQuery(".page").css("height", height);
// }