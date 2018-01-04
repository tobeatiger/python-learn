import $ from 'jquery';

function preFormat (code) {
    var rs = [];
    if(code) {
        code = code.split('\n');
        for(var i=0;i<code.length;i++) {
            var currLine = code[i];
            var nextLine = code[i+1];

            // 1. skip all empty lines if in indentation context
            if(nextLine === undefined      // end of program
                || !(
                    currLine.trim() === ''  // currLine is empty line
                    &&
                    (
                        nextLine.trim() === ''   // nextLine is empty line
                        || /^\s/.test(nextLine)  // nextLine is indented, in indentation context
                    )
                )
            ) {
                rs.push(currLine);
            }

            // 2. add empty line after end of indentation
            if(
                /^\s/.test(currLine)           // currLine is indented
                && currLine.trim() !== ''      // currLine is not empty spaces
                && (
                    nextLine === undefined                            // no nextLine (end of program)
                    || (!/^\s/.test(nextLine) && nextLine !== '')     // nextLine is NOT indented
                )
            ) {
                rs.push('');
            }
        }
    }
    return rs.join('\n');
}
export function initHome() {
    var socket = io({
        path: '/socket-py-learn'
    });
    var hist = [];
    var currHistIdx = -1;
    socket.emit('init', 'session init');
    socket.on('reply', function (msgs) {
        if (msgs) {
            msgs = msgs.split('\n');
            $.each(msgs, function (index, msg) {
                var li$ = $('<li></li>').html(msg);
                if (msg.trim() == '>>>' || index == (msgs.length - 1)) {
                    li$.append($('<input type="text"/>').focus().keypress(function (e) {
                        if (e.which == 13) {
                            socket.emit('command', $(this).val());
                            if ($(this).val().trim() !== hist[hist.length - 1]) {
                                hist.push($(this).val());
                            }
                            currHistIdx = hist.length;
                            $('#terminal').find('li input').each(function () {
                                $(this).after($('<span></span>').html(
                                    $(this).val()
                                        .replace(new RegExp(' ', 'g'), '&nbsp;')
                                        .replace(new RegExp('>', 'g'), '&gt;')
                                        .replace(new RegExp('<', 'g'), '&lt;')
                                )).remove();
                            });
                        }
                    }).keydown(function (e) {
                        switch (e.which) {
                            case 38:  // up
                                e.preventDefault();  // prevent (scroll/move caret)
                                if (currHistIdx > 0) {
                                    currHistIdx--;
                                }
                                if (hist[currHistIdx]) {
                                    $(this).val(hist[currHistIdx]);
                                }
                                break;
                            case 40:  // down
                                e.preventDefault();  // prevent (scroll/move caret)
                                if (currHistIdx < hist.length - 1) {
                                    currHistIdx++;
                                }
                                if (hist[currHistIdx]) {
                                    $(this).val(hist[currHistIdx]);
                                }
                                break;
                            default:
                                return;  // exit for other keys
                        }
                    }));
                }
                li$.appendTo($('#terminal'));
            });
            $('#terminal').find('li input').focus();
        } else {
            $('#terminal').append('<li>Goodbye!</li>');
        }
    });

    var t$ = $('#terminal');
    t$.on('click', function () {
        t$.find('li:last-child input').focus();
        setTimeout(function () {
            t$.animate({scrollTop: $('#terminal').get(0).scrollHeight}, 300);
        }, 200);
    });

    $('#btn_cls').on('click touchstart', function (e) {
        window._editor.setValue('', 1);
        e.preventDefault();
    });

    $('#btn_run').on('click touchstart', function (e) {
        // var pg = preFormat($('#txt_prg').val());
        // $('#txt_prg').val(pg);
        var pg = preFormat(window._editor.getValue());
        window._editor.setValue(pg, 1);
        if (pg && pg.trim().length > 0) {
            socket.emit('program', pg);
            if ($(window).width() <= 720) {
                setTimeout(function () {
                    $('body').toggleClass('showProgram');
                    $('#terminal').click();
                }, 50);
            }
        }
        e.preventDefault();
    });

    $('#floating_btn').on('click touchstart', function (e) {
        $('body').toggleClass('showProgram');
        e.preventDefault();
    });

    window._editor = ace.edit('txt_prg');
    window._editor.$blockScrolling = Infinity;
    window._editor.setTheme('ace/theme/monokai');
    window._editor.setDisplayIndentGuides(true);
    window._editor.setShowPrintMargin(false);
    window._editor.setSelectionStyle('text');
    window._editor.setFontSize(12);
    window._editor.renderer.setPadding(8);
    window._editor.session.setMode('ace/mode/python');
    window._editor.session.setUseWrapMode(true);
    var options = {scrollPastEnd: true, tabSize: 2, useSoftTabs: true};
    if ($(window).width() <= 720) {
        window._editor.renderer.setShowGutter(false);
        $('#btn_toggle_gutter').removeClass('on');
        window._editor.setShowFoldWidgets(false);
        window._editor.session.setFoldStyle('manual');
    } else {
        options.enableBasicAutocompletion = true;
        options.enableSnippets = true;
        options.enableLiveAutocompletion = true;
    }
    window._editor.setOptions(options);

    $('#btn_toggle_gutter').on('click touchstart', function (e) {
        $(this).toggleClass('on');
        window._editor.renderer.setShowGutter($(this).hasClass('on'));
        e.preventDefault();
    });

    $.ajax({
        url: './programs/welcome.py'
    }).done(function (pg) {
        // $('#txt_prg').val(pg);
        window._editor.setValue(pg, -1);
    });
}