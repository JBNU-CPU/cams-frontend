// 후보 1 -> 페이지 스크롤 안하면 무한히 api요청 때림;;
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TabBar from '../../components/feature/TabBar';
import ActivityCard from './components/ActivityCard';
import SearchFilter from './components/SearchFilter';
import Header from '../../components/common/Header';
import { useNotifications } from '../../hooks/useNotifications';
import { getNotificationIcon, getNotificationColor } from '../../api/NotificationData'
import axiosInstance from '../../api/axiosInstance';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('전체');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filters, setFilters] = useState({ days: [], recruiting: null, leader: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const navigate = useNavigate();
  const { notificationList, unreadCount, dismissNotification, dismissAllNotifications } = useNotifications();
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const categories = ['전체', '세션', '스터디', '프로젝트', '소모임', '행사'];
  const [activities, setActivities] = useState([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 정기 일정 포맷 함수 (세션, 스터디, 프로젝트용)
  const formatRecurringSchedule = (schedules) => {
    if (!schedules || schedules.length === 0) return '일정 정보 없음';
    const dayMap = { MONDAY: '월', TUESDAY: '화', WEDNESDAY: '수', THURSDAY: '목', FRIDAY: '금', SATURDAY: '토', SUNDAY: '일' };
    const scheduleStrings = schedules.map(s => {
      const day = dayMap[s.dayOfWeek] || '';
      const startTime = s.startTime.substring(0, 5);
      const endTime = s.endTime.substring(0, 5);
      return `${day} ${startTime}~${endTime}`;
    });
    return `매주 ${scheduleStrings.join(' / ')}`;
  };

  // 특정일 일정 포맷 함수 (소모임, 행사용)
  const formatEventSchedule = (schedules) => {
    if (!schedules || schedules.length === 0) return '일정 정보 없음';
    const scheduleStrings = schedules.map(s => {
      const eventDate = new Date(s.startDateTime);
      const month = eventDate.getMonth() + 1;
      const day = eventDate.getDate();
      const hours = eventDate.getHours().toString().padStart(2, '0');
      const minutes = eventDate.getMinutes().toString().padStart(2, '0');
      return `${month}월 ${day}일 ${hours}:${minutes}`;
    });
    return scheduleStrings.join(' / ');
  };

  const mapApiDataToState = (apiActivity) => {
    const categoryMap = {
      SESSION: '세션',
      STUDY: '스터디',
      PROJECT: '프로젝트',
      MEETING: '소모임',
      GENERAL: '행사',
    };
    const statusMap = {
      NOT_STARTED: '모집 중',
      STARTED: '진행 중',
      ENDED: '마감',
    };

    // 활동 유형에 따라 다른 일정 포맷 함수를 사용
    let scheduleText = '';
    const recurringTypes = ['SESSION', 'STUDY', 'PROJECT'];
    if (recurringTypes.includes(apiActivity.activityType)) {
      scheduleText = formatRecurringSchedule(apiActivity.recurringSchedules);
    } else {
      scheduleText = formatEventSchedule(apiActivity.eventSchedules);
    }

    return {
      id: apiActivity.id,
      title: apiActivity.title,
      leader: apiActivity.createdBy,
      currentMembers: apiActivity.participantCount,
      maxMembers: apiActivity.maxParticipants,
      schedule: scheduleText, // 변환된 일정 텍스트 사용
      category: categoryMap[apiActivity.activityType] || apiActivity.activityType,
      description: apiActivity.description,
      status: statusMap[apiActivity.activityStatus] || '상태 미지정',
      goal: "", location: "", notice: "",
      curriculum: apiActivity.curriculums.map(c => ({ week: c.sequence, content: c.title })),
    };
  };

  const fetchActivities = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/api/activities?page=${page}&size=8`);
      const responseData = response.data;
      if (responseData && Array.isArray(responseData.content)) {
        const approvedActivities = responseData.content.filter(activity => activity.isApproved === true);
        const formattedData = approvedActivities.map(mapApiDataToState);

        setActivities(prevActivities => {
          const existingIds = new Set(prevActivities.map(act => act.id));
          const uniqueNewActivities = formattedData.filter(act => !existingIds.has(act.id));
          return [...prevActivities, ...uniqueNewActivities];
        });

        setHasMore(!responseData.last);

        if (approvedActivities.length === 0 && !responseData.last) {
          setPage(prevPage => prevPage + 1);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("활동 목록 불러오지 못했습니다.", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, hasMore, isLoading, mapApiDataToState]); // mapApiDataToState를 의존성 배열에 추가

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]); // fetchActivities를 의존성 배열에 추가

  const observer = useRef();
  const lastActivityElementRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      if (activeCategory !== '전체' && activity.category !== activeCategory) return false;
      if (searchKeyword && !activity.title.toLowerCase().includes(searchKeyword.toLowerCase())) return false;
      if (filters.days.length > 0) {
        const hasMatchingDay = filters.days.some(day => activity.schedule.includes(day));
        if (!hasMatchingDay) return false;
      }
      if (filters.recruiting !== null) {
        const isRecruiting = activity.currentMembers < activity.maxMembers;
        if (filters.recruiting !== isRecruiting) return false;
      }
      if (filters.leader && !activity.leader.toLowerCase().includes(filters.leader.toLowerCase())) return false;
      return true;
    });
  }, [activities, activeCategory, searchKeyword, filters]);

  return (
    <div className="relative min-h-screen bg-gray-50 pb-20">
      <Header
        title="전체 활동"
        unreadCount={unreadCount}
        isLoggedIn={isLoggedIn}
        onNotificationClick={() => setShowNotificationModal(true)}
      >
        <div className="flex space-x-2 overflow-x-auto">
          {categories.map((category) => (
            <button key={category} onClick={() => setActiveCategory(category)}
              className={`w-24 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
              }>
              {category}
            </button>
          ))}
        </div>
      </Header>

      <SearchFilter onSearch={setSearchKeyword} onFilter={setFilters} />

      <div className="px-4 py-4">
        {activities.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <i className="ri-inbox-line text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">조건에 맞는 활동이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity, index) => (
              <div
                key={activity.id}
                ref={index === filteredActivities.length - 1 ? lastActivityElementRef : null}
              >
                <ActivityCard activity={activity} />
              </div>
            ))}
          </div>
        )}
        {isLoading && hasMore && (
          <div className="text-center py-6">
            <i className="ri-loader-4-line text-3xl text-gray-400 animate-spin"></i>
          </div>
        )}
      </div>

      <Link
        to="/create-activity"
        className="absolute bottom-24 right-4 w-14 h-14 bg-purple-600 rounded-full
                flex items-center justify-center shadow-lg hover:opacity-90
                transition-all z-50">
        <i className="ri-add-line text-white text-xl"></i>
      </Link>
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">알림</h3>
                <button onClick={
                  () => setShowNotificationModal(false)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors" >
                  <i className="ri-close-line text-gray-600"></i>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto"> {
              notificationList.length === 0
                ? (<div className="text-center py-12">
                  <i className="ri-notification-off-line text-4xl text-gray-300 mb-4">
                  </i>
                  <p className="text-gray-500">새로운 알림이 없습니다.</p> </div>)
                : (<div className="divide-y divide-gray-100">
                  {notificationList.map((notification) => (
                    <div key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50' : ''}`} >
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                          <i className={`${getNotificationIcon(notification.type)} text-lg`}></i>
                        </div> <div className="flex-1 min-w-0"> <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900 truncate">{notification.title}</h4>
                          {!notification.isRead && (<div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2"></div>)}
                        </div> <p className="text-sm text-gray-600 mb-1">{notification.message}</p>
                          <p className="text-xs text-gray-500">{notification.time}</p>
                        </div>
                        <button onClick={() => dismissNotification(notification.id)}
                          className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                          aria-label="알림 삭제" >
                          <i className="ri-close-line text-lg"></i>
                        </button>
                      </div>
                    </div>))}
                </div>)}
            </div>
            {notificationList.length > 0 &&
              (<div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button onClick={() => { dismissAllNotifications(); setShowNotificationModal(false); }}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors" >
                  모든 알림 지우기
                </button> </div>)} </div> </div>
      )}

      <TabBar />
    </div>
  );
}


