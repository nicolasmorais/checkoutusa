export function LogoMark({ size = 18 }: { size?: number }) {
  const scale = size / 18;
  return (
    <span className="relative block" style={{ width: size, height: size }}>
      <span
        className="absolute rounded-[3px] bg-white"
        style={{ width: 7 * scale, height: 17 * scale, left: 7 * scale, top: 0, transform: "rotate(-35deg)" }}
      />
      <span
        className="absolute rounded-[3px] bg-white"
        style={{ width: 7 * scale, height: 8 * scale, left: 1 * scale, top: 8 * scale, transform: "rotate(-35deg)" }}
      />
    </span>
  );
}
