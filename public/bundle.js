!function(t){function e(n){if(o[n])return o[n].exports;var i=o[n]={i:n,l:!1,exports:{}};return t[n].call(i.exports,i,i.exports,e),i.l=!0,i.exports}var o={};e.m=t,e.c=o,e.d=function(t,o,n){e.o(t,o)||Object.defineProperty(t,o,{configurable:!1,enumerable:!0,get:n})},e.n=function(t){var o=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(o,"a",o),o},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=0)}([function(t,e,o){"use strict";function n(){$.floatingButton&&window.io&&window.ace?(Object(r.a)(),Object(s.a)()):setTimeout(n,100)}Object.defineProperty(e,"__esModule",{value:!0});var i=o(1),r=(o.n(i),o(2)),s=o(3);$(document).ready(n)},function(t,e){!function(t){var e={touchstart:"mousedown",touchmove:"mousemove",touchend:"mouseup"};for(originalType in e)document.addEventListener(originalType,function(t){var o=document.createEvent("MouseEvents"),n=t.changedTouches[0];o.initMouseEvent(e[t.type],!0,!0,window,0,n.screenX,n.screenY,n.clientX,n.clientY,n.ctrlKey,n.altKey,n.shiftKey,n.metaKey,0,null),t.target.dispatchEvent(o)})}(jQuery),function(t){t.floatingButton=function(e){var o=t.extend(!0,{target:t("body"),btnName:"",icon:"icon-more",bottom:140,allowDrag:!0,top:t(window).height()-140,alignBottom:!1,onClick:function(){console.log("default click")},dragEnded:function(){}},e||{}),n=o.target.find(".draggable-btn");o.alignBottom?o.minBottom=o.minBottom||90:o.maxTop=o.maxTop||o.target.height()-140;var i=function(t){t.stopPropagation();var e=window.getComputedStyle(t.target,null);i.data=parseInt(e.getPropertyValue("left"),10)-t.clientX+","+(parseInt(e.getPropertyValue("top"),10)-t.clientY)+","+(parseInt(e.getPropertyValue("bottom"),10)-(o.target[0].clientHeight-t.clientY)),o.alignBottom?i._bottom=n[0].style.bottom:i._top=n[0].style.top},r=function(e){if(t(e.target).get(0)===n.get(0)&&(e.preventDefault(),e.stopPropagation()),!i.data)return!1;var r=i.data.split(",");if(o.alignBottom){var s=o.target[0].clientHeight-e.clientY+parseInt(r[2],10);n[0].style.bottom=(s<o.minBottom?o.minBottom:s>o.target[0].clientHeight-80?o.target[0].clientHeight-80:s)+"px"}else{var a=e.clientY+parseInt(r[1],10);n[0].style.top=(a<30?30:a>o.maxTop?o.maxTop:a)+"px"}},s=function(e){t(e.target).get(0)===n.get(0)&&e.stopPropagation(),i.data=void 0,o.alignBottom?localStorage.setItem(o.btnName+"_bottom",n[0].style.bottom):localStorage.setItem(o.btnName+"_top",n[0].style.top),(i._top===n[0].style.top&&!o.alignBottom||i._bottom===n[0].style.bottom&&o.alignBottom)&&t(e.target).hasClass("draggable-btn")&&!s._dragOrClickFired?(s._dragOrClickFired=!0,o.onClick.bind(n)()):s._dragOrClickFired||(s._dragOrClickFired=!0,o.dragEnded.bind(n)(o.alignBottom?n[0].style.bottom:n[0].style.top)),setTimeout(function(){s._dragOrClickFired=!1},50)};return n.get(0)||(n=t('<div class="draggable-btn icon" draggable="true"></div>').prependTo(o.target)),o.allowDrag?(n[0].addEventListener("mousedown",i,!1),o.target[0].addEventListener("mousemove",r,!1),o.target[0].addEventListener("mouseup",s,!1),o.alignBottom?n.css("bottom",localStorage.getItem(o.btnName+"_bottom")||o.bottom+"px"):n.css("top",localStorage.getItem(o.btnName+"_top")||o.top+"px")):(n.off("click").on("click",function(){o.onClick.bind(n)()}),o.alignBottom?n.css("bottom",o.bottom+"px"):n.css("top",o.top+"px")),n.addClass(o.icon).switchIcon=function(t){t?(n.removeClass(o._currentIcon).removeClass(o.icon).addClass(t),o._currentIcon=t):n.removeClass(o._currentIcon).addClass(o.icon)},n.fireClick=function(){o.onClick.bind(n)()},n}}(jQuery)},function(t,e,o){"use strict";e.a=function(){var t=io({path:"/socket-py-learn"}),e=[],o=-1;t.emit("init","session init"),t.on("reply",function(n){n?(n=n.split("\n"),$.each(n,function(i,r){var s=$("<li></li>").html(r);">>>"!=r.trim()&&i!=n.length-1||s.append($('<input type="text"/>').focus().keypress(function(n){13==n.which&&(t.emit("command",$(this).val()),$(this).val().trim()!==e[e.length-1]&&e.push($(this).val()),o=e.length,$("#terminal").find("li input").each(function(){$(this).after($("<span></span>").html($(this).val().replace(new RegExp(" ","g"),"&nbsp;").replace(new RegExp(">","g"),"&gt;").replace(new RegExp("<","g"),"&lt;"))).remove()}))}).keydown(function(t){switch(t.which){case 38:t.preventDefault(),o>0&&o--,e[o]&&$(this).val(e[o]);break;case 40:t.preventDefault(),o<e.length-1&&o++,e[o]&&$(this).val(e[o]);break;default:return}})),s.appendTo($("#terminal"))}),$("#terminal").find("li input").focus()):$("#terminal").append("<li>Goodbye!</li>")});var n=$("#terminal");n.click(function(){n.find("li:last-child input").focus(),setTimeout(function(){n.animate({scrollTop:$("#terminal").get(0).scrollHeight},300)},200)}),$("#btn_cls").click(function(){window._editor.setValue("",1)}),$("#btn_run").click(function(){var e=function(t){var e=[];if(t){t=t.split("\n");for(var o=0;o<t.length;o++){var n=t[o],i=t[o+1];(void 0===i||""!==n.trim()||""!==i.trim()&&!/^\s/.test(i))&&e.push(n),/^\s/.test(n)&&""!==n.trim()&&(void 0===i||!/^\s/.test(i)&&""!==i)&&e.push("")}}return e.join("\n")}(window._editor.getValue());window._editor.setValue(e,1),e&&e.trim().length>0&&(t.emit("program",e),$(window).width()<=720&&setTimeout(function(){$("body").toggleClass("showProgram"),$("#terminal").click()},50))}),$("#floating_btn").click(function(){$("body").toggleClass("showProgram")}),window._editor=ace.edit("txt_prg"),window._editor.$blockScrolling=1/0,window._editor.setTheme("ace/theme/monokai"),window._editor.setDisplayIndentGuides(!0),window._editor.setShowPrintMargin(!1),window._editor.setSelectionStyle("text"),window._editor.setFontSize(12),window._editor.renderer.setPadding(8),window._editor.session.setMode("ace/mode/python"),window._editor.session.setUseWrapMode(!0);var i={scrollPastEnd:!0,tabSize:2,useSoftTabs:!0};$(window).width()<=720?(window._editor.renderer.setShowGutter(!1),$("#btn_toggle_gutter").removeClass("on"),window._editor.setShowFoldWidgets(!1),window._editor.session.setFoldStyle("manual")):(i.enableBasicAutocompletion=!0,i.enableSnippets=!0,i.enableLiveAutocompletion=!0),window._editor.setOptions(i),$("#btn_toggle_gutter").click(function(){$(this).toggleClass("on"),window._editor.renderer.setShowGutter($(this).hasClass("on"))}),$.ajax({url:"./programs/welcome.py"}).done(function(t){window._editor.setValue(t,-1)})}},function(t,e,o){"use strict";e.a=function(){var t=$("body").find(".programList"),e=$.floatingButton({target:$("#root"),btnName:"miniController",alignBottom:!0,onClick:function(){t.find(".content").hide(),t.one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",function(){t.hasClass("show")&&t.find(".content").show()}),setTimeout(function(){t.hasClass("show")&&t.find(".content").show()},200),t.toggleClass("show"),t.hasClass("show")?t.css("bottom","0").css("right","0"):t.css("bottom",parseInt(e[0].style.bottom)+18).css("right",parseInt(e.css("right"))+15),$(this).toggleClass("icon-more").toggleClass("icon-close")},dragEnded:function(o){t.hasClass("show")||$("body").find(".programList").css("bottom",parseInt(o)+18).css("right",parseInt(e.css("right"))+15)}});t.css("bottom",parseInt(e[0].style.bottom)+18).css("right",parseInt(e.css("right"))+15),t.find(".nav-button").click(function(){$(this).parent().toggleClass("hidden")}),window._preview_editor=ace.edit("preview_editor"),window._preview_editor.$blockScrolling=1/0,window._preview_editor.setTheme("ace/theme/monokai"),window._preview_editor.setReadOnly(!0),window._preview_editor.setDisplayIndentGuides(!0),window._preview_editor.setShowPrintMargin(!1),window._preview_editor.setSelectionStyle("text"),window._preview_editor.setFontSize(12),window._preview_editor.renderer.setPadding(8),window._preview_editor.session.setMode("ace/mode/python"),window._preview_editor.session.setUseWrapMode(!0),window._preview_editor.renderer.setShowGutter(!1),window._preview_editor.setShowFoldWidgets(!1),window._preview_editor.setOptions({scrollPastEnd:!0,tabSize:2,useSoftTabs:!0}),$("#preview_editor").click(function(){t.find(".nav-button").parent().addClass("hidden")}).find(".ace_text-input").prop("disabled",!0),t.on("click",".script-list > ul > li",function(t){this===t.target?$(t.target).toggleClass("expanded"):($("#pg-title").text("程序学习 - "+$(t.target).text()),$.ajax({url:"./programs/"+$(t.target).data("pg")}).done(function(t){window._preview_editor.setValue(t,-1),$(".script-list").addClass("hidden")}))}),$("#btn_preview_select").click(function(){var t=window._preview_editor.getValue().trim();t&&(window._editor.setValue(t,1),e.fireClick())})}}]);