// 후보2 -> 미리 페이지 로딩 안하면 필터링 다른곳에서 안보이는 현상 존재함;;
// import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import TabBar from '../../components/feature/TabBar';
// import ActivityCard from './components/ActivityCard';
// import SearchFilter from './components/SearchFilter';
// import Header from '../../components/common/Header';
// import { useNotifications } from '../../hooks/useNotifications';
// import { getNotificationIcon, getNotificationColor } from '../../api/NotificationData'
// import axiosInstance from '../../api/axiosInstance';


// // --- 데이터 매핑 함수들을 컴포넌트 밖으로 이동 ---
// const formatRecurringSchedule = (schedules) => {
//   if (!schedules || schedules.length === 0) return '일정 정보 없음';
//   const dayMap = { MONDAY: '월', TUESDAY: '화', WEDNESDAY: '수', THURSDAY: '목', FRIDAY: '금', SATURDAY: '토', SUNDAY: '일' };
//   const days = schedules.map(s => dayMap[s.dayOfWeek] || '').join('/');
//   const time = schedules[0].startTime.substring(0, 5);
//   return `매주 ${days} ${time}`;
// };
// const formatEventSchedule = (schedules) => {
//   if (!schedules || schedules.length === 0) return '일정 정보 없음';
//   const firstEvent = new Date(schedules[0].startDateTime);
//   const month = firstEvent.getMonth() + 1;
//   const day = firstEvent.getDate();
//   const hours = firstEvent.getHours().toString().padStart(2, '0');
//   const minutes = firstEvent.getMinutes().toString().padStart(2, '0');
//   return `${month}월 ${day}일 ${hours}:${minutes}`;
// };
// const mapApiDataToState = (apiActivity) => {
//   const categoryMap = { SESSION: '세션', STUDY: '스터디', PROJECT: '프로젝트', MEETING: '소모임', GENERAL: '행사' };
//   const statusMap = { NOT_STARTED: '모집 중', STARTED: '진행 중', ENDED: '마감' };
//   let scheduleText = '';
//   const recurringTypes = ['SESSION', 'STUDY', 'PROJECT'];
//   if (recurringTypes.includes(apiActivity.activityType)) {
//     scheduleText = formatRecurringSchedule(apiActivity.recurringSchedules);
//   } else {
//     scheduleText = formatEventSchedule(apiActivity.eventSchedules);
//   }
//   return {
//     id: apiActivity.id, title: apiActivity.title, leader: apiActivity.createdBy,
//     currentMembers: apiActivity.participantCount, maxMembers: apiActivity.maxParticipants,
//     schedule: scheduleText, category: categoryMap[apiActivity.activityType] || apiActivity.activityType,
//     description: apiActivity.description, status: statusMap[apiActivity.activityStatus] || '상태 미지정',
//     goal: "", location: "", notice: "",
//     curriculum: apiActivity.curriculums ? apiActivity.curriculums.map(c => ({ week: c.sequence, content: c.title, })) : [],
//   };
// };


