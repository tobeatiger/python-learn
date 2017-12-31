import './floating-button';
import {initHome} from './home-page';
import {initPgList} from './pg-list-page';

function init () {
    initHome();
    initPgList();
}

function fireWhenReady() {
    if ($.floatingButton && window.io && window.ace) {
        init();
    } else {
        setTimeout(fireWhenReady, 100);
    }
}
$(document).ready(fireWhenReady);