import infoIcon from "../img/home/payment.png";

import '../styles/main.scss';

export default function CompletePayment() {
    const movePage = (screen) => {
        console.log("move to", screen);
        // 실제 네비게이션 연결 필요 시 react-router-dom 사용
        // navigate(`/page/${screen}`);
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
                <div className="info-row">
                    <span className="title">매장명</span>
                    <span className="text">시작 스터디카페 인천 송도점</span>
                </div>
                <div className="info-row">
                    <span className="title">이용권</span>
                    <span className="text">캐시정기권</span>
                </div>
                <div className="info-row">
                    <span className="title">상품정보</span>
                    <span className="text">50,000 캐시권</span>
                </div>
                <div className="info-row">
                    <span className="title">이용금액</span>
                    <span className="text">50,000원</span>
                </div>
                <div className="info-row">
                    <span className="title">이용기간</span>
                    <span className="text">1개월</span>
                </div>

                <div className="line"></div>

                <div className="info-row">
                    <span className="title">이용정보</span>
                    <span className="text">24.07.01 14:00~16:30</span>
                </div>
                <div className="info-row">
                    <span className="title">1일 이용정보</span>
                    <span className="text">38,200캐시</span>
                </div>
                <div className="info-row">
                    <span className="title">주문번호</span>
                    <span className="text">22123022889934</span>
                </div>
                <div className="info-row">
                    <span className="title">결제일시</span>
                    <span className="text">2024-03-03 10:00:10</span>
                </div>
                <div className="info-row">
                    <span className="title">결제금액</span>
                    <span className="text">45,000원</span>
                </div>
            </div>

            {/* 입장하기 버튼 */}
            <div className="enter-btn-box">
                <button className="enter-btn" onClick={() => movePage("Qr")}>
                    입장하기
                </button>
            </div>

            {/* 하단 버튼 */}
            <div className="bottom-bar">
                <button className="bottom-btn" onClick={() => movePage("StoreDetail")}>
                    닫기
                </button>
            </div>
        </div>
    );
}
