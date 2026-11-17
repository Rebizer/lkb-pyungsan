// About/Contact 전용 인터랙션
$(function() {
    'use strict';

    var isJeonggokMapRendered = false;

    // 사무소 탭 표시
    function selectOffice(id) {
        var isJeonggok = id === 'office_tab_jeonggok';
        // 마우스·키보드 탭 이동
        $('.office_tabs [role=tab]').each(function() {
                var active = this.id === id;
                $(this).attr({
                    'aria-selected': String(active),
                    tabindex: active ? '0' : '-1'
                }).toggleClass('active', active);
                $('#' + $(this).attr('aria-controls')).prop('hidden', !active);
            });
        if (isJeonggok && !isJeonggokMapRendered) {
            new daum.roughmap.Lander({
                timestamp: '1794187564423',
                key: '4pigi3xav6r',
                mapWidth: '1900',
                mapHeight: '450'
            }).render();

            isJeonggokMapRendered = true;
        }
    }
    $('.office_tabs [role=tab]').on('click', function() {
            selectOffice(this.id);
        })
        .on('keydown', function(event) {
            if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].indexOf(event.key) === -1) return;
            event.preventDefault();
            var id = this.id === 'office_tab_woongjin' ? 'office_tab_jeonggok' : 'office_tab_woongjin';
            if (event.key === 'Home') id = 'office_tab_woongjin';
            if (event.key === 'End') id = 'office_tab_jeonggok';
            selectOffice(id);
            $('#' + id).trigger('focus');
        });
    if (new URLSearchParams(location.search).get('office') === 'jeonggok') selectOffice('office_tab_jeonggok');

});
