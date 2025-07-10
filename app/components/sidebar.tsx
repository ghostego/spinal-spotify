'use client'

import { useAuth } from "@/src/context/AuthContext";
import { clearCache } from "@/src/hooks/init";
import Link from "next/link";
import Image from "next/image";

export default function Sidebar () {
  const { profile } = useAuth();

  if (!profile) return <></>

	return (
    <div className="fixed flex flex-col gap-2 p-4 border-r-2 border-white min-h-screen w-[300px] pt-12 w-1/4 relative">
      <div className="flex flex-col gap-y-4 w-full">
        <Link
          href="/"
          className="flex gap-2 items-center p-2 border border-white"
        >
          {profile && profile.images?.[1].url && (
            <Image
              alt={profile.displayName || ""}
              src={profile.images?.[1].url}
              height={40}
              width={40}
            />
          )}
          <div className="flex-col flex">
            <h2 className="text-md">{profile.display_name}</h2>
            <h3 className="text-xs">{profile.id}</h3>
          </div>
        </Link>

        <small className="cursor-pointer" onClick={() => clearCache()}>
          logout
        </small>

        <Link href="/search" className="border border-white py-1 text-center">
          <button>Show Search</button>
        </Link>
        <Link
          href="/playlist"
          className="border border-white py-1 px-2 text-center"
        >
          <button>Show Playlists</button>
        </Link>
      </div>
    </div>
  );
}