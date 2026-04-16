"use client";

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
          color: "#d8b4fe",
          fontFamily: "system-ui, -apple-system, sans-serif",
          textAlign: "center",
          padding: "4rem 1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2rem",
            maxWidth: "32rem",
            width: "100%",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/error.png"
            alt="오류 발생"
            style={{
              width: "100%",
              maxWidth: "28rem",
              height: "auto",
              userSelect: "none",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                letterSpacing: "-0.025em",
                color: "#d8b4fe",
                margin: 0,
              }}
            >
              앗! 심각한 오류가 발생했어요
            </h1>
            <p
              style={{
                fontSize: "0.95rem",
                lineHeight: 1.6,
                color: "rgba(216, 180, 254, 0.55)",
                margin: 0,
              }}
            >
              페이지를 불러오는 중 문제가 발생했습니다.
              <br />
              아래 버튼을 눌러 다시 시도해주세요.
            </p>
          </div>

          <button
            onClick={() => unstable_retry()}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "9999px",
              border: "1px solid rgba(192, 132, 252, 0.4)",
              backgroundColor: "transparent",
              color: "#e9d5ff",
              fontSize: "0.95rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "rgba(192, 132, 252, 0.6)";
              e.currentTarget.style.backgroundColor = "rgba(192, 132, 252, 0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "rgba(192, 132, 252, 0.4)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            다시 시도하기
          </button>
        </div>
      </body>
    </html>
  );
}
