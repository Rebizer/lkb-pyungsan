// Home/Index 전용 인터랙션
$(function() {
    'use strict';

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function updateSlideAccessibility(swiper) {
        $(swiper.slides).each(function(index) {
            var active = index === swiper.activeIndex;

            $(this).prop('inert', !active)
                .attr('aria-hidden', String(!active));
        });
    }

    function slideEvents($counter, singleSlide) {
        function updateCurrent(swiper) {
            $counter.find('.swiper-pagination-current').text(swiper.realIndex + 1);

            if (singleSlide) updateSlideAccessibility(swiper);
        }

        return {
            init: function() {
                var total = $(this.slides)
                    .not('.' + this.params.slideBlankClass)
                    .length;

                $counter.html(
                    '<span class="swiper-pagination-current"></span>' +
                    ' / ' +
                    '<span class="swiper-pagination-total"></span>'
                );

                $counter.find('.swiper-pagination-total').text(total);
                updateCurrent(this);
            },
            slideChange: function() {
                if (this.initialized) updateCurrent(this);
            }
        };
    }

    function bindAutoplay(swiper, $button, label) {
        var paused = reducedMotion.matches;
        var $slider = $(swiper.el);

        function syncPlayback() {
        var focused = $.contains(swiper.el, document.activeElement);
        if (paused || focused) swiper.autoplay.stop();
        else swiper.autoplay.start();
        $button.attr('aria-pressed', String(paused))
            .attr('aria-label', label + (paused ? ' 자동 재생 시작' : ' 자동 재생 정지'));
        }

        $button.on('click', function() {
            paused = !paused;
            syncPlayback();
        });
        $slider.on('focusin focusout', function() {
            setTimeout(syncPlayback, 0);
        });
        reducedMotion.addEventListener('change', function() {
            paused = reducedMotion.matches;
            swiper.params.speed = reducedMotion.matches ? 0 : 800;
            syncPlayback();
        });
        syncPlayback();
    }

    

    // 메인 공지 팝업: 오늘 하루 숨김은 이 브라우저의 다음 날 자정까지 유지합니다.
    var $homePopup = $('.home_popup');
    var popupStorageKey = 'lkb_home_popup_hidden_until';
    var popupSwiper;

    function isHomePopupHiddenToday() {
        try {
            var expiresAt = Number(localStorage.getItem(popupStorageKey));
            if (expiresAt > Date.now()) return true;
            localStorage.removeItem(popupStorageKey);
        } catch (error) {
            // 저장이 차단된 브라우저에서도 팝업 열기·닫기는 동작합니다.
        }
        return false;
    }

    function closeHomePopup() {
        var hadFocus = $homePopup[0].contains(document.activeElement);
        $homePopup.prop('hidden', true);
        if (popupSwiper) popupSwiper.autoplay.stop();
        if (hadFocus) {
            var focusTarget = document.querySelector('.hero_play');
            if (focusTarget) focusTarget.focus({ preventScroll: true });
        }
    }

    if ($homePopup.length) {
        if (!isHomePopupHiddenToday()) {
            $homePopup.prop('hidden', false);
            if (window.Swiper) {
                popupSwiper = new Swiper($homePopup.find('.home_popup_slider')[0], {
                    loop: true,
                    speed: reducedMotion.matches ? 0 : 500,
                    autoplay: {
                        enabled: !reducedMotion.matches,
                        delay: 5000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true
                    },
                    pagination: {
                        el: $homePopup.find('.home_popup_index')[0],
                        type: 'fraction'
                    },
                    a11y: { slideLabelMessage: '{{index}} / {{slidesLength}}' },
                    on: {
                        init: updateSlideAccessibility,
                        slideChange: updateSlideAccessibility
                    }
                });
            }
        }

        $homePopup.on('click', '.home_popup_close', closeHomePopup);
        $homePopup.on('click', '.home_popup_today', function() {
            var tomorrow = new Date();
            tomorrow.setHours(24, 0, 0, 0);
            try {
                localStorage.setItem(popupStorageKey, String(tomorrow.getTime()));
            } catch (error) {
                // 저장 불가 시 이번 방문에서만 닫습니다.
            }
            closeHomePopup();
        });
        $homePopup.on('keydown', function(event) {
            if (event.key === 'Escape') closeHomePopup();
        }).on('focusin', function() {
            if (popupSwiper) popupSwiper.autoplay.stop();
        }).on('focusout', function() {
            setTimeout(function() {
                if (popupSwiper && !$homePopup.prop('hidden') && !reducedMotion.matches &&
                    !$homePopup[0].contains(document.activeElement) && !$homePopup.is(':hover')) {
                    popupSwiper.autoplay.start();
                }
            }, 0);
        });
        $(window).on('storage.homePopup pageshow.homePopup', function() {
            if (isHomePopupHiddenToday()) closeHomePopup();
        });
        reducedMotion.addEventListener('change', function() {
            if (!popupSwiper) return;
            popupSwiper.params.speed = reducedMotion.matches ? 0 : 500;
            if (reducedMotion.matches || $homePopup.prop('hidden') ||
                $homePopup[0].contains(document.activeElement) || $homePopup.is(':hover')) {
                popupSwiper.autoplay.stop();
            } else {
                popupSwiper.autoplay.start();
            }
        });
    }

    // 히어로: 배경 이미지와 텍스트를 별도 Swiper로 구성합니다.
    var $hero = $('.home_hero');
    var heroImageElement = $hero.find('.hero_image_slider')[0];
    var heroTextElement = $hero.find('.hero_text_slider')[0];
    if (window.Swiper && heroImageElement && heroTextElement && !heroTextElement.swiper) {
        // 배경은 텍스트의 실제 슬라이드 번호를 따라갑니다. 자동 재생 타이머는 텍스트에만 둡니다.
        var heroImageSwiper = new Swiper(heroImageElement, {
            effect: 'fade',
            speed: reducedMotion.matches ? 0 : 900,
            allowTouchMove: false,
            a11y: { enabled: false }
        });

        var heroEvents = slideEvents($hero.find('.hero_index'), true);
        heroEvents.realIndexChange = function() {
            heroImageSwiper.slideTo(this.realIndex, this.params.speed);
        };

        // 텍스트가 버튼 · 드래그 · 자동 재생과 현재 번호를 제어합니다.
        var heroTextSwiper = new Swiper(heroTextElement, {
            loop: true,
            effect: 'fade',
            fadeEffect: { crossFade: true },
            speed: reducedMotion.matches ? 0 : 900,
            autoplay: {
                delay: 6000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            },
            navigation: {
                prevEl: $hero.find('.hero_prev')[0],
                nextEl: $hero.find('.hero_next')[0]
            },
            a11y: {
                prevSlideMessage: '이전 배너',
                nextSlideMessage: '다음 배너',
                slideLabelMessage: '{{index}} / {{slidesLength}}'
            },
            on: heroEvents
        });
        bindAutoplay(heroTextSwiper, $hero.find('.hero_play'), '배너');
        reducedMotion.addEventListener('change', function() {
            heroImageSwiper.params.speed = heroTextSwiper.params.speed = reducedMotion.matches ? 0 : 900;
        });
    }

    // 히어로 법인소식: 배너와 독립적인 세로 슬라이드
    var newsElement = $hero.find('.hero_news_slider')[0];
    if (window.Swiper && newsElement && !newsElement.swiper) {
        var newsSwiper = new Swiper(newsElement, {
            direction: 'vertical',
            loop: true,
            speed: reducedMotion.matches ? 0 : 650,
            autoplay: 
            { 
                delay: 3000,
                isableOnInteraction: false, 
                pauseOnMouseEnter: true 
            },
            a11y: { 
                slideLabelMessage: '{{index}} / {{slidesLength}}' 
            }
        });
        bindAutoplay(newsSwiper, $hero.find('.hero_news_play'), '소식');
    }

     // 언론보도 슬라이더
    if ($('.press_slider').length && window.Swiper) {
        new Swiper('.press_slider', {
            slidesPerView: 1.1,
            spaceBetween: 20,
            loop: true,
            autoplay: { 
                delay: 4000, 
                disableOnInteraction: false, 
                pauseOnMouseEnter: true 
            },
            navigation: {
                prevEl: '.press_prev',
                nextEl: '.press_next'
            },
            breakpoints: {
                600: {
                    slidesPerView: 2,
                    spaceBetween: 24
                },
                900: {
                    slidesPerView: 3,
                    spaceBetween: 24
                },
                1201: {
                    slidesPerView: 4,
                    spaceBetween: 32
                }
            },
            a11y: {
                enabled: true,
                prevSlideMessage: '이전 언론보도',
                nextSlideMessage: '다음 언론보도'
            },
            on: slideEvents($('.press_index'), false)
        });
    }

    // 새로운 구성원: 좌우 이동 없이 페이드로 전환
    var $hires = $('.home_hires');
    var hireElement = $hires.find('.hire_slider')[0];
    if (window.Swiper && hireElement && !hireElement.swiper) {
        var hireSwiper = new Swiper(hireElement, {
            loop: true,
            effect: 'fade',
            fadeEffect: { crossFade: true },
            speed: reducedMotion.matches ? 0 : 900,
            spaceBetween: 0,
            autoHeight: true,
            autoplay: {
                enabled: !reducedMotion.matches,
                delay: 4000, 
                disableOnInteraction: false, 
                pauseOnMouseEnter: true 
            },
            navigation: { 
                prevEl: $hires.find('.hire_prev')[0], 
                nextEl: $hires.find('.hire_next')[0] 
            },
            a11y: { 
                prevSlideMessage: '이전 신규 구성원', 
                nextSlideMessage: '다음 신규 구성원', 
                slideLabelMessage: '{{index}} / {{slidesLength}}' 
            },
            on: slideEvents($hires.find('.hire_index'), true)
        });

        reducedMotion.addEventListener('change', function() {
            hireSwiper.params.speed = reducedMotion.matches ? 0 : 900;
            if (reducedMotion.matches) hireSwiper.autoplay.stop();
            else hireSwiper.autoplay.start();
        });
    }

    // 통계: 화면에 들어왔을 때 한 번만 0부터 최종 숫자까지 증가
    var $stats = $('.home_stats');
    if ($stats.length && !reducedMotion.matches && window.IntersectionObserver) {
        var countObserver = new IntersectionObserver(function(entries) {
            if (!entries[0].isIntersecting) return;
            countObserver.disconnect();
            $stats.find('.stat_number').each(function() {
                var $number = $(this);
                var target = Number($number.attr('data-count'));
                $number.text('0');
                $({ value: 0 }).animate({ value: target }, {
                    duration: 1800,
                    easing: 'swing',
                    step: function(value) { $number.text(Math.floor(value)); },
                    complete: function() { $number.text(target); }
                });
            });
        }, { threshold: 0.35 });
        countObserver.observe($stats[0]);
    }


    // 법인 소식 카테고리
    $('.home_news_tabs button').on('click', function() {
        let index = $(this).index();

        $('.home_news_tabs button').removeClass('active');
        $(this).addClass('active');
        
        const $lists = $('.home_news_list');
        $lists.prop('hidden', true);
        $lists.eq(index).prop('hidden', false);
    });


    // gsap
    gsap.to('.hero_image', {
        scrollTrigger: {
            trigger: '.home_hero',
            start: 'bottom bottom',
            end: 'bottom top',
            scrub: true,
        },
        y: '13%'
    });
    gsap.to('.home_about_video', {
        scrollTrigger: {
            trigger: '.home_about',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
        },
        y: '-10%'
    });
});
