// About/Index: 이미지 확장 후 소개 문구 등장
$(function() {
    'use strict';

    var $visual = $('.about_visual');
    var $scrollLink = $visual.find('.about_scroll');
    if (!$visual.length) return;

    // 모션을 사용할 수 없는 환경에서는 기본 소개 문구로 이동합니다.
    $scrollLink.on('click.aboutFallback', function(event) {
        event.preventDefault();
        var target = document.getElementById('about_statement');
        if (window.lenis) window.lenis.scrollTo(target, { offset: -80, immediate: true });
        else target.scrollIntoView();
    });
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    var media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', function() {
        var $image = $visual.find('.about_intro > img');
        var $statement = $visual.find('.about_statement');
        var $title = $statement.find('h2');
        var $description = $statement.find('p');
        var heading = document.querySelector('.page_heading');

        function imageWidth() {
            var style = getComputedStyle(heading);
            return heading.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        }

        $visual.addClass('motion');
        var timeline = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
                id: 'about_intro_motion',
                trigger: $visual[0],
                start: 'top top',
                end: function() { return '+=' + $visual[0].clientHeight * 1.4; },
                pin: true,
                scrub: 0.6,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onRefresh: function() {
                    if (window.lenis) window.lenis.resize();
                }
            }
        });

        // 1. 이미지 중심을 고정하고 상하좌우로 확장합니다.
        // 함수형 크기는 ScrollTrigger refresh마다 현재 컨테이너와 화면 높이로 재계산됩니다.
        timeline.fromTo($image,
            {
                width: imageWidth,
                height: function() {
                    return Math.min(parseFloat(getComputedStyle($visual[0]).getPropertyValue('--about-image-height')), $visual[0].clientHeight);
                }
            },
            {
                width: function() { return $visual[0].clientWidth; },
                height: function() { return $visual[0].clientHeight; },
                duration: 1
            }, 0
        );
        timeline.to($scrollLink, { autoAlpha: 0, duration: 0.2 }, 0);

        // 2. 배경을 어둡게 하고 제목 · 설명을 순서대로 표시
        timeline.fromTo($statement, { '--about-shade': 0 }, { '--about-shade': 1, duration: 0.4 }, 1);
        timeline.fromTo($title, { autoAlpha: 0, y: 40 },
            { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 1.05);
        timeline.fromTo($description, { autoAlpha: 0, y: 30 },
            { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 1.35);
        timeline.to({}, { duration: 0.35 });

        // 스크롤 안내 링크도 동일한 확장 구간의 마지막으로 이동합니다.
        $scrollLink.off('click.aboutFallback').on('click.aboutMotion', function(event) {
            event.preventDefault();
            var destination = timeline.scrollTrigger.end;
            if (window.lenis) window.lenis.scrollTo(destination, { duration: 1.2 });
            else window.scrollTo({ top: destination, behavior: 'smooth' });
        });

        return function() {
            $visual.removeClass('motion');
            $scrollLink.off('click.aboutMotion').on('click.aboutFallback', function(event) {
                event.preventDefault();
                document.getElementById('about_statement').scrollIntoView();
            });
            if (window.lenis) window.lenis.resize();
        };
    });

    // 웹폰트와 이미지 로드 이후 고정 구간 위치 재계산
    if (document.fonts) document.fonts.ready.then(function() { ScrollTrigger.refresh(); });
    $(window).on('load.aboutMotion', function() { ScrollTrigger.refresh(); });

});
