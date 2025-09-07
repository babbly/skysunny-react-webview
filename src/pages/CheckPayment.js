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

    // RN이 주입한 정보
    const SK = useMemo(() => window?.SKYSUNNY || {}, []);
    const successUrl = useMemo(() => SK?.successUrl || 'skysunny://pay/success', [SK]);
    const failUrl = useMemo(() => SK?.failUrl || 'skysunny://pay/fail', [SK]);

    const movePage = (path) => navigate(path);

    useEffect(() => {
        const onInit = (e) => {
            console.log('[CheckPayment] RN에서 넘어온 데이터:', e.detail);
            setTicketInfo(e.detail);
        };
        document.addEventListener('skysunny:init', onInit);
        if (window.SKYSUNNY) onInit({ detail: window.SKYSUNNY });
        return () => document.removeEventListener('skysunny:init', onInit);
    }, []);

    useEffect(() => {
        if ('selectedCoupon' in (location.state || {})) {
            setSelectedCoupon(location.state.selectedCoupon || null);
        }
    }, [location.state?.selectedCoupon]);

    // 금액 계산
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

    // RN 통해 임시주문 생성
    const requestDraftViaRN = () =>
        new Promise((resolve, reject) => {
            if (typeof window.__askRN !== 'function') {
                reject(new Error('RN bridge not found'));
                return;
            }

            const passId =
                SK?.selectedTicket?.passId ?? ticketInfo?.selectedTicket?.passId;
            const targetId =
                SK?.selectedTicket?.targetId ?? ticketInfo?.selectedTicket?.targetId ?? 0;
            const type =
                (SK?.passType ?? ticketInfo?.passType ?? 'cash');

            if (!passId) {
                reject(new Error('상품 ID(passId)가 없습니다.'));
                return;
            }

            const once = (e) => {
                const { action, ok, data, error } = e.detail || {};
                if (action !== 'REQUEST_DRAFT') return;
                window.removeEventListener('skysunny:reply', once);
                if (ok && data?.orderNumber) resolve(data);
                else reject(new Error(error || '임시 주문 생성 실패'));
            };
            window.addEventListener('skysunny:reply', once, { once: true });

            console.log('[CheckPayment] REQUEST_DRAFT →', { passId, targetId, type });
            window.__askRN('REQUEST_DRAFT', { passId, targetId, type });
        });

    const onClickBuy = async () => {
        if (paymentMethod !== 'card') {
            movePage('/store-detail');
            return;
        }
        try {
            const draft = await requestDraftViaRN(); // { orderNumber, amount, orderName ... }
            sessionStorage.setItem('toss:draft', JSON.stringify(draft));
            sessionStorage.setItem('toss:successUrl', successUrl);
            sessionStorage.setItem('toss:failUrl', failUrl);
            movePage('/toss-payment');
        } catch (e) {
            console.error('[CheckPayment] draft error:', e);
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
                        <div className="info-row"><span className="info-title">이용권</span><span className="info-text">{ticketInfo?.passType || '-'}</span></div>
                        <div className="info-row"><span className="info-title">상품정보</span><span className="info-text">{ticketInfo?.selectedTicket?.name || '-'}</span></div>
                        <div className="info-row"><span className="info-title">이용금액</span><span className="info-text">{ticketInfo?.selectedTicket?.price || '-'}</span></div>
                        <div className="info-row"><span className="info-title">좌석당 할인율</span><span className="info-text">{ticketInfo?.selectedTicket?.subDescription || '-'}</span></div>
                        <div className="info-row"><span className="info-title">이용기간</span><span className="info-text">{ticketInfo?.selectedTicket?.reward || '-'}</span></div>
                        <div className="info-row"><span className="info-title">이용정보</span><span className="info-text">24.07.01 14:00~16:30</span></div>
                        <div className="info-row"><span className="info-title">1일 이용정보</span><span className="info-text">38,200캐시</span></div>

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
                                        <img
                                            src={close}
                                            alt="쿠폰삭제"
                                            className="icon24"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => setSelectedCoupon(null)}
                                        />
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
                    <button
                        className={`payment-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('card')}
                    >
                        <span className="payment-text">신용/체크카드</span>
                    </button>
                    <button
                        className={`payment-btn ${paymentMethod === 'bank' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('bank')}
                    >
                        <span className="payment-text">무통장입금</span>
                    </button>
                </div>

                {/* PC/대리인 결제 안내 */}
                <div className="section2-title-box3">
                    <p className="note-text font-bm">PC, 대리인 결제도 가능해요!</p>
                    <div className="copy-url-box">
                        <span className="font-noto url-text">http://skasca.me/cash</span>
                        <img src={copy} alt="info" className="icon14" />
                        <span className="copy-btn" onClick={() => navigator.clipboard.writeText('http://skasca.me/cash')}>
                            URL 복사
                        </span>
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
