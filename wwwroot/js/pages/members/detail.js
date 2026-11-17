// Members/Detail 전용 인터랙션
$(function() {
    'use strict';

    var $body = $('body');
    var $header = $('.site_header');
    var $nav = $('.profile_nav');
    var $navLinks = $nav.find('a');
    var $sections = $('.profile_columns .article_body > section');
    var previousY = Math.max(0, window.scrollY);
    var directionY = previousY;
    var direction = 0;
    var headerHidden = false;
    var scrollFrame = 0;
    var anchorScrolling = false;
    var anchorTimer;

    // 내려갈 때 헤더 숨김, 올라갈 때 표시. 열린 메뉴와 키보드 포커스는 유지합니다.
    function setHeaderHidden(hidden) {
        headerHidden = hidden;
        $body.toggleClass('profile_header_hidden', hidden);
    }

    function syncHeaderHeight() {
        $body[0].style.setProperty('--profile-header-height', $header.outerHeight() + 'px');
    }

    function activateSection(id) {
        var $active = $navLinks.filter('[href="#' + id + '"]');
        if ($active.hasClass('active')) return;
        $navLinks.removeClass('active').removeAttr('aria-current');
        $active.addClass('active').attr('aria-current', 'location');

        // 모바일 목차는 현재 항목만 가로로 따라오며 본문 스크롤은 건드리지 않습니다.
        if ($active.length && $nav[0].scrollWidth > $nav[0].clientWidth) {
            var link = $active[0];
            $nav[0].scrollLeft = link.offsetLeft - ($nav[0].clientWidth - link.offsetWidth) / 2;
        }
    }

    function updateProfileScroll() {
        scrollFrame = 0;
        var currentY = Math.max(0, window.scrollY);
        var delta = currentY - previousY;
        var nextDirection = delta > 0 ? 1 : delta < 0 ? -1 : direction;
        if (nextDirection !== direction) {
            directionY = previousY;
            direction = nextDirection;
        }

        var headerBusy = $header.hasClass('menu_open') || $header.hasClass('nav_open') ||
            $header[0].contains(document.activeElement) || $('dialog[open]').length;
        if (currentY <= $header.outerHeight() || headerBusy) {
            setHeaderHidden(false);
        } else if (anchorScrolling) {
            setHeaderHidden(true);
        } else if (Math.abs(currentY - directionY) > 8) {
            setHeaderHidden(direction > 0);
        }
        previousY = currentY;

        if (!anchorScrolling) {
            var activationLine = Math.max(headerHidden ? 0 : $header.outerHeight(), $nav.outerHeight()) + 32;
            var currentId = $sections[0].id;
            $sections.each(function() {
                if (this.getBoundingClientRect().top <= activationLine) currentId = this.id;
            });
            activateSection(currentId);
        }
    }

    function queueScrollUpdate() {
        if (!scrollFrame) scrollFrame = requestAnimationFrame(updateProfileScroll);
    }

    $(window).on('scroll.profile pageshow.profile', queueScrollUpdate);
    $(window).on('resize.profile', function() {
        syncHeaderHeight();
        queueScrollUpdate();
    });
    $header.on('focusin.profile mouseenter.profile', function() {
        setHeaderHidden(false);
    });
    syncHeaderHeight();
    updateProfileScroll();

    // 목차 이동 중에는 헤더를 숨기고, 상단 목차 한 줄 높이만큼 여백을 둡니다.
    $navLinks.on('click', function(event) {
        var target = document.getElementById(this.hash.slice(1));
        if (!target) return;
        event.preventDefault();
        clearTimeout(anchorTimer);
        anchorScrolling = true;
        setHeaderHidden(false);
        activateSection(target.id);
        var offset = -($nav.outerHeight() + 24);
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function finishScroll() {
            clearTimeout(anchorTimer);
            anchorScrolling = false;
            directionY = previousY = Math.max(0, window.scrollY);
            direction = 0;
            queueScrollUpdate();
        }

        if (window.lenis) {
            window.lenis.scrollTo(target, {
                offset: offset,
                immediate: reduced,
                duration: 0.8,
                onComplete: finishScroll
            });
        } else {
            window.scrollTo({
                top: $(target).offset().top + offset,
                behavior: reduced ? 'auto' : 'smooth'
            });
        }
        anchorTimer = setTimeout(finishScroll, reduced ? 0 : 1200);
    });

    // 수동 스크롤이 시작되면 목차 이동 중 잠금을 해제합니다.
    $(window).on('wheel.profile touchstart.profile', function() {
        anchorScrolling = false;
        clearTimeout(anchorTimer);
    });

    // 프로필 경력 더보기
    $('.expand_button').on('click', function() {
        var expanded = $(this).attr('aria-expanded') === 'true';
        $(this).attr('aria-expanded', String(!expanded));
        $(this).find('.expand_label').text(expanded ? '더보기' : '접기');
        $(this).siblings('.expandable').find('.extra_item').prop('hidden', expanded);
        if (window.lenis) window.lenis.resize();
        queueScrollUpdate();
    });
});
