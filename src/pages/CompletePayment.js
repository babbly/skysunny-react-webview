// src/web/CompletePayment.jsx
import { useEffect, useMemo, useState } from 'react';
import infoIcon from "../img/home/payment.png";
import '../styles/main.scss';

export default function CompletePayment() {
    const [orderNumber, setOrderNumber] = useState(null);

    // RN에서 주입된 공통값
    const SK = useMemo(() => window?.SKYSUNNY || {}, []);
    const defaultStoreId = useMemo(() => SK?.storeId || 1, [SK]);

    // RN 완료 신호 수신 → 주문번호 저장
    useEffect(() => {
        const onReply = (e) => {
            const { action, ok, data } = e.detail || {};
            if (action === 'ORDER_COMPLETED' && ok && data?.orderNumber) {
                const no = String(data.orderNumber);
                setOrderNumber(no);
                try { sessionStorage.setItem('lastOrderNumber', no); } catch { }
            }
        };
        window.addEventListener('skysunny:reply', onReply);

        // 새로고침 대비
        if (!orderNumber) {
            try {
                const saved = sessionStorage.getItem('lastOrderNumber');
                if (saved) setOrderNumber(saved);
            } catch { }
        }

        return () => window.removeEventListener('skysunny:reply', onReply);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 표시값(검증/조회 없이 최소치만)
    const draft = useMemo(() => {
        try { return JSON.parse(sessionStorage.getItem('toss:draft') || 'null'); } catch { return null; }
    }, []);
    const amount = draft?.amount ?? SK?.selectedTicket?.price ?? SK?.selectedTicket?.amount ?? '-';
    const description = draft?.orderName ?? SK?.selectedTicket?.name ?? SK?.selectedTicket?.title ?? '-';
    const storeName = SK?.storeName ?? '-';
    const passType = SK?.passType ?? '-';

    const toMoney = (v) => {
        const n = Number(String(v ?? '').replace(/[^\d.-]/g, ''));
        return Number.isFinite(n) ? `${n.toLocaleString()}원` : (v ?? '-');
    };

    const movePage = (screen) => {
        const storeId = defaultStoreId;
        if (typeof window.__askRN === 'function') {
            if (screen === 'StoreDetail') {
                window.__askRN('GO_STORE_DETAIL', { storeId });
            } else {
                window.__askRN('GO_' + screen.toUpperCase(), { storeId });
            }
        } else {
            console.log('RN bridge missing:', screen);
        }
    };

    return (
        <div className="complete-container">
            {/* 이미지 */}
            <img src={infoIcon} alt="payment" className="payment-img" />

            {/* 결제 완료 안내 */}
            <div className="notice-box">
                <span className="notice-text font-bm">결제가 완료되었습니다.</span>
            </div>

            {/* 정보 카드 (최소 정보 표시) */}
            <div className="info-card">
                <div className="info-row"><span className="title">매장명</span><span className="text">{storeName}</span></div>
                <div className="info-row"><span className="title">이용권</span><span className="text">{passType}</span></div>
                <div className="info-row"><span className="title">상품정보</span><span className="text">{description}</span></div>
                <div className="info-row"><span className="title">이용금액</span><span className="text">{toMoney(amount)}</span></div>

                <div className="info-row"><span className="title">이용기간</span><span className="text">-</span></div>

                <div className="line"></div>

                <div className="info-row"><span className="title">이용정보</span><span className="text">-</span></div>
                <div className="info-row"><span className="title">1일 이용정보</span><span className="text">-</span></div>
                <div className="info-row"><span className="title">주문번호</span><span className="text">{orderNumber ?? '-'}</span></div>
                <div className="info-row"><span className="title">결제일시</span><span className="text">-</span></div>
                <div className="info-row"><span className="title">결제금액</span><span className="text">{toMoney(amount)}</span></div>
            </div>

            {/* 입장하기 */}
            <div className="enter-btn-box">
                <button className="enter-btn" onClick={() => movePage("Qr")}>
                    입장하기
                </button>
            </div>

            {/* 닫기 → 무조건 StoreDetail */}
            <div className="bottom-bar">
                <button className="bottom-btn" onClick={() => movePage("StoreDetail")}>
                    닫기
                </button>
            </div>
        </div>
    );
}
