import Image from "next/image";
import GoogleSvg from "@/public/google.svg";

const GoogleIcon = () => {
  return (
    <div className="mt-8">
      <a
        href="#"
        className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow ring-1 ring-gray-300 hover:bg-gray-50"
      >
        <Image
          src={GoogleSvg}
          alt="Google Icon"
          className="h-5 w-5"
          width={20}
          height={20}
        />
        <span>Continue with Google</span>
      </a>
    </div>
  );
};

export default GoogleIcon;
