import Link from "next/link"
import Image from "next/image"

export default function SearchResult({ item, image, onClick }: {item: any, image?: any, onClick: (item: any) => void}) {
	const ResultWrapper = (children: React.ReactNode) => {
    if (onClick) {
      return <div className="flex items-center h-full" onClick={() => onClick(item)}>{children}</div>;
    } else {
      return (
        <Link 
          href={`/artists/${item.id || item.name}`}
          className="flex items-center h-full"
        >
          {children}
        </Link>
      );
    }
  };

  return (
    <li
      key={item.id || item.name}
      className="flex flex-row gap-2 border border-white space-between mb-2 items-center pr-2  pl-0 hover:bg-white hover:text-black cursor-pointer transition-all relative p-4 h-[82px]"
    >
      {ResultWrapper(
        <>
          {image && (
            <Image
              src={image.url}
              height={image.height}
              width={image.width}
              className="w-20 h-20"
              alt={item.name}
            />
          )}
          <h3 className="text-lg ml-2">{item.name}</h3>
        </>
      )}
    </li>
  );
}