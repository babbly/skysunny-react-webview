// src/web/CompletePayment.jsx
import { useEffect, useMemo, useState } from 'react';
import { httpGet, httpPost, httpUrl } from '../api/httpClient';
import infoIcon from "../img/home/payment.png";
import '../styles/main.scss';

// 금액 포맷
const toMoney = (v) => {
    const n = Number(String(v ?? '').replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? `${n.toLocaleString()}원` : (v ?? '-');
};

// passType별 표시명 매핑
const getPassTypeDisplayName = (passType) => {
    switch (passType) {
        case 'cash': return '캐시정기권';
        case 'free': return '기간정기권(자유석)';
        case 'fix': return '기간정기권(고정석)';
        case '1day': return '1일 이용권';
        case 'locker': return '사물함';
        case 'studyroom': return '스터디룸';
        default: return passType || '이용권';
    }
};

// passType별 표시할 필드들을 반환하는 함수
const getDisplayFields = (passType) => {
    const commonFields = [
        { key: 'storeName', label: '매장명' },
        { key: 'passType', label: '이용권' },
        { key: 'productInfo', label: '상품정보' },
        { key: 'paymentAmount', label: '이용금액', isMoney: true },
        { key: 'validDays', label: '이용기간' }
    ];

    const separator = { type: 'separator' };

    let additionalFields = [];

    switch (passType) {
        case 'cash':
            additionalFields = [
                { key: 'usageInfo', label: '이용정보' },
                { key: 'orderNumber', label: '주문번호' },
                { key: 'paidAt', label: '결제일시' },
                { key: 'paymentAmount', label: '결제금액', isMoney: true }
            ];
            break;
        case 'free':
            additionalFields = [
                { key: 'usageInfo', label: '이용정보' },
                { key: 'oneDayInfo', label: '1일 이용정보' },
                { key: 'orderNumber', label: '주문번호' },
                { key: 'paidAt', label: '결제일시' },
                { key: 'paymentAmount', label: '결제금액', isMoney: true }
            ];
            break;
        case 'fix':
        case '1day':
            additionalFields = [
                { key: 'usageInfo', label: '이용정보' },
                { key: 'orderNumber', label: '주문번호' },
                { key: 'paidAt', label: '결제일시' },
                { key: 'paymentAmount', label: '결제금액', isMoney: true }
            ];
            break;
        case 'locker':
        case 'studyroom':
            additionalFields = [
                { key: 'orderNumber', label: '주문번호' },
                { key: 'paidAt', label: '결제일시' },
                { key: 'paymentAmount', label: '결제금액', isMoney: true }
            ];
            break;
        default:
            // 기본값: 모든 필드 표시
            additionalFields = [
                { key: 'usageInfo', label: '이용정보' },
                { key: 'expireText', label: '만료까지' },
                { key: 'remainingInfo', label: '잔여정보' },
                { key: 'oneDayInfo', label: '1일 이용정보' },
                { key: 'orderNumber', label: '주문번호' },
                { key: 'paidAt', label: '결제일시' },
                { key: 'paymentAmount', label: '결제금액', isMoney: true }
            ];
    }

    return [...commonFields, separator, ...additionalFields];
};

// URL에서 orderNumber 추출
const getOrderNumberFromQuery = () => {
    if (typeof window === 'undefined') return null;
    const q = new URLSearchParams(window.location.search);

    // 토스 결제 성공 후 리다이렉트에서 오는 파라미터들을 확인
    // orderId (토스 표준), orderNumber (커스텀), paymentKey, amount 등
    const orderNumber = q.get('orderNumber') || q.get('orderId') || q.get('order_id') || q.get('paymentKey');

    console.log('[CompletePayment] URL parameters:', {
        orderNumber: q.get('orderNumber'),
        orderId: q.get('orderId'),
        order_id: q.get('order_id'),
        paymentKey: q.get('paymentKey'),
        amount: q.get('amount'),
        allParams: Object.fromEntries(q.entries())
    });

    return orderNumber;
};

export default function CompletePayment() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState('');

    // 1) orderNumber 결정 (URL 우선, 없으면 다양한 소스에서 시도)
    const orderNumber = useMemo(() => {
        console.log('[CompletePayment] orderNumber 추출 시작...');

        const fromQuery = getOrderNumberFromQuery();
        if (fromQuery) {
            console.log('[CompletePayment] ✅ orderNumber from query:', fromQuery);
            return fromQuery;
        }

        // sessionStorage에서 toss:draft 확인 (CheckPayment에서 저장)
        let fromSessionDraft = null;
        try {
            const draftStr = typeof window !== 'undefined' ? sessionStorage.getItem('toss:draft') : null;
            console.log('[CompletePayment] sessionStorage draft string:', draftStr);
            if (draftStr) {
                const draft = JSON.parse(draftStr);
                fromSessionDraft = draft?.orderNumber || draft?.data?.orderNumber || null;
                console.log('[CompletePayment] ✅ orderNumber from sessionStorage draft:', fromSessionDraft);
            }
        } catch (e) {
            console.warn('[CompletePayment] sessionStorage draft parse error:', e);
        }

        if (fromSessionDraft) return fromSessionDraft;

        const SK = (typeof window !== 'undefined' && window.SKYSUNNY) || {};
        const fromSK = SK?.orderNumber || SK?.lastOrderNumber || SK?.order?.id || null;

        console.log('[CompletePayment] window.SKYSUNNY:', SK);
        console.log('[CompletePayment] orderNumber from SKYSUNNY:', fromSK);

        // localStorage에 저장된 orderNumber가 있는지 확인
        const fromStorage = typeof window !== 'undefined' ? localStorage.getItem('lastOrderNumber') : null;
        console.log('[CompletePayment] orderNumber from localStorage:', fromStorage);

        const finalOrderNumber = fromSK || fromStorage || null;
        console.log('[CompletePayment] 🎯 최종 orderNumber:', finalOrderNumber);

        return finalOrderNumber;
    }, []);

    // 2) API 호출
    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!orderNumber) {
                const debugInfo = {
                    queryParams: typeof window !== 'undefined' ? Object.fromEntries(new URLSearchParams(window.location.search).entries()) : {},
                    sessionDraft: typeof window !== 'undefined' ? sessionStorage.getItem('toss:draft') : null,
                    skysunny: typeof window !== 'undefined' ? window.SKYSUNNY : null,
                    localStorage: typeof window !== 'undefined' ? localStorage.getItem('lastOrderNumber') : null
                };
                console.error('[CompletePayment] 주문번호를 찾을 수 없습니다. 디버그 정보:', debugInfo);
                setErrMsg(`주문번호가 없습니다.\n\nURL 파라미터: ${Object.keys(debugInfo.queryParams).length ? JSON.stringify(debugInfo.queryParams) : '없음'}\nSession draft: ${debugInfo.sessionDraft ? '있음' : '없음'}\nSKYSUNNY: ${debugInfo.skysunny ? '있음' : '없음'}`);
                setLoading(false);
                return;
            }
            // URL 구성: %s를 orderNumber로 치환 (try 블록 밖에서 정의)
            const url = httpUrl.completePay.replace('%s', encodeURIComponent(orderNumber));

            try {
                console.log('[CompletePayment] orderNumber:', orderNumber);
                console.log('[CompletePayment] httpUrl.completePay:', httpUrl.completePay);

                // sessionStorage에서 추가 데이터 가져오기
                let additionalData = {};
                try {
                    const draftStr = typeof window !== 'undefined' ? sessionStorage.getItem('toss:draft') : null;
                    if (draftStr) {
                        const draft = JSON.parse(draftStr);
                        additionalData = {
                            userId: draft.userId,
                            seatId: draft.seatId,
                            storeId: draft.storeId,
                            storeName: draft.storeName,
                            passType: draft.passType,
                            productName: draft.productName,
                            price: draft.price,
                            roomName: draft.roomName,
                            selectedDate: draft.selectedDate,
                            period: draft.period,
                            usageInfo: draft.usageInfo,
                            couponId: draft.couponId,
                            couponAmount: draft.couponAmount,
                            paymentMethod: draft.paymentMethod,
                            finalAmount: draft.finalAmount
                        };
                        console.log('[CompletePayment] sessionStorage에서 가져온 추가 데이터:', additionalData);
                    }
                } catch (e) {
                    console.warn('[CompletePayment] sessionStorage 데이터 파싱 오류:', e);
                }

                console.log('[CompletePayment] API URL:', httpUrl.completePay);
                console.log('[CompletePayment] orderNumber:', orderNumber);
                console.log('[CompletePayment] orderNumber 타입:', typeof orderNumber);
                console.log('[CompletePayment] orderNumber 길이:', orderNumber?.length);
                console.log('[CompletePayment] 최종 URL:', url);
                console.log('[CompletePayment] 전체 URL:', `https://skysunny-api.mayoube.co.kr${url}`);

                // 1) 먼저 GET 방식으로 결제 완료 정보 조회
                const res = await httpGet(url);
                console.log('[CompletePayment] GET API 응답:', res);

                if (!mounted) return;

                // 2) 추가 정보가 있으면 POST로 주문 정보 업데이트
                if (Object.keys(additionalData).some(key => additionalData[key] !== null && additionalData[key] !== undefined)) {
                    try {
                        const updatePayload = {
                            orderNumber,
                            ...additionalData
                        };
                        console.log('[CompletePayment] POST 업데이트 페이로드:', updatePayload);

                        const updateRes = await httpPost(httpUrl.updateOrder, null, updatePayload);
                        console.log('[CompletePayment] POST 업데이트 응답:', updateRes);

                        if (updateRes?.code !== 100) {
                            console.warn('[CompletePayment] 주문 정보 업데이트 실패:', updateRes);
                        }
                    } catch (updateError) {
                        console.error('[CompletePayment] 주문 정보 업데이트 오류:', updateError);
                        // 업데이트 실패해도 결제 조회는 성공했으므로 계속 진행
                    }
                }

                if (res?.code === 100 && res?.result) {
                    console.log('[CompletePayment] API 성공, 데이터 설정:', res.result);
                    setData(res.result);
                } else {
                    console.error('[CompletePayment] API 응답 오류:', { code: res?.code, message: res?.message, result: res?.result });
                    setErrMsg(res?.message || '결제 정보를 불러오지 못했습니다.');
                }
            } catch (e) {
                console.error('[CompletePayment] api error 상세:', {
                    message: e?.message,
                    response: e?.response,
                    status: e?.response?.status,
                    statusText: e?.response?.statusText,
                    data: e?.response?.data,
                    stack: e?.stack,
                    url: url,
                    orderNumber: orderNumber
                });

                // 더 구체적인 에러 메시지 제공
                let errorMessage = '알 수 없는 오류가 발생했습니다.';

                if (e?.message === 'Network Error') {
                    errorMessage = `서버에 연결할 수 없습니다.\n\n확인사항:\n1. 인터넷 연결 상태\n2. 서버 상태\n3. 주문번호: ${orderNumber}`;
                } else if (e?.response?.status === 404) {
                    errorMessage = `주문 정보를 찾을 수 없습니다.\n주문번호: ${orderNumber}`;
                } else if (e?.response?.status === 401) {
                    errorMessage = '로그인이 필요합니다. 다시 로그인해주세요.';
                } else if (e?.response?.status >= 500) {
                    errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                } else if (e?.message) {
                    errorMessage = e.message;
                }

                setErrMsg(errorMessage);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [orderNumber]);

    // 3) 홈 탭으로 이동 (RN 브리지 → 웹 폴백)
    const goHome = () => {
        try {
            const payload = { action: 'GO_HOME', tab: '홈' };
            if (typeof window !== 'undefined' && typeof window.__askRN === 'function') {
                window.__askRN(payload.action, { tab: payload.tab });
                return;
            }
            if (typeof window !== 'undefined' &&
                window.ReactNativeWebView &&
                typeof window.ReactNativeWebView.postMessage === 'function') {
                window.ReactNativeWebView.postMessage(JSON.stringify(payload));
                return;
            }
            // 웹 폴백: 루트로 이동
            if (typeof window !== 'undefined') {
                window.location.replace(`${window.location.origin}/`);
            }
        } catch (e) {
            console.log('[CompletePayment] goHome error', e);
        }
    };

    // 4) 입장하기 → 같은 도메인의 /qr-code로 이동 (표시용 정보 쿼리로 전달)
    const goQr = () => {
        if (typeof window === 'undefined' || !data) return;
        const p = new URLSearchParams({
            orderNumber: String(data.orderNumber || orderNumber || ''),
            storeName: data.storeName || '',
            passType: data.passType || '',
            description: data.productInfo || '',
            amount: String(data.paymentAmount ?? ''),
            paidAt: data.paidAt || '',
            address: '', // 주소가 필요하면 window.SKYSUNNY.address 등으로 채워 넣으세요
        });
        const base = window.location.origin;
        window.location.assign(`${base}/qr-code?${p.toString()}`);
    };

    // 5) 로딩/에러 UI
    if (loading) {
        return (
            <div className="complete-container">
                <img src={infoIcon} alt="payment" className="payment-img" />
                <div className="notice-box">
                    <span className="notice-text font-bm">결제 정보를 불러오는 중입니다...</span>
                </div>
            </div>
        );
    }
    if (errMsg) {
        return (
            <div className="complete-container">
                <img src={infoIcon} alt="payment" className="payment-img" />
                <div className="notice-box">
                    <span className="notice-text font-bm">{errMsg}</span>
                </div>
                <div className="bottom-bar">
                    <button className="bottom-btn" onClick={goHome}>닫기</button>
                </div>
            </div>
        );
    }

    // 6) 정상 렌더
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
                {getDisplayFields(data.passType).map((field, index) => {
                    if (field.type === 'separator') {
                        return <div key={index} className="line"></div>;
                    }

                    const value = data[field.key];
                    const displayValue = field.isMoney ? toMoney(value) : (value || '-');

                    // passType 필드인 경우 표시명으로 변환
                    const finalValue = field.key === 'passType' ? getPassTypeDisplayName(value) : displayValue;

                    return (
                        <div key={index} className="info-row">
                            <span className="title">{field.label}</span>
                            <span className="text">{finalValue}</span>
                        </div>
                    );
                })}

                {/* 쿠폰할인은 모든 passType에서 표시 (값이 있을 때만) */}
                {!!data.couponAmount && (
                    <div className="info-row">
                        <span className="title">쿠폰할인</span>
                        <span className="text">-{toMoney(data.couponAmount)}</span>
                    </div>
                )}
            </div>

            {/* 입장하기 */}
            <div className="enter-btn-box">
                <button className="enter-btn" onClick={goQr}>입장하기</button>
            </div>

            {/* 닫기 → HomeTab 이동 */}
            <div className="bottom-bar">
                <button className="bottom-btn" onClick={goHome}>닫기</button>
            </div>
        </div>
    );
}
