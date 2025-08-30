import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import TabBar from '../../components/feature/TabBar';
import ActivityCard from './components/ActivityCard';
import SearchFilter from './components/SearchFilter';
import { mockActivities } from '../../mocks/activities';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('전체');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filters, setFilters] = useState({
    days: [],
    recruiting: null,
    leader: ''
  });

  const categories = ['전체', '세션', '스터디', '프로젝트', '소모임', '행사'];

  const filteredActivities = useMemo(() => {
    return mockActivities.filter(activity => {
      // 카테고리 필터
      if (activeCategory !== '전체' && activity.category !== activeCategory) {
        return false;
      }

      // 검색 키워드 필터
      if (searchKeyword && !activity.title.toLowerCase().includes(searchKeyword.toLowerCase())) {
        return false;
      }

      // 요일 필터
      if (filters.days.length > 0) {
        const hasMatchingDay = filters.days.some(day => activity.schedule.includes(day));
        if (!hasMatchingDay) return false;
      }

      // 모집 상태 필터
      if (filters.recruiting !== null) {
        const isRecruiting = activity.currentMembers < activity.maxMembers;
        if (filters.recruiting !== isRecruiting) return false;
      }

      // 팀장명 필터
      if (filters.leader && !activity.leader.toLowerCase().includes(filters.leader.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [activeCategory, searchKeyword, filters]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">전체 활동</h1>
        </div>

        {/* 카테고리 탭 */}
        <div className="px-4 pb-3">
          <div className="flex space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <SearchFilter 
        onSearch={setSearchKeyword}
        onFilter={setFilters}
      />

      {/* 활동 리스트 */}
      <div className="px-4 py-4">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <i className="ri-inbox-line text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">조건에 맞는 활동이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>

      {/* FAB 버튼 */}
      <Link
        to="/create-activity"
        className="fixed bottom-20 right-4 w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-all z-30"
      >
        <i className="ri-add-line text-white text-xl"></i>
      </Link>

      <TabBar />
    </div>
  );
}