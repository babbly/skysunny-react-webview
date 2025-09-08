// src/web/CompletePayment.jsx
import { useMemo } from 'react';
import infoIcon from "../img/home/payment.png";
import '../styles/main.scss';

// 간단한 금액 포맷터
const toMoney = (v) => {
    const n = Number(String(v ?? '').replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? `${n.toLocaleString()}원` : (v ?? '-');
};

// YYYY-MM-DD HH:mm 포맷
const formatDateTime = (d = new Date()) => {
    const pad = (x) => String(x).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
};

// URL 쿼리 파싱 유틸
const getQuery = () => {
    if (typeof window === 'undefined') return {};
    const q = new URLSearchParams(window.location.search);
    return {
        storeName: q.get('storeName') || undefined,
        passType: q.get('passType') || undefined,
        desc: q.get('desc') || q.get('description') || undefined,
        amount: q.get('amount') || undefined,
        orderNumber: q.get('orderNumber') || undefined,
        date: q.get('date') || undefined,
    };
};

export default function CompletePayment() {
    // 1) URL 쿼리 → 2) window.SKYSUNNY → 3) 목업 값
    const ctx = useMemo(() => {
        const q = getQuery();
        const SK = (typeof window !== 'undefined' && window.SKYSUNNY) || {};

        const storeName =
            q.storeName ??
            SK.storeName ??
            '스카이써니 스터디카페';

        const passType =
            q.passType ??
            SK.passType ??
            'cash';

        const description =
            q.desc ??
            SK?.selectedTicket?.name ??
            '캐시 이용권 4만원';

        const amountRaw =
            q.amount ??
            SK?.selectedTicket?.price ??
            45000;

        // 금액 숫자화
        const amount =
            typeof amountRaw === 'number'
                ? amountRaw
                : Number(String(amountRaw).replace(/[^\d]/g, '')) || 0;

        const orderNumber =
            q.orderNumber ??
            (SK?.lastOrderNumber || SK?.order?.id) ??
            '20250908000014';

        const paidAt =
            q.date ??
            SK?.paidAt ??
            formatDateTime(new Date());

        return { storeName, passType, description, amount, orderNumber, paidAt };
    }, []);

    // RN 홈 탭으로 이동 (웹 폴백 포함)
    const goHome = () => {
        try {
            // 1) 권장: RN에서 주입한 헬퍼가 있으면 사용
            if (typeof window !== 'undefined' && typeof window.__askRN === 'function') {
                window.__askRN('GO_HOME', { tab: 'HomeTab' });
                return;
            }
            // 2) 일반 브리지 (ReactNativeWebView)로 직접 전송
            if (typeof window !== 'undefined' &&
                window.ReactNativeWebView &&
                typeof window.ReactNativeWebView.postMessage === 'function') {
                window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'GO_HOME', tab: 'HomeTab' }));
                return;
            }
            // 3) 웹에서 테스트할 때는 루트로 이동
            if (typeof window !== 'undefined') {
                window.location.replace(`${window.location.origin}/`);
            }
        } catch (e) {
            console.log('[CompletePayment] goHome error', e);
        }
    };

    // 버튼 동작(목업): 실제 RN 브릿지가 없으면 콘솔만
    const movePage = (screen) => {
        console.log(`[mock] movePage → ${screen}`, { ctx });
        // 필요하면 다른 화면도 비슷한 방식으로 브리지 호출 가능:
        // if (typeof window.__askRN === 'function') window.__askRN('GO_' + screen.toUpperCase(), {});
    };

    return (
        <div className="complete-container">
            {/* 이미지 */}
            <img src={infoIcon} alt="payment" className="payment-img" />

            {/* 결제 완료 안내 */}
            <div className="notice-box">
                <span className="notice-text font-bm">결제가 완료되었습니다.</span>
            </div>

            {/* 정보 카드 */}
            <div className="info-card">
                <div className="info-row"><span className="title">매장명</span><span className="text">{ctx.storeName}</span></div>
                <div className="info-row"><span className="title">이용권</span><span className="text">{ctx.passType}</span></div>
                <div className="info-row"><span className="title">상품정보</span><span className="text">{ctx.description}</span></div>
                <div className="info-row"><span className="title">이용금액</span><span className="text">{toMoney(ctx.amount)}</span></div>

                <div className="info-row"><span className="title">이용기간</span><span className="text">-</span></div>

                <div className="line"></div>

                <div className="info-row"><span className="title">이용정보</span><span className="text">-</span></div>
                <div className="info-row"><span className="title">1일 이용정보</span><span className="text">-</span></div>
                <div className="info-row"><span className="title">주문번호</span><span className="text">{ctx.orderNumber}</span></div>
                <div className="info-row"><span className="title">결제일시</span><span className="text">{ctx.paidAt}</span></div>
                <div className="info-row"><span className="title">결제금액</span><span className="text">{toMoney(ctx.amount)}</span></div>
            </div>

            {/* 입장하기 */}
            <div className="enter-btn-box">
                <button className="enter-btn" onClick={() => movePage("Qr")}>
                    입장하기
                </button>
            </div>

            {/* 닫기 → HomeTab 이동 */}
            <div className="bottom-bar">
                <button className="bottom-btn" onClick={goHome}>
                    닫기
                </button>
            </div>
        </div>
    );
}
