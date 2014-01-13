document.write(                                                                    
        "<link rel=\"stylesheet\" type=\"text/css\" href=\"http://idrop.ru/widget/skins/tango/skin.css\" />\n" +
        "<style type=\"text/css\">\n" +                                                
        ".jcarousel-skin-tango .jcarousel-container-horizontal {\n" +                  
        "    width: 85%;\n" +                                                          
        "}\n" +                                                                        
        ".jcarousel-skin-tango .jcarousel-clip-horizontal {\n" +                       
        "    width: 100%;\n" +                                                         
        "}\n" +                                                                        
        ".jcarousel-skin-tango .jcarousel-item {\n" +                                  
        "    width: 100px;\n" +                                                        
        "    height: 75px;\n" +                                                        
        "}\n" +                                                                        
        "#idrop_frame {\n" +                                                           
        "    display: none;\n" +                                                       
        "    visibility: hidden;\n" +                                                  
        "    height: 1px;\n" +                                                         
        "}\n" +                                                                        
        ".idrop_piclink {\n" +                                                         
        "    border: 0px;\n" +                                                         
        "}\n" +                                                                        
"</style>\n" +                                                                 
"<script type=\"text/javascript\" src=\"http://mixim.ru/js/jquery-1.8.3.min.js\"></script>\n" +
"<script type=\"text/javascript\" src=\"http://idrop.ru/widget/lib/jquery.jcarousel.min.js\"></script>\n" +
"<script>\n" +                                                                 

"document.write('<ul id=\"mixim-carousel\" class=\"jcarousel-skin-tango\"></ul>');\n" +
"var lis = '';"+                                                               
"jQuery.ajax({"+                                                               
"    url: 'http://mixim.ru/json/media/list/0/20/?authors=' + MIXIM_AUTHOR, \n"+
"    crossDomain:true,\n"+                                                     
"    dataType: \"jsonp\",\n"+                                                  
"    success: function (data) {"+                                              
"        if (data.success) {"+                                                 
"            jQuery.each(data.result, function (idx, el) {"+                   
"                //$('#mixim-carousel').append('<li><a href=\"' + el.original + '\" target=\"blank\"><img src=\"' + el.thumbnail + '\" class=\"idrop_piclink\"></a></li>')\n"+
"                lis += '<li><a href=\"' + el.original + '\" target=\"blank\"><img src=\"' + el.thumbnail + '\" class=\"idrop_piclink\"></a></li>'"+
"            })\n"+                                                            
"        jQuery('#mixim-carousel').html(lis);\n"+                              
"        jQuery('#mixim-carousel').jcarousel({easing: 'BounceEaseOut', animation: 1000});\n"+
"        }\n"+                                                                 
"    }\n"+                                                                     
"});"+                                                                         
"var idrop_onload = window.onload;\n" +                                        
"window.onload = function() {\n" +                                             
"jQuery.easing['BounceEaseOut'] = function(p, t, b, c, d) {\n" +               
"    if ((t/=d) < (1/2.75)) {\n" +                                             
"        return c*(7.5625*t*t) + b;\n" +                                       
"    } else if (t < (2/2.75)) {\n" +                                           
"        return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;\n" +                   
"    } else if (t < (2.5/2.75)) {\n" +                                         
"        return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;\n" +                
"    } else {\n" +                                                             
"        return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;\n" +             
"    }\n" +                                                                    
"};\n" +                                                                       
"    if (idrop_onload) idrop_onload();\n" +                                    
"    //var lis = jQuery.map(idrop_pics, idrop_toLI).join('');\n" +             
"    jQuery('#mixim-carousel').html(lis);\n" +
"    jQuery('#mixim-carousel').jcarousel({easing: 'BounceEaseOut', animation: 1000});\n" +
"};\n" +                                                                    
"</script>\n"                                                               
); 
