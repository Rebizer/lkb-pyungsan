// 메인과 센터에서 공통으로 사용하는 법인소식 탭.
$(function() {
    $('.corporate_news').each(function() {
        var $news = $(this);
        var $tabs = $news.find('.home_news_tabs button');
        var $lists = $news.find('.home_news_list');
        function selectTab(index) {
            $tabs.removeClass('active').attr({ 'aria-selected': 'false', tabindex: '-1' });
            $tabs.eq(index).addClass('active').attr({ 'aria-selected': 'true', tabindex: '0' });
            $lists.prop('hidden', true).eq(index).prop('hidden', false);
        }
        $tabs.on('click', function() { selectTab($tabs.index(this)); });
        $tabs.on('keydown', function(event) {
            var index = $tabs.index(this);
            if (event.key === 'ArrowRight') index = (index + 1) % $tabs.length;
            else if (event.key === 'ArrowLeft') index = (index + $tabs.length - 1) % $tabs.length;
            else if (event.key === 'Home') index = 0;
            else if (event.key === 'End') index = $tabs.length - 1;
            else return;
            event.preventDefault();
            selectTab(index);
            $tabs.eq(index).trigger('focus');
        });
    });
});
