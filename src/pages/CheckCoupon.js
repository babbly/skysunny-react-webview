
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backArrow from '../img/common/backarrow.png';
import redClock from '../img/mypage/redclock.png';
import '../styles/main.scss';

export default function CheckCoupon() {
    const navigate = useNavigate();
    const [couponData] = useState([
        {
            id: '1',
            code: 'DFRM-J8NN-6YLY-FKSD',
            title: '수험생 특별 할인 쿠폰',
            store: '시작 스터디카페 인천 송도점',
            validDays: 10,
            amount: '5,000원',
            minUse: '10,000원 이상 이용가능',
            type: '이용가능',
        },
        {
            id: '2',
            code: 'EXPD-1234-5678-ABCD',
            title: '만료된 쿠폰',
            store: '시작 스터디카페 인천 송도점',
            validDays: -1,
            amount: '3,000원',
            minUse: '5,000원 이상 이용가능',
            type: '만료',
        },
        {
            id: '3',
            code: 'DFRM-J8NN-6YLY-FKSD',
            title: '수험생 특별 할인 쿠폰22222',
            store: '시작 스터디카페 인천 송도점',
            validDays: 10,
            amount: '5,000원',
            minUse: '10,000원 이상 이용가능',
            type: '이용가능',
        },
    ]);

    const filteredCoupons = couponData.filter(coupon => coupon.type === '이용가능');

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
                    <span className="top-txt font-noto">쿠폰선택</span>
                </div>
            </div>

            {/* 쿠폰 리스트 */}
            <div className="coupon-list" style={{ minHeight: 'calc(100vh - 60px)' }}>
                {filteredCoupons.length > 0 ? (
                    filteredCoupons.map(item => (
                        <div className="coupon-card" key={item.id}>
                            {/* 코드 & 상태 */}
                            <div className="coupon-header">
                                <span></span>
                                <div className={`status-box ${item.type === '이용가능' ? 'active' : 'disabled'}`}>
                                    <span className="coupon-type">{item.type}</span>
                                </div>
                            </div>

                            <div className="line"></div>

                            {/* 제목 & 태그 */}
                            <div className="title-row">
                                <div className="tag">매장전용</div>
                                <span className="coupon-title">{item.title}</span>
                            </div>

                            {/* 매장명 & 유효기간 */}
                            <div className="date-row">
                                <img src={redClock} alt="clock" className="icon14" />
                                <span className={`date-text ${item.validDays > 0 ? '' : 'expired'}`}>
                                    {item.validDays > 0 ? `유효기간 ${item.validDays}일` : '만료됨'}
                                </span>
                            </div>

                            {/* 금액 & 최소사용금액 */}
                            <div className="bottom-row">
                                <span className="amount font-bm">{item.amount}</span>
                                <span className="min-use">{item.minUse}</span>
                            </div>

                            {/* 이용하기 버튼 */}
                            <button className="detail-btn" onClick={() => navigate('/check-payment', { state: { selectedCoupon: item } })}>
                                <span className="btn-text">이용하기</span>
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="no-coupon">
                        <img src={require('../img/home/noCoupon.png')} alt="no coupon" className="no-coupon-img" />
                        <p className="no-coupon-text">사용 가능한 쿠폰이 없어요.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
