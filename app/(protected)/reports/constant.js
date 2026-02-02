export const reportConfigs = {
  "Cleaning Report": {
    description: "INCLUDES AI SCORES AND CLEANER COMPLIANCE METRICS",
    fields: [
      {
        type: "select",
        name: "status",
        label: "Status Filter",
        options: ["All Status", "Completed", "Pending"],
      },
      {
        type: "select",
        name: "zone",
        label: "Zone Selection",
        options: ["All Zones", "Dhantoli", "Dharampeth"],
      },
      {
        type: "select",
        name: "location",
        label: "Location / Washroom Node",
        options: ["All Locations", "Public Toilet 1"],
      },
      { type: "date-range", label: "Select Timeframe" },
    ],
  },
  "Washroom Report": {
    description: "VIEW SINGLE WASHROOM HYGIENE REPORT",
    fields: [
      {
        type: "select",
        name: "location",
        label: "Location / Washroom",
        options: ["All Locations", "Node A", "Node B"],
      },
      { type: "date-range", label: "Start Date", isStart: true },
      { type: "date-range", label: "End Date", isEnd: true },
      {
        type: "select",
        name: "status",
        label: "Status",
        options: ["All Status", "Clean", "Needs Attention"],
      },
    ],
  },
  "Cleaner Report": {
    description: "VIEW INDIVIDUAL CLEANER OR ALL CLEANERS PERFORMANCE",
    fields: [
      {
        type: "select",
        name: "location",
        label: "Location / Washroom",
        options: ["All Locations", "Main Block"],
      },
      {
        type: "select",
        name: "cleaner",
        label: "Cleaner",
        options: ["All Cleaners", "Rahul S.", "Priya M."],
      },
      { type: "date-range", label: "Start Date", isStart: true },
      { type: "date-range", label: "End Date", isEnd: true },
      {
        type: "select",
        name: "status",
        label: "Status",
        options: ["All Status", "Active", "Inactive"],
      },
    ],
  },
  "Washroom Hygiene Trend": {
    description: "VIEW DAILY HYGIENE SCORES ACROSS ALL WASHROOMS",
    fields: [
      { type: "date-range", label: "Start Date", isStart: true },
      {
        type: "date-range",
        label: "End Date",
        isEnd: true,
        description: "(Max 31 days from start)",
      },
    ],
  },
  "Detailed Cleaning Report": {
    description: "AGGREGATE PERFORMANCE METRICS FOR CLEANERS",
    fields: [
      {
        type: "select",
        name: "zone",
        label: "Zone / Location Type",
        options: ["All Zones", "Nagpur Urban", "Nagpur Rural"],
      },
      {
        type: "select",
        name: "location",
        label: "Location / Washroom",
        options: ["All Locations"],
      },
      {
        type: "date-single",
        label: "Choose Date",
        description: "Select a single date for detailed report",
      },
    ],
  },
};

export const reportData = [
  {
    id: 1,
    cleaner: "John Doe",
    zone: "Dhantoli",
    location: "Mehadiya Chowk",
    date: "22-12-2025",
    time: "09:00 AM",
    status: "Completed",
    score: 95,
  },
  {
    id: 2,
    cleaner: "Anil Saafai",
    zone: "Dharampeth",
    location: "Ramnagar Chowk",
    date: "22-12-2025",
    time: "10:30 AM",
    status: "In Progress",
    score: 82,
  },
  {
    id: 3,
    cleaner: "Priya Sharma",
    zone: "Civil Lines",
    location: "Sadar Bazaar",
    date: "22-12-2025",
    time: "11:15 AM",
    status: "Completed",
    score: 91,
  },
  {
    id: 4,
    cleaner: "Rahul Kumar",
    zone: "Mahal",
    location: "Tekdi Road",
    date: "22-12-2025",
    time: "02:00 PM",
    status: "Pending",
    score: 78,
  },
];
