/* Shared UI and hardcoded publishing interactions. No form data is sent or persisted. */
$(function() {
    'use strict';
    // 스크롤 위치에 따라 공통 헤더 테마 전환
    var $header = $('.site_header');
    function updateHeader() {
        $header.toggleClass('scrolled', $(window).scrollTop() > 0);
        $('.back_top').toggleClass('scrolled', $(window).scrollTop() > 0);
    }
    $(window).on('scroll.header pageshow.header', updateHeader);
    updateHeader();

    // 입력 포커스: 외곽 검색 박스만 강조하고 포커스를 벗어나면 기본 선으로 복원합니다.
    var textFields = [
        'input:not([type])',
        'input[type="text"]',
        'input[type="search"]',
        'input[type="email"]',
        'input[type="tel"]',
        'input[type="url"]',
        'input[type="password"]',
        'input[type="number"]',
        'input[type="date"]',
        'input[type="datetime-local"]',
        'input[type="month"]',
        'input[type="week"]',
        'input[type="time"]',
        'textarea',
        'select'
    ].join(', ');

    function updateInputFocus(field, focused) {
        var $field = $(field);
        var $box = $field.closest('.search_box');
        ($box.length ? $box : $field).toggleClass('input_focus', focused);
    }

    $(document).on('focusin.inputBox focusout.inputBox', textFields, function(event) {
        updateInputFocus(this, event.type === 'focusin');
    });
    // 자동 포커스된 입력창도 초기 상태를 맞춥니다.
    if ($(document.activeElement).is(textFields)) {
        updateInputFocus(document.activeElement, true);
    }

    // 공통 안내 메시지
    var toastTimer;

    function toast(message) {
        clearTimeout(toastTimer);
        $('.toast_message').stop(true, true).text(message).fadeIn(150);
        toastTimer = setTimeout(function() {
            $('.toast_message').fadeOut(200);
        }, 4500);
    }
    // 공통 상담 로딩: 백엔드 연동 전에는 1초간 표시 후 미리보기 안내를 제공합니다.
    var consultationTimer;
    var $loadingForm = $();
    var $loadingButtons = $();

    function finishConsultationLoading() {
        clearTimeout(consultationTimer);
        $('.loader_bg').removeClass('active').attr('aria-hidden', 'true');
        $loadingForm.removeAttr('aria-busy');
        $loadingButtons.prop('disabled', false);
        $loadingForm = $();
        $loadingButtons = $();
    }

    function previewConsultation(form, message) {
        if ($('.loader_bg').hasClass('active')) return;
        $loadingForm = $(form).attr('aria-busy', 'true');
        $loadingButtons = $loadingForm.find(':submit:enabled').prop('disabled', true);
        $('.loader_bg').addClass('active').attr('aria-hidden', 'false');
        consultationTimer = setTimeout(function() {
            finishConsultationLoading();
            toast(message);
        }, 1000);
    }

    // 상담 공통 검증: 성함 → 연락처 입력 → 번호 자릿수 → 개인정보 동의 순서입니다.
    function validateConsultation(form) {
        var $form = $(form);
        var $name = $form.find('[name="name"]');
        var $phone = $form.find('[name="phone"]');
        var $consent = $form.find('[name="consent"]');
        var phone = $phone.val().replace(/[^0-9]/g, '');
        $form.find('[aria-invalid]').removeAttr('aria-invalid');

        function invalid($field, message) {
            $field.attr('aria-invalid', 'true').trigger('focus');
            toast(message);
            return false;
        }

        if (!$.trim($name.val())) {
            return invalid($name, '성함을 입력해 주세요.');
        }
        if (!phone) {
            return invalid($phone, '연락처를 입력해 주세요.');
        }

        // 010은 11자리, 서울 02는 9~10자리, 그 외 연락처는 10~11자리입니다.
        var validPhone = /^0[0-9]{9,10}$/.test(phone);
        if (phone.indexOf('010') === 0) validPhone = phone.length === 11;
        if (phone.indexOf('02') === 0) validPhone = phone.length === 9 || phone.length === 10;
        if (!validPhone) {
            return invalid($phone, '연락처 번호를 올바르게 입력해 주세요. (예: 010-1234-5678)');
        }
        if (!$consent.prop('checked')) {
            return invalid($consent, '개인정보 수집 및 이용에 동의해 주세요.');
        }
        return true;
    }

    // 연락처 자동 하이픈: 숫자만 남기고, 중간 수정 시 커서 위치를 유지합니다.
    function formatConsultationPhone(field) {
        var value = field.value;
        var cursor = field.selectionStart;
        var digitsBeforeCursor = value.slice(0, cursor).replace(/[^0-9]/g, '').length;
        var digits = value.replace(/[^0-9]/g, '');
        var prefixLength = digits.indexOf('02') === 0 ? 2 : 3;
        var middleLength = digits.indexOf('010') === 0 || digits.length > prefixLength + 7 ? 4 : 3;
        var parts = [digits.slice(0, prefixLength)];
        if (digits.length > prefixLength) parts.push(digits.slice(prefixLength, prefixLength + middleLength));
        if (digits.length > prefixLength + middleLength) parts.push(digits.slice(prefixLength + middleLength));
        field.value = parts.join('-');

        if (cursor === value.length) {
            field.setSelectionRange(field.value.length, field.value.length);
        } else {
            var nextCursor = 0;
            var count = 0;
            while (nextCursor < field.value.length && count < digitsBeforeCursor) {
                if (/[0-9]/.test(field.value[nextCursor])) count++;
                nextCursor++;
            }
            field.setSelectionRange(nextCursor, nextCursor);
        }
    }

    $('.consult_form, .menu_consult_form')
        .on('input', '[name="phone"]', function() {
            formatConsultationPhone(this);
        })
        .on('input change', 'input', function() {
            $(this).removeAttr('aria-invalid');
        });

    // 로딩 중 다른 페이지로 이동해도 뒤로가기 시 화면을 가리지 않도록 정리합니다.
    $(window).on('pagehide.consultationLoading', finishConsultationLoading);

    window.LkbUi = {
        toast: toast,
        validateConsultation: validateConsultation,
        previewConsultation: previewConsultation
    };

    // 공통 모달 열기 · 닫기와 포커스 복원
    var lastDialogTrigger = null;

    function openDialog(id, trigger) {
        var dialog = document.getElementById(id);
        if (!dialog || dialog.open) return;
        $('dialog[open]').each(function() {
            this.close();
        });
        lastDialogTrigger = trigger;
        if (id === 'filter_dialog') {
            $('#filter_dialog input').prop('checked', false);
            updateFilterSelection();
        }
        dialog.showModal();
        if (window.lenis) window.lenis.stop();
        $('body').addClass('overflow');
        $(trigger).attr('aria-expanded', 'true');
    }

    function restoreDialog() {
        if ($('dialog[open]').length) return;
        if ($menu.length && !$menu.prop('hidden')) {
            if (lastDialogTrigger) lastDialogTrigger.focus();
            return;
        }
        $('body').removeClass('overflow');
        if (window.lenis) window.lenis.start();
        if (lastDialogTrigger) {
            $(lastDialogTrigger).attr('aria-expanded', 'false');
            lastDialogTrigger.focus();
        }
    }
    $('[data-dialog]').attr('aria-haspopup', 'dialog').on('click', function() {
        openDialog($(this).data('dialog'), this);
    });
    $('dialog').on('close', restoreDialog).on('click', function(event) {
        if (event.target !== this) return;
        var rect = this.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) this.close();
    });
    $('.dialog_close').on('click', function() {
        $(this).closest('dialog')[0].close();
    });
    $('body').on('click', '[data-preview]', function() {
        toast($(this).attr('data-preview'));
    });
    // 공통 헤더의 전체 메뉴: 동일한 로고와 토글 버튼을 유지합니다.
    var $menu = $('#menu_dialog');
    var $menuToggle = $('.menu_toggle');
    var menuInertElements = [];

    // 전체 메뉴 진입 모션: 빠른 재조작 시 이전 애니메이션을 정리합니다.
    var menuMotion;
    var $menuMotionItems = $menu.find('.sitemap_grid > li, .menu_office, .menu_channels, .menu_consult_inner');

    function animateMenu(open) {
        if (!window.gsap) return;
        if (menuMotion) menuMotion.kill();
        gsap.set($menuMotionItems, { clearProps: 'opacity,transform' });
        if (!open || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        menuMotion = gsap.fromTo($menuMotionItems,
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.7, stagger: 0.01, ease: 'power2.out', clearProps: 'opacity,transform' }
        );
    }

    function setMenuOpen(open) {
        $menu.prop('hidden', !open);
        animateMenu(open);
        $('.site_header').toggleClass('menu_open', open).removeClass('nav_open');
        $menuToggle.attr('aria-expanded', String(open))
            .attr('aria-label', open ? '전체 메뉴 닫기' : '전체 메뉴 열기');
        setLanguageOpen(false, true);
        if (open) {
            // 메뉴 뒤의 본문만 비활성화하고, 공통 헤더는 계속 조작할 수 있게 둡니다.
            menuInertElements = $('main, .site_footer, .quick_menu, .skip_link').filter(function() {
                return !this.inert;
            }).toArray();
            $(menuInertElements).prop('inert', true);
            $('body').addClass('overflow');
            if (window.lenis) window.lenis.stop();
        } else {
            $(menuInertElements).prop('inert', false);
            menuInertElements = [];
            if (!$('dialog[open]').length) {
                $('body').removeClass('overflow');
                if (window.lenis) window.lenis.start();
            }
            $menuToggle.trigger('focus');
        }
    }
    $menuToggle.on('click', function() {
        setMenuOpen($menu.prop('hidden'));
    });
    $(document).on('keydown.menu', function(event) {
        if (!$menu.length || $menu.prop('hidden') || $('dialog[open]').length) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            setMenuOpen(false);
        }
        if (event.key === 'Tab') {
            var $focusable = $('.site_header, #menu_dialog')
                .find('a[href], button, input, [tabindex="0"]').filter(':visible:enabled');
            var first = $focusable[0];
            var last = $focusable[$focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });

    // 전체 메뉴 빠른 상담: 퍼블리싱 확인용으로 전송 없이 유효성만 확인합니다.
    $('.menu_consult_form').on('submit', function(event) {
        event.preventDefault();
        var $form = $(this);
        if ($form.attr('aria-busy') === 'true') return;
        if (!validateConsultation(this)) return;
        previewConsultation(this, '미리보기 화면입니다. 입력한 상담 정보는 전송하거나 저장하지 않습니다.');
    });

    // 헤더 내비게이션
    // 복원 직후 포인터가 이미 메뉴 안에 있어도 다음 움직임에서 다시 열립니다.
    $('.desktop_nav').on('mouseenter mousemove focusin', function() {
        $('.site_header').addClass('nav_open');
    });
    $('.site_header').on('mouseleave', function() {
        if (!$.contains(this, document.activeElement)) $(this).removeClass('nav_open');
    }).on('focusout', function() {
        var header = this;
        setTimeout(function() {
            if (!$.contains(header, document.activeElement)) $(header).removeClass('nav_open');
        }, 0);
    });
    // 뒤로/앞으로 가기: 브라우저가 저장한 펼침 상태와 이전 메뉴 링크의 포커스를 정리합니다.
    function resetHeaderNavigation() {
        var activeElement = document.activeElement;
        if ($(activeElement).closest('.desktop_nav').length) {
            activeElement.blur();
        }
        $header.removeClass('nav_open');
    }

    $(window).on('pagehide.headerNavigation', resetHeaderNavigation)
        .on('pageshow.headerNavigation', function(event) {
            var navigation = window.performance.getEntriesByType('navigation')[0];
            if (event.originalEvent.persisted || (navigation && navigation.type === 'back_forward')) {
                resetHeaderNavigation();
            }
        });

    // 언어 선택: 목록 슬라이드와 연속 클릭 시 애니메이션 정리
    var $languageList = $('#language_list');
    var $languageToggle = $('.language_toggle');

    function setLanguageOpen(open, immediate) {
        if (!immediate && ($languageToggle.attr('aria-expanded') === 'true') === open) return;
        $languageList.stop(true, true);
        $languageToggle.attr('aria-expanded', String(open));
        var duration = immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220;

        if (open) {
            $languageList.prop('hidden', false).hide().slideDown(duration);
        } else {
            $languageList.slideUp(duration, function() {
                $(this).prop('hidden', true).css('display', '');
            });
        }
    }

    $languageToggle.on('click', function() {
        setLanguageOpen($(this).attr('aria-expanded') !== 'true');
    });
    $(document).on('click', function(event) {
        if (!$(event.target).closest('.language_wrap').length) {
            setLanguageOpen(false);
        }
    }).on('keydown', function(event) {
        if (event.key === 'Escape') {
            if ($languageToggle.attr('aria-expanded') === 'true') {
                setLanguageOpen(false);
                $languageToggle.trigger('focus');
            }
            $('.site_header').removeClass('nav_open');
        }
    });
    // 페이지 이동과 Lenis 스크롤
    $('.back_top').on('click', function() {
        if (window.lenis) window.lenis.scrollTo(0, {
            immediate: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        });
        else window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    $('a[href^="#"]').not('.profile_nav a, .about_scroll').on('click', function(event) {
        var target = document.getElementById(this.getAttribute('href').slice(1));
        if (!target) return;
        event.preventDefault();
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (window.lenis) window.lenis.scrollTo(target, {
            offset: -80,
            immediate: reduced
        });
        else target.scrollIntoView({
            behavior: reduced ? 'auto' : 'smooth'
        });
        if (this.classList.contains('skip_link')) {
            $(target).attr('tabindex', '-1').trigger('focus');
        }
    });
    // 패밀리 사이트 검색
    $('.family_search').on('input', function() {
        var query = $(this).val().trim().toLowerCase();
        var count = 0;
        $('.family_list li').each(function() {
            var match = $(this).text().toLowerCase().indexOf(query) !== -1;
            $(this).prop('hidden', !match);
            if (match) count++;
        });
        $('.family_count').text(query ? '검색결과가 총 ' + count + '건 있습니다.' : '');
    });
    // 업무분야 팝업: 선택 표시만 제공하는 퍼블리싱 UI
    function updateFilterSelection() {
        var count = $('#filter_dialog input:checked').length;
        $('.filter_count span').text(count + '개');
        $('.filter_apply').text(count + '개 분야 적용하기');
    }

    $('#filter_dialog').on('change', 'input[type="checkbox"]', updateFilterSelection);
    $('.filter_clear, .filter_reset').on('click', function() {
        $('#filter_dialog input').prop('checked', false);
        updateFilterSelection();
    });
    $('.filter_apply').on('click', function() {
        $('#filter_dialog')[0].close();
    });

    // 정적 목록: 검색·분야 선택·페이지 이동에 따른 데이터 처리는 백엔드 연동 영역입니다.
    $('.static_list_page .list_search').on('submit', function(event) {
        event.preventDefault();
    });
    $('.static_list_page .pagination').on('click', 'a', function(event) {
        event.preventDefault();
    });

    // 상세 페이지 공통: 주소 공유
    $('.share_button').on('click', function() {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(location.origin + location.pathname)
                .then(function() {
                    toast('현재 페이지 주소를 복사했습니다.');
                })
                .catch(function() {
                    toast('주소 복사에 실패했습니다. 주소창의 URL을 복사해 주세요.');
                });
        } else toast('주소창의 URL을 복사해 공유해 주세요.');
    });


    $('.section').each(function() {
        const section = $(this);
        const item = $(this).find('.section_scroll');

        gsap.to(item, {
            scrollTrigger: {
                trigger: section,
                start: 'top 50%',
            },
            opacity: 1,
            y: 0,
            stagger: .04,
            duration: .6,

        });
    });
});
