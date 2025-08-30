
export const mockActivities = [
  {
    id: '1',
    title: 'React 스터디 그룹',
    leader: '김철수',
    currentMembers: 8,
    maxMembers: 12,
    schedule: '매주 화/목',
    category: '스터디',
    description: 'React 기초부터 심화까지 함께 공부하는 스터디입니다.',
    goal: 'React로 실무 프로젝트를 완성할 수 있는 실력 향상',
    location: '강의실 A동 201호',
    notice: '노트북 필수 지참',
    status: '진행 중',
    curriculum: [
      { week: 1, content: 'React 기초 개념 및 환경 설정' },
      { week: 2, content: 'Component와 Props 이해하기' },
      { week: 3, content: 'State와 생명주기 메서드' },
      { week: 4, content: 'Hooks 활용하기' }
    ]
  },
  {
    id: '2',
    title: 'AI 프로젝트 팀',
    leader: '박영희',
    currentMembers: 4,
    maxMembers: 6,
    schedule: '매주 월/수/금',
    category: '프로젝트',
    description: 'AI 기술을 활용한 실제 서비스를 개발하는 프로젝트팀입니다.',
    goal: '머신러닝을 활용한 추천 시스템 구축',
    location: '컴퓨터실 B동 301호',
    notice: 'Python 기초 지식 필요',
    status: '진행 중',
    curriculum: [
      { week: 1, content: '프로젝트 기획 및 역할 분담' },
      { week: 2, content: '데이터 수집 및 전처리' },
      { week: 3, content: '모델 설계 및 구현' },
      { week: 4, content: '서비스 배포 및 테스트' }
    ]
  },
  {
    id: '3',
    title: '독서 모임',
    leader: '이민수',
    currentMembers: 6,
    maxMembers: 8,
    schedule: '매주 토',
    category: '소모임',
    description: '매주 한 권씩 책을 읽고 토론하는 독서 모임입니다.',
    goal: '독서 습관 형성 및 사고력 향상',
    location: '도서관 스터디룸',
    notice: '매주 책 구매 필요 (약 15,000원)',
    status: '진행 중',
    curriculum: [
      { week: 1, content: '자기계발서 - 아주 작은 습관의 힘' },
      { week: 2, content: '소설 - 82년생 김지영' },
      { week: 3, content: '경제서 - 부의 추월차선' },
      { week: 4, content: '철학서 - 사피엔스' }
    ]
  },
  {
    id: '4',
    title: 'UI/UX 디자인 세션',
    leader: '최지은',
    currentMembers: 10,
    maxMembers: 10,
    schedule: '매주 수',
    category: '세션',
    description: 'UI/UX 디자인 이론과 실습을 통해 디자인 감각을 기르는 세션입니다.',
    goal: '프로토타입 제작 및 사용자 경험 개선 능력 향상',
    location: '디자인실 C동 102호',
    notice: 'Figma 계정 필요',
    status: '모집완료',
    curriculum: [
      { week: 1, content: 'UI/UX 기본 개념 및 트렌드' },
      { week: 2, content: '사용자 리서치 방법론' },
      { week: 3, content: 'Figma를 활용한 프로토타입 제작' },
      { week: 4, content: '사용성 테스트 및 개선' }
    ]
  },
  {
    id: '5',
    title: '창업 아이디어 경진대회',
    leader: '정태현',
    currentMembers: 15,
    maxMembers: 20,
    schedule: '매주 금',
    category: '행사',
    description: '창업 아이디어를 발굴하고 사업계획서를 작성하는 경진대회입니다.',
    goal: '실현 가능한 비즈니스 모델 개발',
    location: '창업지원센터',
    notice: '최종 발표회 참석 필수',
    status: '승인 대기',
    curriculum: [
      { week: 1, content: '창업 아이디어 발굴 워크숍' },
      { week: 2, content: '시장 조사 및 경쟁사 분석' },
      { week: 3, content: '사업계획서 작성법' },
      { week: 4, content: '최종 발표 및 심사' }
    ]
  }
];
