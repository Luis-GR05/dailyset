export default function Logo() {
    return (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-700 to-primary-900 rounded-xl flex items-center justify-center shadow-lg shadow-primary-700/20">
                <span className="text-white font-bold text-xl">DS</span>
            </div>
            <span className="text-white font-black tracking-tight text-xl uppercase">DailySet</span>
        </div>
    );
}