export default function Modal({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div
          className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 my-auto max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-thin"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>
  );
}
