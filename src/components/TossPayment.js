import { loadPaymentWidget } from "@tosspayments/payment-widget-sdk";
import { useEffect, useState } from "react";

// 테스트용 상품 리스트
const products = [
    { id: 1, name: "테스트 상품 A", price: 1000 },
    { id: 2, name: "테스트 상품 B", price: 2000 },
    { id: 3, name: "테스트 상품 C", price: 3000 },
];

const TossPayment = () => {
    const [paymentWidget, setPaymentWidget] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(products[0]);

    // 모달 상태
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    // 1️⃣ 토스 위젯 초기화
    useEffect(() => {
        async function initWidget() {
            const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
            const customerKey = "test_user_01";

            const widget = await loadPaymentWidget(clientKey, customerKey);

            // 초기 금액 렌더링
            widget.renderPaymentMethods("#toss-widget-container", { value: selectedProduct.price });

            setPaymentWidget(widget);
        }

        initWidget();
    }, []);

    // 2️⃣ 상품 선택 시 금액 갱신
    useEffect(() => {
        if (!paymentWidget) return;
        paymentWidget.renderPaymentMethods("#toss-widget-container", { value: selectedProduct.price });
    }, [selectedProduct, paymentWidget]);

    // 3️⃣ 결제 요청
    const handlePayment = async () => {
        if (!paymentWidget) return;

        try {
            await paymentWidget.requestPayment({
                orderId: `order-${Date.now()}`,
                orderName: selectedProduct.name,
                customerName: "홍길동",
                customerEmail: "test@example.com",
                // successUrl: `${window.location.origin}/#success`,
                successUrl: `${window.location.origin}/complete-payment`,
                failUrl: `${window.location.origin}/#fail`,
            });
        } catch (err) {
            console.error(err);
        }
    };

    // 4️⃣ hashchange 이벤트로 결제 결과 감지
    useEffect(() => {
        const handleHashChange = () => {
            if (window.location.hash === "#success") {
                setModalMessage(`"${selectedProduct.name}" 결제가 성공적으로 완료되었습니다! 🎉`);
                setModalOpen(true);
            } else if (window.location.hash === "#fail") {
                setModalMessage(`"${selectedProduct.name}" 결제에 실패했습니다 😢 다시 시도해주세요.`);
                setModalOpen(true);
            }
        };

        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, [selectedProduct]);

    return (
        <div style={{ padding: 20 }}>

            {/* 토스 결제 위젯 화면 */}
            <div id="toss-widget-container" style={{ marginTop: 20 }}></div>

            <button
                onClick={handlePayment}
                style={{
                    marginTop: 20,
                    width: "100%",              // 화면 가로 꽉 차게
                    maxWidth: 400,              // 너무 넓지 않게 제한
                    padding: "16px 0",          // 버튼 높이 확보
                    backgroundColor: "#3182F6", // 토스 블루
                    color: "#fff",              // 흰색 텍스트
                    fontSize: "18px",           // 큼직한 글씨
                    fontWeight: "bold",
                    border: "none",
                    borderRadius: "12px",       // 둥근 모서리
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)", // 살짝 그림자
                    transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1B64DA")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#3182F6")}
            >
                결제하기
            </button>


            {/* 모달 */}
            {modalOpen && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999,
                    }}
                >
                    <div
                        style={{
                            background: "#fff",
                            padding: 30,
                            borderRadius: 10,
                            textAlign: "center",
                            maxWidth: 400,
                        }}
                    >
                        <p>{modalMessage}</p>
                        <button onClick={() => setModalOpen(false)}>닫기</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TossPayment;
