(function ($) {

    var mouseEventTypes = {
        touchstart : "mousedown",
        touchmove : "mousemove",
        touchend : "mouseup"
    };

    for (originalType in mouseEventTypes) {
        document.addEventListener(originalType, function(originalEvent) {
            var event = document.createEvent("MouseEvents");
            var touch = originalEvent.changedTouches[0];
            event.initMouseEvent(mouseEventTypes[originalEvent.type], true, true,
                window, 0, touch.screenX, touch.screenY, touch.clientX,
                touch.clientY, touch.ctrlKey, touch.altKey, touch.shiftKey,
                touch.metaKey, 0, null);
            originalEvent.target.dispatchEvent(event);
        });
    }

}(jQuery));

(function ($) {

    $.floatingButton = function (params) {
        var _settings = $.extend(true, {
            target: $('body'),
            btnName: '',
            icon: 'icon-more',
            bottom: 140,
            allowDrag: true,
            top: $(window).height() - 140,
            alignBottom: false,
            onClick: function () {console.log('default click')},
            dragEnded: function () {}
        }, params ? params : {});

        var btn$ = _settings.target.find('.draggable-btn');

        if(_settings.alignBottom) {
            _settings.minBottom = _settings.minBottom || 90;
        } else {
            _settings.maxTop = _settings.maxTop || _settings.target.height() - 140;
        }

        var drag_start = function (event) {
            event.stopPropagation();
            var style = window.getComputedStyle(event.target, null);
            drag_start.data = (parseInt(style.getPropertyValue("left"),10) - event.clientX)
                + ',' + (parseInt(style.getPropertyValue("top"),10) - event.clientY)
                + ',' + (parseInt(style.getPropertyValue("bottom"),10) - (_settings.target[0].clientHeight - event.clientY));
            if(_settings.alignBottom) {
                drag_start._bottom = btn$[0].style.bottom;
            } else {
                drag_start._top = btn$[0].style.top;
            }
        };
        var drag_over = function(event) {
            if($(event.target).get(0) === btn$.get(0)) {
                event.preventDefault();
            }
            event.stopPropagation();
            if(!drag_start.data) {
                return false;
            }
            var offset = drag_start.data.split(',');
            //btn$[0].style.left = (event.clientX + parseInt(offset[0],10)) + 'px';
            if(_settings.alignBottom) {
                var targetBottom = _settings.target[0].clientHeight - event.clientY + parseInt(offset[2],10);
                btn$[0].style.bottom = (targetBottom < _settings.minBottom
                        ? _settings.minBottom
                        : (targetBottom > _settings.target[0].clientHeight - 80
                            ? _settings.target[0].clientHeight - 80
                            : targetBottom
                        )
                    ) + 'px';
            } else {
                var targetTop = event.clientY + parseInt(offset[1],10);
                btn$[0].style.top = (targetTop < 30 ? 30 : (targetTop > _settings.maxTop ? _settings.maxTop : targetTop)) + 'px';
            }
        };

        var drag_end = function(event) {
            event.stopPropagation();
            drag_start.data = undefined;
            if(_settings.alignBottom) {
                localStorage.setItem(_settings.btnName+'_bottom', btn$[0].style.bottom);
            } else {
                localStorage.setItem(_settings.btnName+'_top', btn$[0].style.top);
            }
            if(
                ((drag_start._top === btn$[0].style.top && !_settings.alignBottom) || (drag_start._bottom === btn$[0].style.bottom && _settings.alignBottom))
                    && $(event.target).hasClass('draggable-btn') && !drag_end._dragOrClickFired) {
                drag_end._dragOrClickFired = true;
                _settings.onClick.bind(btn$)();
            } else if (!drag_end._dragOrClickFired) {
                drag_end._dragOrClickFired = true;
                _settings.dragEnded.bind(btn$)(_settings.alignBottom ? btn$[0].style.bottom : btn$[0].style.top);
            }
            setTimeout(function () {
                drag_end._dragOrClickFired = false;
            }, 50);
        };

        if(!btn$.get(0)) {
            btn$ = $('<div class="draggable-btn icon" draggable="true"></div>').prependTo(_settings.target);
        }

        if(_settings.allowDrag) {

            btn$[0].addEventListener('mousedown', drag_start, false);
            _settings.target[0].addEventListener('mousemove', drag_over, false);
            _settings.target[0].addEventListener('mouseup', drag_end, false);
            //btn$[0].addEventListener('touchstart', drag_start, false);
            //_settings.target[0].addEventListener('touchmove', drag_over, false);
            //_settings.target[0].addEventListener('touchend', drag_end, false);

            if(_settings.alignBottom) {
                btn$.css('bottom', localStorage.getItem(_settings.btnName+'_bottom') || _settings.bottom+'px');
            } else {
                btn$.css('top', localStorage.getItem(_settings.btnName+'_top') || _settings.top+'px');
            }

        } else {

            btn$.off('click').on('click', function () {
                _settings.onClick.bind(btn$)();
            });

            if(_settings.alignBottom) {
                btn$.css('bottom', _settings.bottom+'px');
            } else {
                btn$.css('top', _settings.top+'px');
            }
        }

        btn$.addClass(_settings.icon).switchIcon = function (icon) {
            if(icon) {
                btn$.removeClass(_settings._currentIcon).removeClass(_settings.icon).addClass(icon);
                _settings._currentIcon = icon;
            } else {
                btn$.removeClass(_settings._currentIcon).addClass(_settings.icon);
            }
        };

        return btn$;
    };

}(jQuery));