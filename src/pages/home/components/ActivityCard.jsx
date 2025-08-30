import { Link } from 'react-router-dom';

export default function ActivityCard({ activity }) {
  const getCategoryColor = (category) => {
    const colors = {
      '세션': 'bg-blue-100 text-blue-700',
      '스터디': 'bg-green-100 text-green-700',
      '프로젝트': 'bg-purple-100 text-purple-700',
      '소모임': 'bg-orange-100 text-orange-700',
      '행사': 'bg-red-100 text-red-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Link to={`/activity/${activity.id}`}>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{activity.title}</h3>
            <p className="text-sm text-gray-600">팀장: {activity.leader}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(activity.category)}`}>
            {activity.category}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <i className="ri-group-line text-gray-400"></i>
              <span>{activity.currentMembers}/{activity.maxMembers}명</span>
            </div>
            <div className="flex items-center space-x-1">
              <i className="ri-calendar-line text-gray-400"></i>
              <span>{activity.schedule}</span>
            </div>
          </div>
          <i className="ri-arrow-right-s-line text-gray-300"></i>
        </div>
      </div>
    </Link>
  );
}