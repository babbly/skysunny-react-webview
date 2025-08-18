import lockerIcon from "../img/home/locker2.png";
import qrIcon from "../img/home/qr.png";
import seatIcon from "../img/home/seat2.png";
import timeIcon from "../img/home/time.png";
import wifiIcon from "../img/home/wifi.png";
import '../styles/main.scss';

export default function QrCode({ navigate }) {
    const movePage = (screen) => {
        console.log("move to", screen);
        // 실제 네비게이션 연결 시 react-router-dom 사용
        // navigate(`/page/${screen}`);
    };

    return (
        <div className="qr-container">
            {/* 상단 영역 */}
            <div className="qr-header">
                <div className="qr-header-inner">
                    <p className="qr-header-text">
                        <b>QR코드</b>를 <b>출입문 리더기</b>에
                        <br />
                        인식시켜주세요.
                    </p>
                </div>
            </div>

            {/* QR 박스 */}
            <div className="qr-box-wrapper">
                <div className="menu-box">
                    <img src={qrIcon} alt="QR Code" className="qr-img" />
                    <div className="qr-timer-box">
                        <img src={timeIcon} alt="time" className="icon18" />
                        <span className="qr-timer">인증시간 00:25</span>
                    </div>
                </div>

                {/* 기본 내용 */}
                <div className="info-basic">
                    <div className="info-row">
                        <div className="info-label">
                            <img src={seatIcon} alt="seat" className="icon18" />
                            <span className="title">이용좌석</span>
                        </div>
                        <span className="text">61번</span>
                    </div>
                    <div className="info-row">
                        <div className="info-label">
                            <img src={lockerIcon} alt="door" className="icon18" />
                            <span className="title">출입문</span>
                        </div>
                        <span className="text">#01234</span>
                    </div>
                    <div className="info-row">
                        <div className="info-label">
                            <img src={wifiIcon} alt="wifi" className="icon18" />
                            <span className="title">와이파이</span>
                        </div>
                        <span className="text">a15333963</span>
                    </div>
                </div>

                {/* 결제 내역 */}
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
                    <div className="line"></div>
                    <div className="info-row">
                        <span className="title">이용정보</span>
                        <span className="text">24.07.01 14:00~16:30</span>
                    </div>
                    <div className="info-row">
                        <span className="title">유효기간</span>
                        <span className="text">15일</span>
                    </div>
                    <div className="info-row">
                        <span className="title">잔여정보</span>
                        <span className="text">3시간</span>
                    </div>
                </div>
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
