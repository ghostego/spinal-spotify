import { ReactNode } from "react"

export default function SlideOutSidebar({
  children,
  isOpen = false,
  onClose,
  header = <div></div>
}: {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  header?: ReactNode;
}) {
  return (
    <>
      <div
        className={`fixed top-0 right-0 h-full w-[80%] max-w-[1300px] min-w-[200px] bg-black z-50 transform transition-transform duration-300 border-white border-l ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between p-4 items-start">
          {!!header && header}
          <button onClick={() => onClose()} className="text-white text-xl">
            ✕
          </button>
        </div>
        <div className="overflow-y-scroll h-full pt-4">{children}</div>
      </div>
      {isOpen && (
        <div
          style={{ opacity: "0.5" }}
          className="fixed bg-black top-0 bottom-0 left-0 right-0 h-full w-full z-49"
          onClick={() => onClose()}
        ></div>
      )}
    </>
  );
}