import $ from 'jquery';
import { styler, listen, pointer, value } from 'popmotion';

$.ajax({
    url: './progs/list'
}).done(function (pgs) {
    var bigCont$ = $('#pg_table');
    var headerCont$ = bigCont$.find('.headerContainer');
    var bodyCont$ = bigCont$.find('.bodyContainer');
    var cols = {};
    var colCount = 0;
    var odd = false;
    $.each(pgs, function (i, obj) {
        if(Object.keys(obj).length > colCount) {
            colCount = Object.keys(obj).length;
        }
        var categoryClass = (obj['category'] == 'tutorial') ? 'ttr' : 'bsl';
        $.each(obj, function(key, value) {
            if(key !== '__v') {
                if(!cols[key]) {
                    headerCont$.append('<div class="g-item">' + (key == '_id' ? '' : key) + '</div>');
                    cols[key] = key;
                }
                var cell$ = $('<div class="g-item ' + categoryClass + '">' + (key == '_id' ? '' : value) + '</div>');
                if(odd) {
                    cell$.addClass('odd');
                }
                bodyCont$.append(cell$);
                if(key == '_id') {
                    cell$.append(
                        '<button style="float:left;padding:1px 6px;" class="btn btn-outline-danger btn-sm deleteRow">✖</button>' +
                        '<button style="float:right;padding:1px 7px;" class="btn btn-outline-primary btn-sm updateRow">U</button>'
                    ).addClass('idCell').attr('data-id', value).data('object', obj);
                }
            }
        });
        odd = !odd;
    });
    bigCont$.find('.g-container').css('grid-template-columns', '80px repeat(' + (colCount - 3) + ', 1fr) 2.5fr');
});

$('#btn_add').click(function () {
    var dialog$ = $('.dialog').fadeIn(100).data('_id', null);
    dialog$.find('input[value="tutorial"]').click();
    dialog$.find('input[type="text"], textarea').val('');
    dialog$.find('button.insert').text('Insert');
});

$('.dialog button.insert').click(function() {
    $.ajax({
        url: './progs/update',
        method: 'POST',
        data: function () {
            var data = {};
            if($('.dialog').data('_id')) {
                data._id = $('.dialog').data('_id');
            }
            $('#pg_form').find('input, textarea').each(function () {
                if($(this).attr('type') == 'radio') {
                    if($(this).prop('checked')) {
                        data[$(this).attr('name')] = $(this).val();
                    }
                } else {
                    data[$(this).attr('id')] = $(this).val();
                }
            });
            return data;
        } ()
    }).done(function () {
        $('.dialog').fadeOut(100, function() {
            location.reload();
        });
    });
});

$('.dialog button.cancel').click(function() {
    $('.dialog').fadeOut(100);
});

$('#pg_table').on('click', 'button.deleteRow', function (e) {
    var _id = $(e.target).closest('.g-item').attr('data-id');
    if(confirm('Are you sure to delete record "' + _id + '"?')) {
        $.ajax({
            url: './progs/' + _id,
            method: 'DELETE'
        }).done(function () {
            location.reload();
        })
    }
});

$('#pg_table').on('click', 'button.updateRow', function (e) {
    var obj = $(e.target).closest('.g-item').data('object');
    var dialog$ = $('.dialog').fadeIn(100).data('_id', obj._id);
    dialog$.find('input[value="' + obj.category + '"]').click();
    dialog$.find('#pgId').val(obj.pgId);
    dialog$.find('#pgDesc').val(obj.pgDesc);
    dialog$.find('#pgValue').val(obj.pgValue);
    dialog$.find('button.insert').text('Update');
});

$('#pg_table .bodyContainer').on('dblclick', '.g-item', function (e) {
    var cell$ = $(this).hasClass('idCell') ? $(this) : $(this).prevAll('.idCell:first');
    cell$.find('button.updateRow').click();
});

const content = $('.dialog .content').get(0);
const divStyler = styler(content);
const contentXY = value({x:0, y:0}, (xy) => {
    divStyler.set(xy);
});
listen(content, 'mousedown touchstart').start(
    (e) => {
        if(!$(e.target).hasClass('btn') && !$(e.target).is('textarea,input')) {
            pointer(contentXY.get()).start(contentXY);
        }
    }
);
listen(document, 'mouseup touchend').start(
    () => {
        contentXY.stop();
    }
);