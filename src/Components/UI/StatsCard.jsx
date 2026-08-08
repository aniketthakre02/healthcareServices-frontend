export const StatsCard = ({ title, value, icon: Icon }) => {
  return (
    <div className="p-5 rounded-2xl border shadow">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-black">{title}</p>
          <h2 className="text-2xl font-bold">{value}</h2>
        </div>
        <Icon className="w-8 h-8 text-primary" />
      </div>
    </div>
  );
};