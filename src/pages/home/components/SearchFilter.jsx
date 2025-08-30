import { useState } from 'react';

export default function SearchFilter({ onSearch, onFilter }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [filters, setFilters] = useState({
    days: [],
    recruiting: null,
    leader: ''
  });

  const weekdays = ['월', '화', '수', '목', '금', '토', '일'];

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(keyword);
  };

  const handleDayToggle = (day) => {
    const newDays = filters.days.includes(day)
      ? filters.days.filter(d => d !== day)
      : [...filters.days, day];
    
    const newFilters = { ...filters, days: newDays };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleRecruitingFilter = (recruiting) => {
    const newFilters = { ...filters, recruiting };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleLeaderSearch = (leader) => {
    const newFilters = { ...filters, leader };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="px-4 py-3">
        <form onSubmit={handleSearch} className="flex items-center space-x-2 mb-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="활동을 검색해보세요"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:outline-none focus:bg-white focus:shadow-sm"
            />
            <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-2 rounded-lg transition-colors ${
              isFilterOpen ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600'
            }`}
          >
            <i className="ri-filter-line w-5 h-5 flex items-center justify-center"></i>
          </button>
        </form>

        {isFilterOpen && (
          <div className="space-y-4 pt-3 border-t border-gray-100">
            {/* 진행 요일 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">진행 요일</h4>
              <div className="flex flex-wrap gap-2">
                {weekdays.map((day) => (
                  <button
                    key={day}
                    onClick={() => handleDayToggle(day)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.days.includes(day)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* 모집 여부 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">모집 상태</h4>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRecruitingFilter(true)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.recruiting === true
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  모집중
                </button>
                <button
                  onClick={() => handleRecruitingFilter(false)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.recruiting === false
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  모집완료
                </button>
                <button
                  onClick={() => handleRecruitingFilter(null)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.recruiting === null
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  전체
                </button>
              </div>
            </div>

            {/* 팀장명 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">팀장명</h4>
              <input
                type="text"
                value={filters.leader}
                onChange={(e) => handleLeaderSearch(e.target.value)}
                placeholder="팀장명을 입력하세요"
                className="w-full px-3 py-2 bg-gray-50 border-none rounded-lg text-sm focus:outline-none focus:bg-white focus:shadow-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}