export default function Loading() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/50">
      <div className="flex flex-col items-center justify-center gap-6 p-10 bg-white rounded-3xl shadow-2xl shadow-slate-100 border border-slate-100 animate-in fade-in duration-500">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-20 w-20 animate-ping rounded-full bg-blue-500/10" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-200"></div>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <p className="text-sm font-bold text-slate-700 uppercase tracking-widest">
            Please Wait
          </p>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
