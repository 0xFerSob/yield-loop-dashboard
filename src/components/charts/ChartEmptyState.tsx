export default function ChartEmptyState({ label }: { label: string }) {
  return (
    <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-4">
      <div className="flex items-center justify-center h-[240px] text-gray-500 text-sm">
        {label}
      </div>
    </div>
  );
}
