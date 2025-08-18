
import { useState } from 'react';
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
    const [paymentMethod, setPaymentMethod] = useState('card');

    const movePage = (path) => {
        navigate(path);
    };
    const location = useLocation();
    const [selectedCoupon, setSelectedCoupon] = useState(location.state?.selectedCoupon || null);

    const bannerImages2 = [bannerImg, bannerImg, bannerImg];

    return (
        <div className="container">
            {/* 상단 바 */}
            <div className="top-bar">
                <div className="top-bar-left">
                    <button
                        onClick={() => navigate(-1)}
                        style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
                    >
                        <img src={backArrow} alt="뒤로가기" className="icon24" />
                    </button>
                </div>
                <div className="top-bar-center">
                    <span className="top-txt font-noto">구매확인</span>
                </div>
            </div>

            {/* 배너 슬라이더 */}
            <div className="banner-container">
                <Banner banners={bannerImages2} type="sub2" />
            </div>

            {/* 구매 정보 */}
            <div className="info-container">

                <div className="section-title-box">
                    <span className="font-bm section-title">구매정보</span>
                </div>

                <div className="info-box">
                    <div className="info-row">
                        <span className="info-title">매장명</span>
                        <span className="info-text">시작 스터디카페 인천 송도점</span>
                    </div>
                    <div className="info-row">
                        <span className="info-title">이용권</span>
                        <span className="info-text">캐시정기권</span>
                    </div>
                    <div className="info-row">
                        <span className="info-title">상품정보</span>
                        <span className="info-text">50,000 캐시권</span>
                    </div>
                    <div className="info-row">
                        <span className="info-title">이용금액</span>
                        <span className="info-text">50,000원</span>
                    </div>
                    <div className="info-row">
                        <span className="info-title">좌석당 할인율</span>
                        <span className="info-text">시간당 정상가 10%</span>
                    </div>
                    <div className="info-row">
                        <span className="info-title">이용기간</span>
                        <span className="info-text">1개월</span>
                    </div>
                    <div className="info-row">
                        <span className="info-title">이용정보</span>
                        <span className="info-text">24.07.01 14:00~16:30</span>
                    </div>
                    <div className="info-row">
                        <span className="info-title">1일 이용정보</span>
                        <span className="info-text">38,200캐시</span>
                    </div>

                    <hr className="line" />

                    <div className="info-row">
                        <span className="info-title">할인쿠폰</span>
                        <button
                            className="coupon-btn"
                            onClick={() => movePage('/check-coupon')}
                        >
                            쿠폰선택
                        </button>
                    </div>
                    <div className="info-row">
                        {selectedCoupon &&

                            <>
                                <div className="info-text">{selectedCoupon.title}</div>

                                <div className="info-img">
                                    <img src={close} alt="쿠폰삭제" className="icon24"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setSelectedCoupon(null)} />
                                </div>
                            </>
                        }

                    </div>
                    <hr className="dashed-line" />

                    <div className="info-row">
                        <span className="info-title">할인금액</span>
                        {selectedCoupon &&
                            <span className="info-text">{selectedCoupon.amount}</span>
                        }
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
                <p className="note-text font-bm">
                    PC, 대리인 결제도 가능해요!
                </p>
                <div className="copy-url-box">
                    <span className="font-noto url-text">http://skasca.me/cash</span>
                    <img src={copy} alt="info" className="icon14" />
                    <span
                        className="copy-btn"
                        onClick={() => navigator.clipboard.writeText('http://skasca.me/cash')}
                    >
                        URL 복사
                    </span>
                </div>
                <div className="line"></div>
                {paymentMethod === 'card' ?
                    <></>
                    :
                    <p className="atm-text">
                        <b>‘ATM 기기’를 통한 무통장 입금은 지원되지 않아요.</b> <br />
                        인터넷 뱅킹 또는 은행 창구를 통해 입금 부탁 드려요! <br /><br />
                        <b>해외송금을 통해 무통장 입금 시 결제가 실패됩니다.</b><br />
                        결제실패로 인한 환불 시 고객님께 해외송금 수수료가 청구될 수 있습니다.
                    </p>
                }
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
            {/* 하단 결제 버튼 */}
            <div className="bottom-bar2">
                <span>결제금액</span>
                <span>45,000원</span>
            </div>
            <div className="bottom-button">
                <button
                    onClick={() => {
                        if (paymentMethod === 'card') {
                            movePage('/toss-payments'); // 카드결제 페이지
                        } else {
                            movePage('/store-detail'); // 무통장입금 페이지
                        }
                    }}
                >
                    구매하기
                </button>
            </div>
        </div>
    );
}
