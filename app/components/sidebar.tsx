'use client'

import { useAuth } from "@/src/context/AuthContext";
import { logout } from "@/src/hooks/init";
import Link from "next/link";

export default function Sidebar () {
  const { profile } = useAuth();

  if (!profile) return <></>

  return (
    <div>
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <label
          htmlFor="my-drawer"
          className="btn drawer-button fixed top-0 left-0 w-4 h-4 bg-red-500 text-white z-10 rounded-none text-xs"
        >
          {"<3"}
        </label>
      </div>
      <div className="drawer-side border-white border-r bg-black">
        <label
          htmlFor="my-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="flex flex-col gap-y-4 w-full p-4 z-12 w-[30%] max-w-[300px]">
          <Link
            href="/"
            className="flex gap-2 items-center p-2 text-lg text-center justify-center"
          >
            <span>SPINAL</span>
          </Link>

          <Link href="/search" className="btn">
            Search
          </Link>
          <Link href="/playlist" className="btn">
            Playlists
          </Link>
          <button
            className="btn btn-error btn-outline"
            onClick={() => logout()}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}