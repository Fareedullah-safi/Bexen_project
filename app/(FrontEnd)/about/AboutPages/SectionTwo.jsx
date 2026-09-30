export default function SectionTwo() {
  return (
    <section className="relative bg-red-500 w-full overflow-hidden py-20">
      {/* Pattern 2 SVG Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "url('https://themejunction.net/html/bexon/demo/assets/images/shape/pattern-2.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center">
        <h1 className="text-4xl font-bold text-[#0C1E21]">Hello World</h1>
      </div>
    </section>
  );
}
