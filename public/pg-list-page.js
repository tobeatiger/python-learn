export function initPgList() {
    var pgList$ = $('body').find('.programList');
    var floatingBtn$ = $.floatingButton({
        target: $('#root'),
        btnName: 'miniController',
        alignBottom: true,
        onClick: function () {
            pgList$.find('.content').hide();
            pgList$.one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",
                function() {
                    if(pgList$.hasClass('show')) {
                        pgList$.find('.content').show();
                    }
                }
            );
            pgList$.toggleClass('show');
            if(pgList$.hasClass('show')) {
                pgList$.css('bottom', '0').css('right', '0');
            } else {
                pgList$.css('bottom', parseInt(floatingBtn$[0].style.bottom)+18).css('right', parseInt(floatingBtn$.css('right'))+15);
            }
            $(this).toggleClass('icon-more').toggleClass('icon-close');
        },
        dragEnded: function (bottom) {
            if(!pgList$.hasClass('show')) {
                $('body').find('.programList').css('bottom', parseInt(bottom)+18).css('right', parseInt(floatingBtn$.css('right'))+15);
            }
        }
    });
    pgList$.css('bottom', parseInt(floatingBtn$[0].style.bottom)+18).css('right', parseInt(floatingBtn$.css('right'))+15);

    pgList$.find('.nav-button').click(function () {
        $(this).parent().toggleClass('hidden');
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
    $('#preview_editor').click(function () {
        pgList$.find('.nav-button').parent().addClass('hidden');
    }).find('.ace_text-input').prop('disabled', true);
    pgList$.on('click', '.script-list > ul > li', function (e) {
        if(this === e.target) {
            // click on menu item
            $(e.target).toggleClass('expanded');
        } else {
            $('#pg-title').text('程序学习 - ' + $(e.target).text());
            $.ajax({
                url: './programs/' + $(e.target).data('pg')
            }).done(function (pg) {
                window._preview_editor.setValue(pg, -1);
                $('.script-list').addClass('hidden');
            });
        }
    });
    $('#btn_preview_select').click(function () {
        var pg = window._preview_editor.getValue().trim();
        if(pg) {
            window._editor.setValue(pg, 1);
            floatingBtn$.fireClick();
        }
    });
};