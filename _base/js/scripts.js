 d3.csv("/paintings/gallery.csv", function(error, rows) {
  rows.forEach(function(d) {
  d.img = d.img;
  d.title = d.title;
  d.meta = d.meta;
    });

 function spitFirstGalleries(container){
 d3.select(container).selectAll(".gallery")
  .data(rows).enter().append("figure")
  .attr("class","feed-item")
  .attr("itemprop","associatedMedia")
  // .attr("itemscope")
  .attr("itemtype","http://schema.org/ImageObject")
  .html(function(d){ 
   $("body").append("<div>");
    return '<a href="/paintings/' + d.img + '" itemprop="contentUrl" data-size="600x400"><img src="/paintings/' + d.img + '" itemprop="thumbnail" alt="' + d.title + '" /></a><figcaption itemprop="caption description">' + d.title + '</figcaption>'
 });
}

if ($("#gallery").length) { spitFirstGalleries("#gallery"); }

 $(function(){
    $('#menu').slicknav({label: ''});
  });

  $('a.lightbox').featherlight({ targetAttr: 'href' });
  
  $(document).bind('DOMNodeInserted', function(event) {
  $('.tmblr-iframe').hide();
  $('[itemprop=contentUrl]').each(function(i, obj) {
     $(this).attr("data-size", "" + ($(this).find("img").width() * 1.8) + "x" + ($(this).find("img").height() * 1.8) + "");
     $(".pswp__img").css("height","");
  //  $(".pswp__zoom-wrap").css("transform","");
    $(".pswp__zoom-wrap").css("position","absolute");
    $(".pswp__zoom-wrap").css("top","25%");
  // $(".pswp__img").css("margin-top","10%").css("margin-bottom","10%");
  // $(".pswp__img, .pswp__zoom-wrap").css("width","100%");
  // $(".pswp__zoom-wrap").css("transform","");
    });
  });

  $( document ).ready(function() {
   $('[itemprop=contentUrl]').each(function(i, obj) {
     $(this).attr("data-size", "" + ($(this).find("img").width() * 1.8) + "x" + ($(this).find("img").height() * 1.8) + "");
     $(".pswp__img").css("height","");
    // $(".pswp__zoom-wrap").css("transform","");
     $(".pswp__zoom-wrap").css("position","absolute");
     $(".pswp__zoom-wrap").css("top","25%");
  // $(".pswp__img").css("margin-top","10%").css("margin-bottom","10%");
  // $(".pswp__img, .pswp__zoom-wrap").css("width","100%");
  // $(".pswp__zoom-wrap").css("transform","");
    });

// Galleria.loadTheme('_base/js/galleria/themes/classic/galleria.classic.min.js');
// Galleria.run('.galleria');

//SCROLL TO TOP
$('.scrollToTop').click(function(){
    $('html, body').animate({scrollTop : 0},800);
    return false;
  });

var initPhotoSwipeFromDOM = function(gallerySelector) {
    // parse slide data (url, title, size ...) from DOM elements 
    // (children of gallerySelector)
    var parseThumbnailElements = function(el) {
        var thumbElements = el.childNodes,
            numNodes = thumbElements.length,
            items = [],
            figureEl,
            linkEl,
            size,
            item;

        for(var i = 0; i < numNodes; i++) {

            figureEl = thumbElements[i]; // <figure> element

            // include only element nodes 
            if(figureEl.nodeType !== 1) {
                continue;
            }

            linkEl = figureEl.children[0]; // <a> element

            size = linkEl.getAttribute('data-size').split('x');

            // create slide object
            item = {
                src: linkEl.getAttribute('href'),
                w: parseInt(size[0], 10),
                h: parseInt(size[1], 10)
            };



            if(figureEl.children.length > 1) {
                // <figcaption> content
                item.title = figureEl.children[1].innerHTML; 
            }

            if(linkEl.children.length > 0) {
                // <img> thumbnail element, retrieving thumbnail url
                item.msrc = linkEl.children[0].getAttribute('src');
            } 

            item.el = figureEl; // save link to element for getThumbBoundsFn
            items.push(item);
        }

        return items;
    };

    // find nearest parent element
    var closest = function closest(el, fn) {
        return el && ( fn(el) ? el : closest(el.parentNode, fn) );
    };

    // triggers when user clicks on thumbnail
    var onThumbnailsClick = function(e) {
        e = e || window.event;
        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        var eTarget = e.target || e.srcElement;

        // find root element of slide
        var clickedListItem = closest(eTarget, function(el) {
            return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
        });

        if(!clickedListItem) {
            return;
        }

        // find index of clicked item by looping through all child nodes
        // alternatively, you may define index via data- attribute
        var clickedGallery = clickedListItem.parentNode,
            childNodes = clickedListItem.parentNode.childNodes,
            numChildNodes = childNodes.length,
            nodeIndex = 0,
            index;

        for (var i = 0; i < numChildNodes; i++) {
            if(childNodes[i].nodeType !== 1) { 
                continue; 
            }

            if(childNodes[i] === clickedListItem) {
                index = nodeIndex;
                break;
            }
            nodeIndex++;
        }



        if(index >= 0) {
            // open PhotoSwipe if valid index found
            openPhotoSwipe( index, clickedGallery );
        }
        return false;
    };

    // parse picture index and gallery index from URL (#&pid=1&gid=2)
    var photoswipeParseHash = function() {
        var hash = window.location.hash.substring(1),
        params = {};

        if(hash.length < 5) {
            return params;
        }

        var vars = hash.split('&');
        for (var i = 0; i < vars.length; i++) {
            if(!vars[i]) {
                continue;
            }
            var pair = vars[i].split('=');  
            if(pair.length < 2) {
                continue;
            }           
            params[pair[0]] = pair[1];
        }

        if(params.gid) {
            params.gid = parseInt(params.gid, 10);
        }

        return params;
    };

    var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
        var pswpElement = document.querySelectorAll('.pswp')[0],
            gallery,
            options,
            items;

        items = parseThumbnailElements(galleryElement);

        // define options (if needed)
        options = {

            // define gallery index (for URL)
            galleryUID: galleryElement.getAttribute('data-pswp-uid'),

            getThumbBoundsFn: function(index) {
                // See Options -> getThumbBoundsFn section of documentation for more info
                var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                    pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                    rect = thumbnail.getBoundingClientRect(); 

                return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
            }

        };

        // PhotoSwipe opened from URL
        if(fromURL) {
            if(options.galleryPIDs) {
                // parse real index when custom PIDs are used 
                // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
                for(var j = 0; j < items.length; j++) {
                    if(items[j].pid == index) {
                        options.index = j;
                        break;
                    }
                }
            } else {
                // in URL indexes start from 1
                options.index = parseInt(index, 10) - 1;
            }
        } else {
            options.index = parseInt(index, 10);
        }

        // exit if index not found
        if( isNaN(options.index) ) {
            return;
        }

        if(disableAnimation) {
            options.showAnimationDuration = 0;
        }

        // Pass data to PhotoSwipe and initialize it
        gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
        gallery.init();
    };

    // loop through all gallery elements and bind events
    var galleryElements = document.querySelectorAll( gallerySelector );

    for(var i = 0, l = galleryElements.length; i < l; i++) {
        galleryElements[i].setAttribute('data-pswp-uid', i+1);
        galleryElements[i].onclick = onThumbnailsClick;
    }

    // Parse URL and open gallery if it contains #&pid=3&gid=1
    var hashData = photoswipeParseHash();
    if(hashData.pid && hashData.gid) {
        openPhotoSwipe( hashData.pid ,  galleryElements[ hashData.gid - 1 ], true, true );
    }
};

// execute above function
initPhotoSwipeFromDOM('.my-gallery');

// var pswpElement = document.querySelectorAll('.pswp')[0];

// //PHOTOSWIPE OPTIONS
// var items = [
//     {
//         src: './az166-nb-marshalltown_editsmall.jpg',
//         w: 1200,
//         h: 900
//     },
//     {
//         src: './az166-nb-marshalltown_editsmall.jpg',
//         w: 1200,
//         h: 900
//     }
// ];

// // define options (if needed)
// var options = {
//     // optionName: 'option value'
//     // for example:
//     index: 0 // start at first slide
// };

// // Initializes and opens PhotoSwipe
// var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
// gallery.init();

// //GALLERY LOAD
// var slides = [
//     {

//         src: './az166-nb-marshalltown_editsmall.jpg', // path to image
//         w: 1024, // image width
//         h: 768, // image height

//         msrc: './az166-nb-marshalltown_editsmall.jpg', // small image placeholder,
//                         // main (large) image loads on top of it,
//                         // if you skip this parameter - grey rectangle will be displayed,
//                         // try to define this property only when small image was loaded before



//         title: 'Test1'  // used by Default PhotoSwipe UI
//                                 // if you skip it, there won't be any caption


//         // You may add more properties here and use them.
//         // For example, demo gallery uses "author" property, which is used in the caption.
//         // author: 'John Doe'

//     },{

//         src: './az167-nb-robbinsdale1.jpg', // path to image
//         w: 1024, // image width
//         h: 768, // image height

//         msrc: './az167-nb-robbinsdale1.jpg', // small image placeholder,
//                         // main (large) image loads on top of it,
//                         // if you skip this parameter - grey rectangle will be displayed,
//                         // try to define this property only when small image was loaded before



//         title: 'Test2'  // used by Default PhotoSwipe UI
//                                 // if you skip it, there won't be any caption


//         // You may add more properties here and use them.
//         // For example, demo gallery uses "author" property, which is used in the caption.
//         // author: 'John Doe'

//     },{

//         src: './20100920211639-redhookbrooklynroughpic.jpg', // path to image
//         w: 1024, // image width
//         h: 768, // image height

//         msrc: './20100920211639-redhookbrooklynroughpic.jpg', // small image placeholder,
//                         // main (large) image loads on top of it,
//                         // if you skip this parameter - grey rectangle will be displayed,
//                         // try to define this property only when small image was loaded before



//         title: 'Test3'  // used by Default PhotoSwipe UI
//                                 // if you skip it, there won't be any caption


//         // You may add more properties here and use them.
//         // For example, demo gallery uses "author" property, which is used in the caption.
//         // author: 'John Doe'

//     }];
});
});

  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-37746671-1', 'auto');
  ga('send', 'pageview');
