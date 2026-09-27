import HotBtn from "./HotBtn";
import ImageMaking from "./ImageMaking";
import NewBtn from "./NewBtn";

export default function PageDropDown() {
  return (
    <>
      <div className="invisible absolute h-[81vh] left-62 top-15 z-50 w-[94vw] border-2 border-r-0 -translate-x-1/2 flex  gap-5 rounded-lg bg-[#ffff] opacity-0 shadow-lg shadow-gray-400 transition-all duration-300 group-hover:visible group-hover:opacity-100">
        {/* Main Pages */}
        <div className="w-180 border-r-2 border-grey-300 rounded-1xl">
          <div className="p-4">
            <h6 className="mb-4 text-xl font-semibold text-[#0C1E21]">Main Pages</h6>

            <div className="flex flex-col gap-3">
              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                About us
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Our history
                <HotBtn />
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Team
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Team details
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Careers
                <NewBtn />
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Careers details
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Pricing plan
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Feedbacks
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                FAQ
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
        {/* main page closed */}
        {/* Other Pages */}
        <div className="w-180 border-r-2 border-grey-300 rounded-1xl">
          <div className="p-4 pl-0">
            <h6 className="mb-4 text-xl font-semibold text-[#0C1E21]">Other Pages</h6>

            <div className="flex flex-col gap-3">
              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Services
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Service details
                <HotBtn />
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Portfolio
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Portfolio details
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Error 404
                <NewBtn />
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Blog grid
                <NewBtn />
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Blog list
                <NewBtn />
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Blog standard
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Blog details
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Our gallery
                <NewBtn />
              </a>
            </div>
          </div>
        </div>
        {/* Other Page closed */}
        {/* shop page open here */}
        <div className="flex border-r-2 border-gray-300 rounded-1xl">
          <div className="p-4 pl-0">
            <h6 className="mb-4 text-xl font-semibold text-[#0C1E21]">Shop Pages</h6>

            <div className="flex flex-col gap-3">
              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Shop
                <HotBtn />
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Shop details
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Cart
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Checkout
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Wishlist
                <NewBtn />
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                My account
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Login
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Registration
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Coming soon
              </a>

              <a
                href="#"
                className="flex items-center gap-1 text-md font-normal text-[#0C1E21] transition-all duration-500 ease-out hover:translate-x-2 hover:text-[#1E8A8A]"
              >
                Term & conditions
              </a>
            </div>
          </div>
          <ImageMaking />
        </div>
        {/* shop page closed here */}
      </div>
    </>
  );
}
