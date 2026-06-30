export function appIconElement(size: number) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#2563eb",
        color: "white",
        fontFamily: "sans-serif",
        fontWeight: 700,
        fontSize: Math.round(size * 0.42),
      }}
    >
      PL
    </div>
  );
}
