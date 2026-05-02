import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href="/" className="inline-flex items-center transition-opacity hover:opacity-75">
      <Image
        src="/logo.svg"
        alt="포토클리닉"
        width={200}
        height={40}
        priority
        style={{ height: 24, width: "auto" }}
      />
    </Link>
  );
}
