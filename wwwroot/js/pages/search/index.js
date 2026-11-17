// 통합검색: 고정 예시 콘텐츠 · 분류 탭 · 카드 한 줄 / 법인소식 3개씩 더보기
$(function() {
    'use strict';

    var $page = $('.search_page');
    var $tabs = $page.find('[data-search-section]');
    var $groups = $page.find('.search_group');

    // 검색은 백엔드 연동 영역이므로 입력값으로 결과를 변경하지 않습니다.
    $page.find('.list_search').on('submit', function(event) {
        event.preventDefault();
    });

    // 지정한 묶음 개수가 있으면 우선 사용하고, 카드 목록은 실제 열 수만큼 표시합니다.
    function renderRows($group) {
        if ($group.prop('hidden') || !$group.find('.search_more').length) return;
        var $list = $group.find('.search_results');
        var $items = $list.children('li');
        var columns = window.getComputedStyle($list[0]).gridTemplateColumns;
        var perRow = columns === 'none' ? 1 : columns.split(' ').length;
        var pageSize = Number($group.attr('data-page-size')) || perRow;
        var visibleCount = Math.min($group.data('visibleRows') * pageSize, $items.length);

        $items.each(function(index) {
            $(this).prop('hidden', index >= visibleCount);
        });
        $group.find('.search_more').prop('hidden', visibleCount >= $items.length);
        $group.data('visibleCount', visibleCount);
    }

    $groups.each(function() {
        var $group = $(this);
        $group.data('visibleRows', 1);
        renderRows($group);
    });

    // 하드코딩 미리보기: 로딩 표시 후 다음 묶음을 추가합니다. 실제 요청은 보내지 않습니다.
    $page.on('click', '.search_more', function() {
        var button = this;
        var $button = $(button);
        if ($button.prop('disabled')) return;

        var $group = $button.closest('.search_group');
        var label = $button.attr('aria-label');
        $button.addClass('loading').prop('disabled', true)
            .attr({ 'aria-busy': 'true', 'aria-label': '항목 표시 중' });
        $group.find('.search_more_status').text('항목을 표시하고 있습니다.');

        setTimeout(function() {
            var previousCount = $group.data('visibleCount');
            $group.data('visibleRows', $group.data('visibleRows') + 1);
            renderRows($group);
            $button.removeClass('loading').prop('disabled', false)
                .attr({ 'aria-busy': 'false', 'aria-label': label });
            var addedCount = $group.data('visibleCount') - previousCount;
            $group.find('.search_more_status').text(addedCount + '개 항목을 추가로 표시했습니다.');

            // 마지막 줄에서 사라지는 버튼에 포커스가 남지 않도록 합니다.
            if (button.hidden && !$group.prop('hidden') && document.activeElement === button) {
                var firstNewLink = $group.find('.search_results > li').eq(previousCount).find('a, button')[0];
                if (firstNewLink) firstNewLink.focus({ preventScroll: true });
            }
            if (window.lenis) window.lenis.resize();
        }, 600);
    });

    // 분류 탭을 바꿔도 섹션별로 펼친 줄 수는 유지합니다.
    $tabs.on('click', function() {
        var section = $(this).attr('data-search-section');
        $tabs.removeClass('active').attr('aria-pressed', 'false');
        $(this).addClass('active').attr('aria-pressed', 'true');
        $groups.each(function() {
            var $group = $(this);
            $group.prop('hidden', section !== 'all' && this.id !== section);
            renderRows($group);
        });
        if (window.lenis) window.lenis.resize();
    });

    // 가로 폭이 바뀔 때 기존 펼침 상태를 새 열 수에 맞춥니다.
    var resizeFrame;
    $(window).on('resize.searchRows', function() {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(function() {
            $groups.each(function() { renderRows($(this)); });
            if (window.lenis) window.lenis.resize();
        });
    });
});
