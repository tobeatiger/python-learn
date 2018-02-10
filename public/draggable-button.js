import $ from 'jquery';
import { styler, listen, pointer, value } from 'popmotion';

export function draggableButton (params) {
    let _settings = $.extend(true, {
        target: $('body'),
        btnName: '',
        icon: 'icon-more',
        bottom: 90,
        onClick: function () {console.log('default click')},
        dragging: function () {}
    }, params ? params : {});

    let btn$ = _settings.target.find('.draggable-btn');
    if(!btn$.get(0)) {
        btn$ = $('<div class="draggable-btn icon"></div>').prependTo(_settings.target);
    }
    btn$.css('bottom', _settings.bottom+'px');

    // switchIcon API
    btn$.addClass(_settings.icon).switchIcon = (icon) => {
        if(icon) {
            btn$.removeClass(_settings._currentIcon).removeClass(_settings.icon).addClass(icon);
            _settings._currentIcon = icon;
        } else {
            btn$.removeClass(_settings._currentIcon).addClass(_settings.icon);
        }
    };

    _settings.minBottom = _settings.minBottom || _settings.bottom;

    const btn = btn$.get(0);
    const divStyler = styler(btn);
    const btnXY = value({x:0, y:0}, (xy) => {
        if(xy.y > 0) {
            xy.y = 0;
        }
        divStyler.set({y: xy.y});
        _settings.dragging.bind(btn$)(xy.y);
    });
    listen(btn, 'mousedown touchstart').start(
        (e) => {
            e.preventDefault();
            btn._startDragXY = btnXY.get();
            // disable drag and drop in iPad (there's bug)
            var is_iPad = navigator.userAgent.match(/iPad/i) != null;
            if(!is_iPad) {
                pointer(btnXY.get()).start(btnXY);
            }
        }
    );
    listen(document, 'mouseup touchend').start(
        () => {
            btnXY.stop();
        }
    );

    listen(btn, 'mouseup touchend').start(() => {
        let currentXY = btnXY.get();
        if(btn._startDragXY.x == currentXY.x && Math.abs(btn._startDragXY.y - currentXY.y) <= 4) {
            _settings.onClick.bind(btn$)();
        }
    });

    btn$.fireClick = function () {
        _settings.onClick.bind(btn$)();
    };

    return btn$;
}