// export default function Home() {
//   const [activeCategory, setActiveCategory] = useState('전체');
//   const [searchKeyword, setSearchKeyword] = useState('');
//   const [filters, setFilters] = useState({ days: [], recruiting: null, leader: '' });

//   const [isLoggedIn, setIsLoggedIn] = useState(true);
//   const navigate = useNavigate();
//   const { notificationList, unreadCount, dismissNotification, dismissAllNotifications } = useNotifications();
//   const [showNotificationModal, setShowNotificationModal] = useState(false);
//   const categories = ['전체', '세션', '스터디', '프로젝트', '소모임', '행사'];

//   const [activities, setActivities] = useState([]);
//   const [page, setPage] = useState(0);
//   const [isLoading, setIsLoading] = useState(false);
//   const [hasMore, setHasMore] = useState(true);

//   const [refetchTrigger, setRefetchTrigger] = useState(0);

//   const handleCategoryChange = (category) => {
//     setActivities([]);
//     setPage(0);
//     setHasMore(true);
//     setActiveCategory(category);
//     setRefetchTrigger(c => c + 1);
//   };

//   const handleSearchChange = (keyword) => {
//     setActivities([]);
//     setPage(0);
//     setHasMore(true);
//     setSearchKeyword(keyword);
//     setRefetchTrigger(c => c + 1);
//   };

//   const handleFiltersChange = (newFilters) => {
//     setActivities([]);
//     setPage(0);
//     setHasMore(true);
//     setFilters(newFilters);
//     setRefetchTrigger(c => c + 1);
//   };

//   useEffect(() => {
//     if (!hasMore && page > 0) return;

//     const fetchActivities = async () => {
//       setIsLoading(true);
//       try {
//         const response = await axiosInstance.get(`/api/activities?page=${page}&size=8`);
//         const responseData = response.data;
//         if (responseData && Array.isArray(responseData.content)) {
//           const formattedData = responseData.content.map(mapApiDataToState);

//           // ❗❗ 핵심 수정 사항: 중복 데이터 제거 ❗❗
//           setActivities(prevActivities => {
//             const existingIds = new Set(prevActivities.map(act => act.id));
//             const uniqueNewActivities = formattedData.filter(act => !existingIds.has(act.id));
//             return [...prevActivities, ...uniqueNewActivities];
//           });

//           setHasMore(!responseData.last);
//         } else {
//           setHasMore(false);
//         }
//       } catch (err) {
//         console.error("활동 목록 불러오지 못했습니다.", err);
//         setHasMore(false);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchActivities();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [page, refetchTrigger]);

