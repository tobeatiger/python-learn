import $ from 'jquery';
import { draggableButton } from './draggable-button';
import { spring, tween, styler, value } from 'popmotion';

const togglePGList = (pgList$, rel$, moveY) => {
    if(!togglePGList._styler) {
        togglePGList._styler = styler(pgList$.get(0));
        togglePGList.__cutFrameCounter = 0;
        togglePGList.__cutFrame = false;
        togglePGList._action = value({}, (v) => {
            togglePGList.__cutFrameCounter++;
            if(togglePGList.__cutFrame && togglePGList.__cutFrameCounter > 4 && togglePGList.__cutFrameCounter % 4 !== 0) {
                return;
            }
            togglePGList._styler.set({
                'bottom': v.bottom+'px', 'right': v.right+'px',
                'width': v.width+'px', 'height': v.height+'px'
            });
        });
    }
    let fullScreenSet = { bottom: 0, right: 0,
        width: $(window).width(), height: $(window).height() };
    let relW = parseInt(rel$.css('width'), 10), relH = parseInt(rel$.css('height'), 10);
    let minScreenSet = {
        bottom: parseInt(rel$.css('bottom'), 10) + relH/2 - moveY,
        right: parseInt(rel$.css('right'), 10) + relW/2,
        width: 0, height: 0
    };
    if(pgList$.hasClass('show')) {
        pgList$.find('.content').hide();
        togglePGList.__cutFrame = false;
        spring({
            stiffness: 1500, damping: 60, mass: 1,
            from: fullScreenSet, to: minScreenSet
        }).start(togglePGList._action);
    } else {
        if(Math.min($(window).width(), $(window).height()) > 400) {
            pgList$.find('.content').fadeIn(50);
            togglePGList.__cutFrame = false;
            tween({
                from: minScreenSet, to: fullScreenSet, duration: 50
            }).start(togglePGList._action);
        } else {
            setTimeout(() => {pgList$.find('.content').show();}, 150);
            togglePGList.__cutFrameCounter = 0;
            togglePGList.__cutFrame = true;
            spring({
                stiffness: 3000, damping: 50, mass: 1.2, // velocity: 100,
                from: minScreenSet, to: fullScreenSet
            }).start(togglePGList._action);
        }
    }
    pgList$.toggleClass('show');
    $(window).off('resize').on('resize', () => {
        if(pgList$.hasClass('show')) {
            togglePGList._styler.set({
                'width': $(window).width()+'px',
                'height': $(window).height()+'px'
            });
        }
    });
};

var pgList;
const retrievePGs = () => {
    $.ajax({
        url: './progs/list'
    }).done(function (pgs) {
        pgList = pgs;
        var tutorial_ul = $('#tutorial-list').empty();
        var basic_libs_ul = $('#basic-libs-list').empty();
        $.each(pgList, function(idx, pg) {
            if(pg.category == 'tutorial') {
                tutorial_ul.append($('<li>' + pg.pgDesc + '</li>').data('pg', pg));
            } else {
                basic_libs_ul.append($('<li>' + pg.pgDesc + '</li>').data('pg', pg));
            }
        });
        if(basic_libs_ul.find('li').length == 0) {
            basic_libs_ul.append($('<li>To be imported...</li>').data('pg', { pgValue: 'print "TODO..."' }));
        }
    });
};

export function initPgList() {
    var pgList$ = $('body').find('.programList');
    var moveY = 0;
    var floatingBtn$ = draggableButton({
        target: $('#root'),
        btnName: 'floating_controller',
        onClick: function () {
            if(!pgList) {
                pgList = true;
                retrievePGs();
            }
            togglePGList(pgList$, floatingBtn$, moveY);
            floatingBtn$.toggleClass('icon-more').toggleClass('icon-close');
        },
        dragging: function (y) {
            moveY = y;
        }
    });

    pgList$.find('.nav-button').on('click touchstart', function (e) {
        $(this).parent().toggleClass('hidden');
        e.preventDefault();
    });

    window._preview_editor = ace.edit('preview_editor');
    window._preview_editor.$blockScrolling = Infinity;
    window._preview_editor.setTheme('ace/theme/monokai');
    window._preview_editor.setReadOnly(true);
    window._preview_editor.setDisplayIndentGuides(true);
    window._preview_editor.setShowPrintMargin(false);
    window._preview_editor.setSelectionStyle('text');
    window._preview_editor.setFontSize(12);
    window._preview_editor.renderer.setPadding(8);
    window._preview_editor.session.setMode('ace/mode/python');
    window._preview_editor.session.setUseWrapMode(true);
    window._preview_editor.renderer.setShowGutter(false);
    window._preview_editor.setShowFoldWidgets(false);
    window._preview_editor.setOptions({ scrollPastEnd: true, tabSize: 2, useSoftTabs: true });
    $('#preview_editor').on('click touchstart', function (e) {
        pgList$.find('.nav-button').parent().addClass('hidden');
        e.preventDefault();
    }).find('.ace_text-input').prop('disabled', true);
    //pgList$.on('click touchstart', '.script-list > ul > li', function (e) {
    pgList$.on('touchstart', '.script-list > ul > li', function (e) {
        pgList$._startY = e.originalEvent.changedTouches[0].clientY;
    });
    pgList$.on('click touchend', '.script-list > ul > li', function (e) {

        if(e.type != 'click') {
            e.preventDefault();
            if(Math.abs(e.originalEvent.changedTouches[0].clientY - pgList$._startY) > 4) {
                return;
            }
        }

        //if(pgList$._skipClick) {
        //    pgList$._skipClick = false;
        //    return;
        //}
        //if(e.type != 'click') {
        //    pgList$._skipClick = true;
        //} else {
        //    if(pgList$._skipClick) {
        //        pgList$._skipClick = false;
        //        return;
        //    }
        //}

        if(this === e.target) {
            // click on menu item
            $(this).parent().find('> li').each(function () {
                if(this !== e.target) {
                    $(this).removeClass('expanded')
                }
            });
            $(e.target).toggleClass('expanded');
        } else {
            // click on program item
            $('#pg-title').text('程序学习 - ' + $(e.target).text());
            if($(e.target).data('pg')) {
                window._preview_editor.setValue($(e.target).data('pg').pgValue, -1);
                $('.script-list').addClass('hidden');
            } else {
                $.ajax({
                    url: $(e.target).data('url')
                }).done(function (pg) {
                    window._preview_editor.setValue(pg, -1);
                    $('.script-list').addClass('hidden');
                });
            }
        }
        // e.preventDefault();
    });
    $('#btn_preview_select').on('click touchstart', function (e) {
        var pg = window._preview_editor.getValue().trim();
        if(pg) {
            window._editor.setValue(pg, 1);
            floatingBtn$.fireClick();
        }
        e.preventDefault();
    });
}