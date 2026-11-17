// Consultation/Index 전용 인터랙션
$(function() {
    'use strict';

    // 공통 순차 검증을 통과한 뒤 상담 신청 로딩을 표시합니다.
    $('.consult_form').on('submit', function(event) {
        event.preventDefault();
        var form = this;
        if ($(form).attr('aria-busy') === 'true') return;
        if (!window.LkbUi.validateConsultation(form)) return;
        window.LkbUi.previewConsultation(form, '입력 확인이 완료되었습니다. 현재는 미리보기로 실제 상담 신청은 접수되지 않습니다. 전화로 문의해 주세요.');
    });

});
