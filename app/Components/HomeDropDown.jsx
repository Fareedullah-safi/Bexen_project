import Image from "next/image";
import Button from "./Button";

export default function HomeDropDown() {
  return (
    <>
      <div className="invisible absolute left-86 top-14 z-50 grid w-[96vw] -translate-x-1/2 grid-cols-1 gap-5 rounded-md  bg-[#ffff] p-5 opacity-0 shadow-lg shadow-gray-400 transition-all duration-300 group-hover:visible group-hover:opacity-100 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="group/card relative h-70 w-full rounded-[10px] bg-white shadow-lg shadow-gray-400 transition-transform duration-300 hover:scale-102">
          <Image
            src="https://themejunction.net/html/bexon/demo/assets/images/header/demo/home-1.webp"
            width={1000}
            height={1000}
            alt="home (1)"
            className="relative m-3 h-52 w-63.5 rounded-md"
          />

          <Button />

          <div className="flex h-12 items-center justify-center pb-5">
            <h1 className="text-center font-medium text-zinc-900">Home-page - 01</h1>
          </div>
        </div>

        {/* Card 2 */}
        <div className="group/card relative h-70 w-full rounded-[10px]  bg-white shadow-lg shadow-gray-400 transition-transform duration-300 hover:scale-105">
          <Image
            src="https://themejunction.net/html/bexon/demo/assets/images/header/demo/home-2.webp"
            width={1000}
            height={1000}
            alt="home (2)"
            className="relative m-3 h-52 w-63.5 rounded-md"
          />

          <Button />

          <div className="flex h-12 items-center justify-center pb-5">
            <h1 className="text-center font-medium text-zinc-900">Home-page - 02</h1>
          </div>
        </div>

        {/* Card 3 */}
        <div className="group/card relative h-70 w-full rounded-[10px]  bg-white shadow-lg shadow-gray-400 transition-transform duration-300 hover:scale-105">
          <Image
            src="https://themejunction.net/html/bexon/demo/assets/images/header/demo/home-3.webp"
            width={1000}
            height={1000}
            alt="home (3)"
            className="relative m-3 h-52 w-63.5 rounded-md"
          />

          <Button />

          <div className="flex h-12 items-center justify-center pb-5">
            <h1 className="text-center font-medium text-zinc-900">Home-page - 03</h1>
          </div>
        </div>

        {/* Card 4 */}
        <div className="group/card relative h-70 w-full rounded-[10px]  bg-white shadow-lg shadow-gray-400 transition-transform duration-300 hover:scale-105">
          <Image
            src="https://themejunction.net/html/bexon/demo/assets/images/header/demo/home-4.webp"
            width={1000}
            height={1000}
            alt="home (4)"
            className="relative m-3 h-52 w-63.5 rounded-md"
          />

          <Button />

          <div className="flex h-12 items-center justify-center pb-5">
            <h1 className="text-center font-medium text-zinc-900">Home-page - 04</h1>
          </div>
        </div>

        {/* Card 5 */}
        <div className="group/card relative h-70 w-full rounded-[10px]  bg-white shadow-lg shadow-gray-400 transition-transform duration-300 hover:scale-105">
          <Image
            src="https://themejunction.net/html/bexon/demo/assets/images/header/demo/home-5.webp"
            width={1000}
            height={1000}
            alt="home (5)"
            className="relative m-3 h-52 w-63.5 rounded-md"
          />

          <Button />

          <div className="flex h-12 items-center justify-center pb-5">
            <h1 className="text-center font-medium text-zinc-900">Home-page - 05</h1>
          </div>
        </div>

        {/* Card 6 */}
        <div className="group/card relative h-70 w-full rounded-[10px]  bg-white shadow-lg shadow-gray-400 transition-transform duration-300 hover:scale-105">
          <Image
            src="https://themejunction.net/html/bexon/demo/assets/images/header/demo/home-6.webp"
            width={1000}
            height={1000}
            alt="home (6)"
            className="relative m-3 h-52 w-63.5 rounded-md"
          />

          <Button />

          <div className="flex h-12 items-center justify-center pb-5">
            <h1 className="text-center font-medium text-zinc-900">Home-page - 06</h1>
          </div>
        </div>

        {/* Card 7 */}
        <div className="group/card relative h-70 w-full rounded-[10px]  bg-white shadow-lg shadow-gray-400 transition-transform duration-300 hover:scale-105">
          <Image
            src="https://themejunction.net/html/bexon/demo/assets/images/header/demo/home-7.webp"
            width={1000}
            height={1000}
            alt="home (7)"
            className="relative m-3 h-52 w-63.5 rounded-md"
          />

          <Button />

          <div className="flex h-12 items-center justify-center pb-5">
            <h1 className="text-center font-medium text-zinc-900">Home-page - 07</h1>
          </div>
        </div>

        {/* Card 8 */}
        <div className="group/card relative h-70 w-full rounded-[10px]  bg-white shadow-lg shadow-gray-400 transition-transform duration-300 hover:scale-105">
          <Image
            src="https://themejunction.net/html/bexon/demo/assets/images/header/demo/home-8.webp"
            width={1000}
            height={1000}
            alt="home (8)"
            className="relative m-3 h-52 w-63.5 rounded-md"
          />

          <Button />

          <div className="flex h-12 items-center justify-center pb-5">
            <h1 className="text-center font-medium text-zinc-900">Home-page - 08</h1>
          </div>
        </div>

        {/* Card 9 */}
        <div className="group/card relative h-70 w-full rounded-[10px]  bg-white shadow-lg shadow-gray-400 transition-transform duration-300 hover:scale-105">
          <Image
            src="https://themejunction.net/html/bexon/demo/assets/images/header/demo/home-9.webp"
            width={1000}
            height={1000}
            alt="home (9)"
            className="relative m-3 h-52 w-63.5 rounded-md"
          />

          <Button />

          <div className="flex h-12 items-center justify-center pb-5">
            <h1 className="text-center font-medium text-zinc-900">Home-page - 09</h1>
          </div>
        </div>

        {/* Card 10 */}
        <div className="group/card relative h-70 w-full rounded-[10px]  bg-white shadow-lg shadow-gray-400 transition-transform duration-300 hover:scale-105">
          <Image
            src="https://themejunction.net/html/bexon/demo/assets/images/header/demo/home-10.webp"
            width={1000}
            height={1000}
            alt="home (10)"
            className="relative m-3 h-52 w-63.5 rounded-md"
          />

          <Button />

          <div className="flex h-12 items-center justify-center pb-5">
            <h1 className="text-center font-medium text-zinc-900">Home-page - 10</h1>
          </div>
        </div>

        {/* Card 11 */}
        <div className="group/card relative h-70 w-full rounded-[10px]  bg-white shadow-lg shadow-gray-400 transition-transform duration-300 hover:scale-105">
          <Image
            src="https://themejunction.net/html/bexon/demo/assets/images/header/demo/home-11.webp"
            width={1000}
            height={1000}
            alt="home (11)"
            className="relative m-3 h-52 w-63.5 rounded-md"
          />

          <Button />

          <div className="flex h-12 items-center justify-center pb-5">
            <h1 className="text-center font-medium text-zinc-900">Home-page - 11</h1>
          </div>
        </div>

        {/* Card 12 */}
        <div className="group/card relative h-70 w-full rounded-[10px]  bg-white shadow-lg shadow-gray-400 transition-transform duration-300 hover:scale-105">
          <Image
            src="https://themejunction.net/html/bexon/demo/assets/images/header/demo/comming-soon.webp"
            width={1000}
            height={1000}
            alt="coming soon"
            className="relative m-3 h-52 w-63.5 rounded-md"
          />

          <Button />

          <div className="flex h-12 items-center justify-center pb-5">
            <h1 className="text-center font-medium text-zinc-900">Home-page - 12</h1>
          </div>
        </div>
      </div>
    </>
  );
}
