// 센터 전용: 구성원 프로필 · 썸네일 · 업무사례 슬라이더
$(function() {
    'use strict';

    // 모바일 하위 메뉴: 슬라이드 열기·닫기와 키보드 상태를 함께 처리합니다.
    var $mobileNav = $('.center_mobile_nav');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function toggleMobileMenu($details, open, immediate) {
        $details.each(function() {
            var $menu = $(this);
            var $list = $menu.children('ul');
            var duration = immediate || reducedMotion.matches ? 0 : 250;

            // 연속 클릭 시 현재 높이에서 반대로 움직여 애니메이션이 쌓이지 않게 합니다.
            $list.stop(true, false).prop('inert', !open);
            $menu.children('summary').attr('aria-expanded', String(open));

            if (open) {
                if (!$menu.prop('open')) $list.hide();
                $menu.prop('open', true);
                $list.slideDown(duration);
            } else {
                $list.slideUp(duration, function() {
                    $menu.prop('open', false);
                    $list.css('display', '');
                });
            }
        });
    }

    $mobileNav.find('summary').attr('aria-expanded', 'false');
    $mobileNav.on('click', 'summary', function(event) {
        event.preventDefault();
        var $details = $(this).parent('details');
        var open = $(this).attr('aria-expanded') !== 'true';
        toggleMobileMenu($mobileNav.find('details[open]').not($details), false);
        toggleMobileMenu($details, open);
    });

    $(document).on('click.centerNav', function(event) {
        if (!$(event.target).closest('.center_mobile_nav details').length) {
            toggleMobileMenu($mobileNav.find('details[open]'), false);
        }
    }).on('keydown.centerNav', function(event) {
        if (event.key !== 'Escape') return;
        var $open = $mobileNav.find('details[open]');
        if ($open.length) {
            toggleMobileMenu($open, false);
            $open.children('summary').trigger('focus');
        }
    });
    window.matchMedia('(max-width: 900px)').addEventListener('change', function() {
        toggleMobileMenu($mobileNav.find('details'), false, true);
    });

    if (!window.Swiper) return;
    var $profile = $('.center_profile');
    var $thumbs = $profile.find('.center_member_thumbs');
    var memberElement = $profile.find('.center_member_slider')[0];
    var caseElement = $('.center_case_slider')[0];

    // 프로필 전환 시 보이지 않는 구성원의 링크는 키보드 탐색에서 제외합니다.
    function updateMembers(swiper) {
        $(swiper.slides).each(function(index) {
            var active = index === swiper.activeIndex;
            $(this).attr('aria-hidden', String(!active)).prop('inert', !active);
        });
        $thumbs.find('button').attr('aria-pressed', 'false')
            .filter('[data-member-index="' + swiper.realIndex + '"]').attr('aria-pressed', 'true');
    }

    var memberSwiper;
    if (memberElement && !memberElement.swiper) {
        var thumbSwiper = new Swiper($thumbs[0], {
            // 각 폭에서 썸네일이 반쪽으로 잘리지 않도록 표시 개수를 지정합니다.
            slidesPerView: 3,
            spaceBetween: 12,
            watchSlidesProgress: true,
            breakpoints: {
                480: { slidesPerView: 4 },
                768: { slidesPerView: 6, spaceBetween: 16 },
                1201: { slidesPerView: 5, spaceBetween: 16 },
                1701: { slidesPerView: 6, spaceBetween: 20 }
            }
        });

        memberSwiper = new Swiper(memberElement, {
            effect: 'fade',
            fadeEffect: { crossFade: true },
            speed: reducedMotion.matches ? 0 : 650,
            rewind: true,
            autoHeight: true,
            thumbs: { swiper: thumbSwiper, multipleActiveThumbs: false },
            navigation: {
                prevEl: $profile.find('.center_member_prev')[0],
                nextEl: $profile.find('.center_member_next')[0]
            },
            autoplay: 
            { 
                delay: 4000,
                isableOnInteraction: false, 
                pauseOnMouseEnter: true 
            },
            a11y: {
                prevSlideMessage: '이전 구성원',
                nextSlideMessage: '다음 구성원',
                slideLabelMessage: '{{index}} / {{slidesLength}}'
            },
            on: { init: updateMembers, slideChange: updateMembers }
        });

        // 클릭과 키보드 Enter/Space 모두 같은 프로필로 이동합니다.
        $thumbs.on('click', 'button', function() {
            memberSwiper.slideTo(Number($(this).attr('data-member-index')));
        });
    }

    // 업무사례: 화면 폭에 따라 1 · 2 · 3개 카드, 진행 막대 드래그 지원
    var caseSwiper;
    if (caseElement && !caseElement.swiper) {
        caseSwiper = new Swiper(caseElement, {
            slidesPerView: 1,
            spaceBetween: 20,
            speed: reducedMotion.matches ? 0 : 550,
            grabCursor: true,
            navigation: {
                prevEl: '.center_case_prev',
                nextEl: '.center_case_next'
            },
            scrollbar: { el: '.center_case_scrollbar', draggable: true },
            autoplay: 
            { 
                delay: 3000,
                isableOnInteraction: false, 
                pauseOnMouseEnter: true 
            },
            breakpoints: {
                768: { slidesPerView: 2 },
                1201: { slidesPerView: 3 }
            },
            a11y: {
                prevSlideMessage: '이전 업무사례',
                nextSlideMessage: '다음 업무사례',
                slideLabelMessage: '{{index}} / {{slidesLength}}'
            }
        });
    }

    // 시스템 모션 설정 변경도 새로고침 없이 반영합니다.
    reducedMotion.addEventListener('change', function() {
        if (memberSwiper) memberSwiper.params.speed = reducedMotion.matches ? 0 : 650;
        if (caseSwiper) caseSwiper.params.speed = reducedMotion.matches ? 0 : 550;
    });

    gsap.to('.center_hero img', {
        scrollTrigger: {
            trigger: '.center_hero',
            start: 'bottom bottom',
            end: 'bottom top',
            scrub: true,
        },
        y: '13%'
    });
});
