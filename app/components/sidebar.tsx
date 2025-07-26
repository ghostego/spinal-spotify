'use client'

import { useAuth } from "@/src/context/AuthContext";
import { logout } from "@/src/hooks/init";
import { useState } from "react"
import Link from "next/link";
import HeartBrokenIcon from "@mui/icons-material/HeartBroken";
import SlideOutSidebar from "@/components/SlideOutSidebar";


export default function Sidebar () {
  const { profile } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!profile) return <></>

  const linkClick = () => {
    setIsSidebarOpen(false)
  }

  const LINK_LIST = [
    {
      label: "SPINAL",
      href: "/",
    },
    {
      label: "Search",
      href: "/search",
    },
    {
      label: "Playlists",
      href: "/playlist",
    },
    {
      label: "New Playlist",
      href: "/playlist/new",
    },
  ];

  const linkButton = (linkObject: Record<string, any>, i: number) => {
    return (
      <Link
        onClick={() => {
          linkClick();
        }}
        href={linkObject.href}
        key={`list-item-${i}`}
        className="flex gap-2 items-center p-2 text-lg text-center justify-center btn w-full"
      >
        {linkObject.label}
      </Link>
    );
  }

  return (
    <div>
      <label
        onClick={() => setIsSidebarOpen(true)}
        className="btn drawer-button fixed top-0 left-0 w-4 h-8 bg-red-500 text-white z-10 rounded-none text-xs hover:bg-black hover:text-red-500 transition-all"
      >
        <HeartBrokenIcon />
      </label>
      <div>
        <SlideOutSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          side="left"
          width="300px"
        >
          <div className="flex flex-col gap-y-4 w-full p-4 z-12 w-[30%] max-w-[300px] items-center">
            {LINK_LIST.map(((link, i) => linkButton(link, i)))}
            <button
              className="btn btn-error btn-outline"
              onClick={() => logout()}
            >
              Logout
            </button>
          </div>
        </SlideOutSidebar>
      </div>
    </div>
  );
}