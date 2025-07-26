import Link from "next/link"
import Image from "next/image"

export default function ListItem({
  name,
  image,
  href,
  clickFn,
}: {
  name: string;
  image?: Record<string, any>;
  href: string;
  clickFn?: () => void;
}) {
  const key = name;
  return (
    <li
      key={key}
      className="flex flex-row gap-2 border border-white space-between mb-2 items-center pr-2  pl-0 hover:bg-white hover:text-black cursor-pointer transition-all relative p-4 h-[82px]"
    >
      <Link href={href} className="flex items-center h-full" onClick={clickFn}>
        {image && (
          <Image
            src={image.url}
            height={image.height}
            width={image.width}
            className="w-20 h-20"
            alt={name}
          />
        )}
        <h3 className="text-lg ml-2">{name}</h3>
      </Link>
    </li>
  );
}