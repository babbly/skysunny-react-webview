// src/web/CheckPayment.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Banner from '../components/BannerSlider';
import backArrow from '../img/common/backarrow.png';
import close from '../img/common/circleClose.png';
import copy from '../img/common/copy.png';
import bannerImg from '../img/home/bannerexample.png';
import infoIcon from '../img/home/information.png';
import '../styles/main.scss';

export default function CheckPayment() {
    const navigate = useNavigate();
    const location = useLocation();

    const [paymentMethod, setPaymentMethod] = useState('card');
    const [selectedCoupon, setSelectedCoupon] = useState(location.state?.selectedCoupon || null);
    const [ticketInfo, setTicketInfo] = useState(null);

    const bannerImages2 = [bannerImg, bannerImg, bannerImg];

    const SK = useMemo(() => window?.SKYSUNNY || {}, []);
    const successUrl = useMemo(() => SK?.successUrl || 'skysunny://pay/success', [SK]);
    const failUrl = useMemo(() => SK?.failUrl || 'skysunny://pay/fail', [SK]);

    const movePage = (path) => navigate(path);

    useEffect(() => {
        const onInit = (e) => {
            console.log('[CheckPayment:web] skysunny:init detail =', e.detail);
            setTicketInfo(e.detail);
        };
        document.addEventListener('skysunny:init', onInit);
        if (window.SKYSUNNY) onInit({ detail: window.SKYSUNNY });

        // RN이 이전에 보관한 마지막 응답이 있다면 재주입
        if (window.__SK_LAST_REPLY__) {
            console.log('[CheckPayment:web] re-dispatch __SK_LAST_REPLY__');
            const ev = new CustomEvent('skysunny:reply', { detail: window.__SK_LAST_REPLY__ });
            document.dispatchEvent(ev);
        }

        return () => document.removeEventListener('skysunny:init', onInit);
    }, []);

    useEffect(() => {
        if ('selectedCoupon' in (location.state || {})) {
            setSelectedCoupon(location.state.selectedCoupon || null);
        }
    }, [location.state?.selectedCoupon]);

    const parseAmount = useCallback((v) => {
        if (v == null) return 0;
        if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
        const n = String(v).replace(/[^\d.-]/g, '');
        const num = Number(n);
        return Number.isFinite(num) ? num : 0;
    }, []);
    const price = useMemo(() => parseAmount(ticketInfo?.selectedTicket?.price), [ticketInfo, parseAmount]);
    const discount = useMemo(() => parseAmount(selectedCoupon?.amount), [selectedCoupon, parseAmount]);
    const totalAmount = useMemo(() => Math.max(price - discount, 0), [price, discount]);
    const finalAmount = useMemo(() => totalAmount.toLocaleString() + '원', [totalAmount]);

    const passKind = useMemo(() => String(ticketInfo?.passType || '').toLowerCase(), [ticketInfo?.passType]);
    const passTypeLabel = useMemo(() => {
        switch (passKind) {
            case 'cash': return '캐시정기권';
            case 'free': return '기간정기권 (자유석)';
            case 'fix': return '기간정기권 (고정석)';
            case '1day': return '1일 이용권';
            default: return ticketInfo?.passType || '-';
        }
    }, [passKind, ticketInfo?.passType]);

    const showSeatDiscount = passKind === 'cash';
    const showOneDayInfo = passKind === '1day';

    const needsTarget = (t) => t === 'fix' || t === 'locker';

    // ===== 이벤트 정규화 + 디버그 =====
    const normalize = (raw) => {
        const d = raw?.detail ?? raw ?? {};
        const action = d.action || d.type;
        const ok = !!d.ok;
        const orderNumber =
            d.orderNumber ??
            d?.data?.orderNumber ??
            d?.payload?.orderNumber ??
            d?.detail?.orderNumber ??
            null;
        const error =
            d.error ??
            d?.data?.error ??
            d?.payload?.error ??
            null;
        const data = d.data ?? d.payload ?? d.detail ?? d;
        return { action, ok, orderNumber, error, data, raw: d };
    };

    // RN 통해 임시주문 생성
    const requestDraftViaRN = () =>
        new Promise((resolve, reject) => {
            if (typeof window.__askRN !== 'function') {
                reject(new Error('RN bridge not found'));
                return;
            }

            const passId =
                SK?.selectedTicket?.passId ??
                ticketInfo?.selectedTicket?.passId ??
                SK?.selectedTicket?.id ??
                ticketInfo?.selectedTicket?.id ??
                null;

            const providedTarget =
                SK?.selectedTicket?.targetId ??
                ticketInfo?.selectedTicket?.targetId ??
                0;

            const targetId = needsTarget(passKind) ? Number(providedTarget || 0) : 0;

            if (!passId) { reject(new Error('상품 ID(passId)가 없습니다.')); return; }
            if (needsTarget(passKind) && !targetId) { reject(new Error('좌석/사물함 선택이 필요합니다.')); return; }

            let settled = false;
            const done = (fn) => (arg) => {
                if (settled) return;
                settled = true;
                document.removeEventListener('skysunny:reply', onCustomReply);
                window.removeEventListener('message', onWindowMessage);
                try { delete window.onSkysunnyReply; } catch (_) { }
                try { delete window.SKYSUNNY_REPLY; } catch (_) { }
                clearTimeout(timer);
                fn(arg);
            };
            const resolveOnce = done(resolve);
            const rejectOnce = done(reject);

            const onCustomReply = (e) => {
                const n = normalize(e);
                console.log('[CheckPayment:web] receive CustomEvent', n);
                if (n.action !== 'REQUEST_DRAFT') return;
                if (n.ok && n.orderNumber) resolveOnce(n.data || { orderNumber: n.orderNumber });
                else rejectOnce(new Error(n.error || '임시 주문 생성 실패'));
            };

            const onWindowMessage = (e) => {
                try {
                    const payload = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
                    if (payload?.source !== 'skysunny') return;
                    const n = normalize(payload);
                    console.log('[CheckPayment:web] receive window.message', n);
                    if (n.action !== 'REQUEST_DRAFT') return;
                    if (n.ok && n.orderNumber) resolveOnce(n.data || { orderNumber: n.orderNumber });
                    else rejectOnce(new Error(n.error || '임시 주문 생성 실패'));
                } catch (err) {
                    console.log('[CheckPayment:web] message parse error', err);
                }
            };

            document.addEventListener('skysunny:reply', onCustomReply);
            window.addEventListener('message', onWindowMessage);
            window.onSkysunnyReply = (p) => {
                const n = normalize(p);
                console.log('[CheckPayment:web] receive global callback', n);
                if (n.action !== 'REQUEST_DRAFT') return;
                if (n.ok && n.orderNumber) resolveOnce(n.data || { orderNumber: n.orderNumber });
                else rejectOnce(new Error(n.error || '임시 주문 생성 실패'));
            };
            window.SKYSUNNY_REPLY = window.onSkysunnyReply;

            const timer = setTimeout(() => { rejectOnce(new Error('임시 주문 응답 타임아웃')); }, 7000);

            console.log('[CheckPayment:web] REQUEST_DRAFT →', {
                passId, targetId, type: passKind || 'cash'
            });
            window.__askRN('REQUEST_DRAFT', { passId, targetId, type: passKind || 'cash' });
        });

    // 결제 버튼
    const onClickBuy = async () => {
        if (paymentMethod !== 'card') {
            movePage('/store-detail');
            return;
        }
        try {
            console.log('[CheckPayment:web] onClickBuy → requestDraftViaRN()');
            const draft = await requestDraftViaRN(); // { orderNumber, ... }
            console.log('[CheckPayment:web] draft resolved =', draft);

            // 결제 전 상태 저장
            sessionStorage.setItem('toss:draft', JSON.stringify(draft));
            sessionStorage.setItem('toss:successUrl', successUrl);
            sessionStorage.setItem('toss:failUrl', failUrl);

            // 기본: 라우터로 이동
            console.log('[CheckPayment:web] navigate(/toss-payment)');
            movePage('/toss-payment');

            // 폴백: 라우터가 없거나 경로 매칭 실패 시 강제 이동
            setTimeout(() => {
                const pathOk =
                    window.location.pathname.includes('toss') ||
                    window.location.href.includes('toss');
                if (!pathOk) {
                    console.log('[CheckPayment:web] fallback → location.href');
                    const q = `orderNumber=${encodeURIComponent(draft?.orderNumber || draft?.data?.orderNumber || '')}`;
                    window.location.href = `/toss-payment?${q}`;
                }
            }, 300);
        } catch (e) {
            console.error('[CheckPayment:web] draft error:', e);
            alert(e?.message || '주문 생성 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="container checkout-page">
            {/* 상단 바 */}
            <div className="top-bar">
                <div className="top-bar-left">
                    <button
                        onClick={() => {
                            if (window.ReactNativeWebView) {
                                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'GO_BACK' }));
                            } else {
                                window.history.back();
                            }
                        }}
                        style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
                    >
                        <img src={backArrow} alt="뒤로가기" className="icon24" />
                    </button>
                </div>
                <div className="top-bar-center">
                    <span className="top-txt font-noto">구매확인</span>
                </div>
            </div>

            {/* 본문 */}
            <div className="content-scroll">
                <div className="banner-container">
                    <Banner banners={bannerImages2} type="sub2" />
                </div>

                {/* 구매 정보 */}
                <div className="info-container">
                    <div className="section-title-box">
                        <span className="font-bm section-title">구매정보</span>
                    </div>

                    <div className="info-box">
                        <div className="info-row"><span className="info-title">매장명</span><span className="info-text">{ticketInfo?.storeName || '-'}</span></div>
                        <div className="info-row"><span className="info-title">이용권</span><span className="info-text">{passTypeLabel}</span></div>
                        <div className="info-row"><span className="info-title">상품정보</span><span className="info-text">{ticketInfo?.selectedTicket?.name || '-'}</span></div>
                        <div className="info-row"><span className="info-title">이용금액</span><span className="info-text">{ticketInfo?.selectedTicket?.price || '-'}</span></div>
                        {passKind === 'cash' && (
                            <div className="info-row"><span className="info-title">좌석당 할인율</span><span className="info-text">{ticketInfo?.selectedTicket?.subDescription || '-'}</span></div>
                        )}
                        <div className="info-row"><span className="info-title">이용기간</span><span className="info-text">{ticketInfo?.selectedTicket?.reward || '-'}</span></div>
                        <div className="info-row"><span className="info-title">이용정보</span><span className="info-text">24.07.01 14:00~16:30</span></div>
                        {passKind === '1day' && (
                            <div className="info-row"><span className="info-title">1일 이용정보</span><span className="info-text">38,200캐시</span></div>
                        )}
                        <hr className="line" />
                        <div className="info-row">
                            <span className="info-title">할인쿠폰</span>
                            <button className="coupon-btn" onClick={() => movePage('/check-coupon')}>쿠폰선택</button>
                        </div>
                        <div className="info-row">
                            {selectedCoupon && (
                                <>
                                    <div className="info-text">{selectedCoupon.title}</div>
                                    <div className="info-img">
                                        <img src={close} alt="쿠폰삭제" className="icon24" style={{ cursor: 'pointer' }} onClick={() => setSelectedCoupon(null)} />
                                    </div>
                                </>
                            )}
                        </div>
                        <hr className="dashed-line" />
                        <div className="info-row">
                            <span className="info-title">할인금액</span>
                            {selectedCoupon && <span className="info-text">{selectedCoupon.amount}</span>}
                        </div>
                    </div>
                </div>

                {/* 결제수단 */}
                <div className="section2-title-box">
                    <span className="font-bm section-title">결제수단</span>
                </div>
                <div className="payment-methods">
                    <button className={`payment-btn ${paymentMethod === 'card' ? 'active' : ''}`} onClick={() => setPaymentMethod('card')}>
                        <span className="payment-text">신용/체크카드</span>
                    </button>
                    <button className={`payment-btn ${paymentMethod === 'bank' ? 'active' : ''}`} onClick={() => setPaymentMethod('bank')}>
                        <span className="payment-text">무통장입금</span>
                    </button>
                </div>

                {/* PC/대리인 결제 안내 */}
                <div className="section2-title-box3">
                    <p className="note-text font-bm">PC, 대리인 결제도 가능해요!</p>
                    <div className="copy-url-box">
                        <span className="font-noto url-text">http://skasca.me/cash</span>
                        <img src={copy} alt="info" className="icon14" />
                        <span className="copy-btn" onClick={() => navigator.clipboard.writeText('http://skasca.me/cash')}>URL 복사</span>
                    </div>
                    <div className="line"></div>
                    {paymentMethod !== 'card' && (
                        <p className="atm-text">
                            <b>‘ATM 기기’를 통한 무통장 입금은 지원되지 않아요.</b><br />
                            인터넷 뱅킹 또는 은행 창구를 통해 입금 부탁 드려요!<br /><br />
                            <b>해외송금을 통해 무통장 입금 시 결제가 실패됩니다.</b><br />
                            결제실패로 인한 환불 시 고객님께 해외송금 수수료가 청구될 수 있습니다.
                        </p>
                    )}
                </div>

                {/* 안내사항 */}
                <div className="section2-title-box">
                    <img src={infoIcon} alt="info" className="icon14" />
                    <div className="text-box">
                        <span className="font-bm section-title">안내사항</span>
                    </div>
                </div>
                <div className="section2-title-box2">
                    <p className="note-text font-noto">안내사항입니다.</p>
                </div>

                <div className="scroll-spacer" aria-hidden />
            </div>

            {/* 하단 고정 */}
            <div className="checkout-footer-fixed">
                <div className="bottom-bar2">
                    <span>결제금액</span>
                    <span>{finalAmount}</span>
                </div>
                <div className="bottom-button">
                    <button onClick={onClickBuy}>구매하기</button>
                </div>
            </div>
        </div>
    );
}
