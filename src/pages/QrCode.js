import { useEffect, useState } from "react";
import lockerIcon from "../img/home/locker2.png";
import qrIcon from "../img/home/qr.png";
import seatIcon from "../img/home/seat2.png";
import timeIcon from "../img/home/time.png";
import wifiIcon from "../img/home/wifi.png";
import "../styles/main.scss";

export default function QrCode({ navigate }) {
    // 메시지로 받은 데이터 상태
    const [qrData, setQrData] = useState(null);              // { usageSeat, wifiId, wifiPassword, entrancePassword, imageUrl }
    const [orderDetails, setOrderDetails] = useState(null);  // { storeName, passType, productInfo }
    const [qrIdentifier, setQrIdentifier] = useState(null);  // { orderId, passId, aggregateId, timestamp }
    const [remainSec, setRemainSec] = useState(30);
    const [err, setErr] = useState(null);

    const movePage = (screen) => {
        console.log("move to", screen);
        // RN 쪽으로 닫기 신호 보내고 싶으면:
        window.ReactNativeWebView?.postMessage(
            JSON.stringify({ type: "QR_CLOSE" })
        );
        // 웹 라우팅 쓰면 아래 사용
        // if (typeof navigate === 'function') navigate(`/page/${screen}`);
    };

    const secToMMSS = (sec) => {
        const s = Math.max(0, Math.floor(sec || 0));
        const mm = String(Math.floor(s / 60)).padStart(2, "0");
        const ss = String(s % 60).padStart(2, "0");
        return `${mm}:${ss}`;
    };

    // RN WebView에서 오는 메시지 수신
    useEffect(() => {
        const onMsg = (e) => {
            try {
                const raw = e.data ?? e; // iOS 대응
                const { type, payload } =
                    typeof raw === "string" ? JSON.parse(raw || "{}") : raw || {};

                if (type === "INIT_META") {
                    // 필요하면 여기서 매장/이용권 메타를 별도 상태로 보관
                    // setMeta(payload);
                }

                if (type === "QR_DATA") {
                    const { qrData, orderDetails, qrIdentifier } = payload || {};
                    setQrData(qrData || null);
                    setOrderDetails(orderDetails || null);
                    setQrIdentifier(qrIdentifier || null);

                    if (qrIdentifier?.timestamp) {
                        const diffMs = qrIdentifier.timestamp * 1000 - Date.now();
                        setRemainSec(Math.max(0, Math.ceil(diffMs / 1000)));
                    }
                }

                if (type === "QR_ERROR") {
                    setErr(payload || "QR 로드 오류");
                }
            } catch {
                /* no-op */
            }
        };

        window.addEventListener("message", onMsg);
        document.addEventListener("message", onMsg); // iOS RN 호환
        return () => {
            window.removeEventListener("message", onMsg);
            document.removeEventListener("message", onMsg);
        };
    }, []);

    // 인증 타이머
    useEffect(() => {
        if (remainSec <= 0) return;
        const t = setInterval(() => setRemainSec((s) => Math.max(0, s - 1)), 1000);
        return () => clearInterval(t);
    }, [remainSec]);

    const qrImgSrc = qrData?.imageUrl || qrIcon;

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
                    <img src={qrImgSrc} alt="QR Code" className="qr-img" />
                    <div className="qr-timer-box">
                        <img src={timeIcon} alt="time" className="icon18" />
                        <span className="qr-timer">인증시간 {secToMMSS(remainSec)}</span>
                    </div>
                </div>

                {/* 기본 내용 */}
                <div className="info-basic">
                    <div className="info-row">
                        <div className="info-label">
                            <img src={seatIcon} alt="seat" className="icon18" />
                            <span className="title">이용좌석</span>
                        </div>
                        <span className="text">{qrData?.usageSeat ?? "-"}</span>
                    </div>
                    <div className="info-row">
                        <div className="info-label">
                            <img src={lockerIcon} alt="door" className="icon18" />
                            <span className="title">출입문</span>
                        </div>
                        <span className="text">{qrData?.entrancePassword ?? "-"}</span>
                    </div>
                    <div className="info-row">
                        <div className="info-label">
                            <img src={wifiIcon} alt="wifi" className="icon18" />
                            <span className="title">와이파이</span>
                        </div>
                        <span className="text">
                            {qrData?.wifiId ?? "-"}
                            {qrData?.wifiPassword ? ` / ${qrData.wifiPassword}` : ""}
                        </span>
                    </div>
                </div>

                {/* 결제 내역 */}
                <div className="info-card">
                    <div className="info-row">
                        <span className="title">매장명</span>
                        <span className="text">{orderDetails?.storeName ?? "-"}</span>
                    </div>
                    <div className="info-row">
                        <span className="title">이용권</span>
                        <span className="text">{orderDetails?.passType ?? "-"}</span>
                    </div>
                    <div className="info-row">
                        <span className="title">상품정보</span>
                        <span className="text">{orderDetails?.productInfo ?? "-"}</span>
                    </div>
                    <div className="line"></div>
                    <div className="info-row">
                        <span className="title">이용정보</span>
                        <span className="text">-</span>
                    </div>
                    <div className="info-row">
                        <span className="title">유효기간</span>
                        <span className="text">-</span>
                    </div>
                    <div className="info-row">
                        <span className="title">잔여정보</span>
                        <span className="text">-</span>
                    </div>
                </div>

                {/* 에러 표시 (선택) */}
                {err && (
                    <div className="error-box">
                        <span className="error-text">로드 실패: {err}</span>
                    </div>
                )}
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