//   const observer = useRef();
//   const lastActivityElementRef = useCallback(node => {
//     if (isLoading) return;
//     if (observer.current) observer.current.disconnect();
//     observer.current = new IntersectionObserver(entries => {
//       if (entries[0].isIntersecting && hasMore) {
//         setPage(prevPage => prevPage + 1);
//       }
//     });
//     if (node) observer.current.observe(node);
//   }, [isLoading, hasMore]);

//   const filteredActivities = useMemo(() => {
//     return activities.filter(activity => {
//       if (activeCategory !== '전체' && activity.category !== activeCategory) return false;
//       if (searchKeyword && !activity.title.toLowerCase().includes(searchKeyword.toLowerCase())) return false;
//       if (filters.days.length > 0) {
//         const hasMatchingDay = filters.days.some(day => activity.schedule.includes(day));
//         if (!hasMatchingDay) return false;
//       }
//       if (filters.recruiting !== null) {
//         const isRecruiting = activity.currentMembers < activity.maxMembers;
//         if (filters.recruiting !== isRecruiting) return false;
//       }
//       if (filters.leader && !activity.leader.toLowerCase().includes(filters.leader.toLowerCase())) return false;
//       return true;
//     });
//   }, [activities, activeCategory, searchKeyword, filters]);

//   return (
//     <div className="min-h-screen bg-gray-50 pb-20">
//       <Header
//         title="전체 활동"
//         unreadCount={unreadCount}
//         isLoggedIn={isLoggedIn}
//         onNotificationClick={() => setShowNotificationModal(true)}
//       >
//         <div className="flex space-x-2 overflow-x-auto">
//           {categories.map((category) => (
//             <button key={category} onClick={() => handleCategoryChange(category)} className={`w-24 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
//               {category}
//             </button>
//           ))}
//         </div>
//       </Header>

//       <SearchFilter onSearch={handleSearchChange} onFilter={handleFiltersChange} />

//       <div className="px-4 py-4">
//         {activities.length === 0 && !isLoading ? (
//           <div className="text-center py-12">
//             <i className="ri-inbox-line text-4xl text-gray-300 mb-4"></i>
//             <p className="text-gray-500">조건에 맞는 활동이 없습니다.</p>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {filteredActivities.map((activity, index) => {
//               if (filteredActivities.length === index + 1) {
//                 return (
//                   <div ref={lastActivityElementRef} key={activity.id}>
//                     <ActivityCard activity={activity} />
//                   </div>
//                 );
//               } else {
//                 return <ActivityCard key={activity.id} activity={activity} />;
//               }
//             })}
//           </div>
//         )}
//         {isLoading && (
//           <div className="text-center py-6">
//             <i className="ri-loader-4-line text-3xl text-gray-400 animate-spin"></i>
//           </div>
//         )}
//       </div>

//       <Link to="/create-activity" className="fixed bottom-20 right-4 w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-all z-30">
//         <i className="ri-add-line text-white text-xl"></i>
//       </Link>

//       {showNotificationModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"> <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col"> <div className="px-6 py-4 border-b border-gray-100"> <div className="flex items-center justify-between"> <h3 className="text-lg font-semibold text-gray-900">알림</h3> <button onClick={() => setShowNotificationModal(false)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors" > <i className="ri-close-line text-gray-600"></i> </button> </div> </div> <div className="flex-1 overflow-y-auto"> {notificationList.length === 0 ? (<div className="text-center py-12"> <i className="ri-notification-off-line text-4xl text-gray-300 mb-4"></i> <p className="text-gray-500">새로운 알림이 없습니다.</p> </div>) : (<div className="divide-y divide-gray-100"> {notificationList.map((notification) => (<div key={notification.id} className={`p-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50' : ''}`} > <div className="flex items-start space-x-3"> <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}> <i className={`${getNotificationIcon(notification.type)} text-lg`}></i> </div> <div className="flex-1 min-w-0"> <div className="flex items-center justify-between mb-1"> <h4 className="font-medium text-gray-900 truncate">{notification.title}</h4> {!notification.isRead && (<div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2"></div>)} </div> <p className="text-sm text-gray-600 mb-1">{notification.message}</p> <p className="text-xs text-gray-500">{notification.time}</p> </div> <button onClick={() => dismissNotification(notification.id)} className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors" aria-label="알림 삭제" > <i className="ri-close-line text-lg"></i> </button> </div> </div>))} </div>)} </div> {notificationList.length > 0 && (<div className="px-6 py-4 bg-gray-50 border-t border-gray-100"> <button onClick={() => { dismissAllNotifications(); setShowNotificationModal(false); }} className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors" > 모든 알림 지우기 </button> </div>)} </div> </div>
//       )}

//       <TabBar />
//     </div>
//   );
// }


