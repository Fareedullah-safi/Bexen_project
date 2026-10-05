export default function BlogDropDown() {
  return (
    <>
      <div className="invisible absolute left-0 top-full z-50 mt-9 h-40 w-52 translate-y-2 rounded-lg bg-[#FFFFFF] p-4 font-semibold text-[#0C1E21] opacity-0 shadow-lg shadow-gray-400 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <div className="flex flex-col gap-3">
          <h1 className="cursor-pointer text-[15px] tracking-[0.2px] text-[#596366] transition-all duration-300 hover:translate-x-1 hover:text-[#1E8A8A]">
            Blog
          </h1>

          <h1 className="cursor-pointer text-[15px] tracking-[0.2px] text-[#596366] transition-all duration-300 hover:translate-x-1 hover:text-[#1E8A8A]">
            Blog Grid
          </h1>

          <h1 className="cursor-pointer text-[15px] tracking-[0.2px] text-[#596366] transition-all duration-300 hover:translate-x-1 hover:text-[#1E8A8A]">
            Blog Right Sidebar
          </h1>

          <h1 className="cursor-pointer text-[15px] tracking-[0.2px] text-[#596366] transition-all duration-300 hover:translate-x-1 hover:text-[#1E8A8A]">
            Blog Details
          </h1>
        </div>
      </div>
    </>
  );
}
