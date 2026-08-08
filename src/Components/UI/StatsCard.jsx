// eslint-disable-next-line no-unused-vars
export const StatsCard = ({ title, value, icon: Icon }) => {
  return (
    <div className="p-5 rounded-2xl border border-gray-100 shadow-sm bg-white hover:shadow-md transition">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h2 className="text-2xl font-bold text-gray-800 mt-1">{value}</h2>
        </div>
        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
          <Icon className="w-6 h-6 text-orange-500" />
        </div>
      </div>
    </div>
  );
};
