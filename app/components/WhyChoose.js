"use client";

export default function WhyChoose() {
  return (
    <section className="why-section">
      <div className="container">
        <div className="row align-items-center">

          {/* LEFT FLOATING */}
          <div className="col-md-6 position-relative text-center">

            <div className="main-circle">❤️</div>

            <div className="floating f1">💊</div>
            <div className="floating f2">🏥</div>
            <div className="floating f3">🩺</div>
            <div className="floating f4">✔</div>

          </div>

          {/* RIGHT */}
          <div className="col-md-6">
            <h6 className="text-danger fw-bold">WHY CHOOSE US</h6>

            <h2 className="fw-bold">
              Delivering Reliable Healthcare Solutions
            </h2>

            <p>
              Raj Biosis ensures precision and quality in every product.
            </p>

            <div className="d-flex gap-4 mt-3">
              <span>✔ High Accuracy</span>
              <span>✔ Fast Delivery</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}