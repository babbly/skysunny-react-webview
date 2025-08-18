import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backArrow from '../img/common/backarrow.png';
import infoIcon from "../img/mypage/redclock.png";

import '../styles/main.scss';

export default function Coupon() {
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState("전체보기");

    const couponData = [
        {
            id: "1",
            title: "수험생 특별 할인 쿠폰",
            store: "시작 스터디카페 인천 송도점",
            validDays: 10,
            amount: "5,000원",
            minUse: "10,000원 이상 이용가능",
            type: "이용가능",
        },
        {
            id: "2",
            title: "만료된 쿠폰",
            store: "시작 스터디카페 인천 송도점",
            validDays: -1,
            amount: "3,000원",
            minUse: "5,000원 이상 이용가능",
            type: "만료",
        },
    ];

    const filteredCoupons =
        selectedTab === "전체보기"
            ? couponData
            : couponData.filter((coupon) => coupon.type === selectedTab);

    return (
        <div className="container">
            {/* 상단 바 */}
            <div className="top-bar">
                <div className="top-bar-left">
                    <img
                        src={backArrow}
                        alt="뒤로가기"
                        className="icon24"
                        onClick={() => navigate(-1)}
                    />
                </div>
                <div className="top-bar-center">
                    <span className="top-txt font-noto">쿠폰함</span>
                </div>
            </div>

            {/* 상단 탭 */}
            <div className="tab-container">
                {["전체보기", "이용가능", "만료", "환불"].map((tab) => (
                    <button
                        key={tab}
                        className={`tab-btn ${selectedTab === tab ? "active" : ""}`}
                        onClick={() => setSelectedTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* 쿠폰 리스트 */}
            <div className="coupon-list">
                {filteredCoupons.map((item) => (
                    <div className="coupon-card" key={item.id}>
                        <div className="coupon-header">
                            <div></div>
                            <div
                                className={`status-box ${item.type === "이용가능" ? "active" : "disabled"
                                    }`}
                            >
                                {item.type}
                            </div>
                        </div>

                        <div className="line"></div>

                        <div className="title-row">
                            <div className="tag">매장전용</div>
                            <span className="coupon-title">{item.title}</span>
                        </div>

                        <div className="date-row">
                            <img src={infoIcon} alt="clock" className="icon14" />
                            <span className="date-text">
                                {item.validDays > 0
                                    ? `유효기간 ${item.validDays}일`
                                    : "만료됨"}
                            </span>
                        </div>

                        <div className="bottom-row">
                            <span className="amount">{item.amount}</span>
                            <span className="min-use">{item.minUse}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
