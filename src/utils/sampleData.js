import { processComplaint } from './aiEngine.js';

function d(daysAgo, hoursAgo = 0) {
  const dt = new Date();
  dt.setDate(dt.getDate() - daysAgo);
  dt.setHours(dt.getHours() - hoursAgo);
  return dt.toISOString();
}

function mkHistory(status, createdAt, intermediate = []) {
  const hist = [{ status: 'pending', date: createdAt, note: 'Complaint received and queued.' }];
  intermediate.forEach(i => hist.push(i));
  return hist;
}

const RAW = [
  // Road complaints
  { title: 'Large pothole on Rajiv Gandhi Road causing accidents', description: 'There is a massive pothole on Rajiv Gandhi Road near bus stop 14. Two-wheelers have already fallen and people have been injured. The pothole has been there for over 3 months and every monsoon it gets worse. The entire stretch from the petrol pump to the school is dangerous for vehicles. Urgent road repair is needed immediately before someone is seriously hurt.', category: 'road', location: 'Rajiv Gandhi Road, Sector 12', lat: 28.6139, lng: 77.209, citizenName: 'Arun Mehta', citizenPhone: '9876543210', status: 'in_progress' },
  { title: 'Road completely broken near Central Market', description: 'The road near Central Market in Sector 5 has broken down completely. Large chunks of asphalt have come off and the underlying soil is exposed. It is causing severe traffic jams during peak hours and is dangerous for cyclists and pedestrians.', category: 'road', location: 'Central Market, Sector 5', lat: 28.6200, lng: 77.215, citizenName: 'Priya Sharma', citizenPhone: '9871234567', status: 'pending' },
  { title: 'Speed breaker missing on school zone road', description: 'The speed breaker near Delhi Public School on MG Road was washed away last month. Vehicles are now speeding through the school zone which is extremely dangerous for children. Please install a new speed breaker urgently.', category: 'road', location: 'MG Road near DPS School', lat: 28.6050, lng: 77.220, citizenName: 'Sunita Rao', citizenPhone: '9811112222', status: 'resolved' },
  { title: 'Road divider damaged blocking half lane', description: 'The concrete road divider on National Highway bypass has been broken and pieces are lying on the road. Half the lane is blocked causing major traffic issues every morning.', category: 'road', location: 'NH Bypass, Km 14', lat: 28.6300, lng: 77.230, citizenName: 'Vikram Singh', citizenPhone: '9812345678', status: 'pending' },
  { title: 'Pothole on main road near colony entrance', description: 'Big pothole near entrance of Shanti Nagar colony. Bikes falling daily. Need urgent repair.', category: 'road', location: 'Shanti Nagar Colony Gate', lat: 28.6180, lng: 77.208, citizenName: 'Deepak Kumar', citizenPhone: '9899887766', status: 'pending' },
  { title: 'Pothole causing danger at Shanti Nagar', description: 'There is a dangerous pothole at the entrance of Shanti Nagar. Several motorcycles have already fallen into it. Urgent repair required before more accidents happen. The colony residents are very frustrated.', category: 'road', location: 'Shanti Nagar, Main Gate', lat: 28.6182, lng: 77.2082, citizenName: 'Anita Joshi', citizenPhone: '9888776655', status: 'pending' }, // Duplicate of above

  // Water complaints
  { title: 'No water supply for 5 days in Block C', description: 'Residents of Block C, Vasant Kunj have had no water supply for 5 consecutive days. The entire community of around 200 families is severely affected. We are purchasing water tankers at personal expense. The municipal water board must immediately restore supply.', category: 'water', location: 'Block C, Vasant Kunj', lat: 28.5200, lng: 77.157, citizenName: 'Meera Pillai', citizenPhone: '9812233445', status: 'in_progress' },
  { title: 'Burst water pipe flooding the street', description: 'A main water pipe has burst on Sarojini Nagar Road and water is flooding the road and adjacent shops. Traffic is disrupted and the area is waterlogged. Immediate repair is needed.', category: 'water', location: 'Sarojini Nagar Main Road', lat: 28.5750, lng: 77.196, citizenName: 'Rajesh Tiwari', citizenPhone: '9823456789', status: 'in_progress' },
  { title: 'Contaminated muddy water supply in Sector 8', description: 'The water supply in our sector has been coming with mud and brown coloration for the past two weeks. Multiple residents have fallen sick after consuming this water. The government needs to urgently test and fix the contamination issue.', category: 'water', location: 'Sector 8, B Block', lat: 28.6100, lng: 77.240, citizenName: 'Fatima Khan', citizenPhone: '9834567890', status: 'pending' },
  { title: 'Water leakage from old pipeline near park', description: 'Old pipeline near Nehru Park has been leaking for weeks. Lot of water is getting wasted. Please repair it.', category: 'water', location: 'Nehru Park Road', lat: 28.5920, lng: 77.200, citizenName: 'Suresh Gupta', citizenPhone: '9845678901', status: 'resolved' },
  { title: 'Low water pressure in entire colony', description: 'Water pressure in Laxmi Nagar colony has been very low for the past month. On the upper floors, there is no water at all. Please check and fix the pumping issue.', category: 'water', location: 'Laxmi Nagar Colony', lat: 28.6350, lng: 77.278, citizenName: 'Kavya Reddy', citizenPhone: '9856789012', status: 'pending' },

  // Garbage complaints
  { title: 'Garbage dump not cleared for 10 days near hospital', description: 'The municipal garbage collection point near City Hospital has not been emptied for 10 days. The waste is piling up on the road, creating a health hazard for patients, visitors and hospital staff. The smell is unbearable and flies are everywhere. This needs to be cleared on emergency basis.', category: 'garbage', location: 'Near City Hospital, Main Road', lat: 28.6400, lng: 77.189, citizenName: 'Dr. Alok Verma', citizenPhone: '9867890123', status: 'pending' },
  { title: 'Illegal garbage dump near children playground', description: 'People are illegally dumping construction debris and household waste near the children playground in Green Park. Children cannot play there and the area looks terrible. Please remove this dump and put a proper notice.', category: 'garbage', location: 'Green Park Playground', lat: 28.5500, lng: 77.218, citizenName: 'Neerja Saxena', citizenPhone: '9878901234', status: 'pending' },
  { title: 'Overflowing dustbin on busy market street', description: 'The municipal dustbin at Lajpat Nagar market is overflowing with garbage. Shopkeepers are forced to sweep it manually. Garbage collection truck has not come for a week.', category: 'garbage', location: 'Lajpat Nagar Market', lat: 28.5650, lng: 77.243, citizenName: 'Mohit Bansal', citizenPhone: '9889012345', status: 'resolved' },
  { title: 'Garbage burning creating air pollution', description: 'Garbage is being burned near sector 18 market every evening. The smoke is causing breathing problems for elderly and children in the area. Please stop this burning and ensure regular garbage collection.', category: 'garbage', location: 'Sector 18 Market', lat: 28.6250, lng: 77.235, citizenName: 'Ritu Agarwal', citizenPhone: '9890123456', status: 'pending' },

  // Electricity complaints
  { title: 'Frequent power cuts in residential area – 8 hours daily', description: 'Our residential area in Pitampura is experiencing 8-10 hour power cuts daily for the past 3 weeks. People working from home are losing income. Medical equipment in homes is at risk. Elderly and children are suffering in extreme heat. This is a critical issue that needs urgent resolution.', category: 'electricity', location: 'Pitampura Residential Block D', lat: 28.7000, lng: 77.132, citizenName: 'Harish Choudhary', citizenPhone: '9801234567', status: 'in_progress' },
  { title: 'Exposed live electric wire hanging on road', description: 'A live electric wire has come loose from the electric pole and is hanging very low on the road near Model Town. It is extremely dangerous. People have already been shocked. Emergency action needed immediately.', category: 'electricity', location: 'Model Town, Road No. 4', lat: 28.7100, lng: 77.190, citizenName: 'Anand Krishnan', citizenPhone: '9812345670', status: 'in_progress' },
  { title: 'Transformer damaged after lightning strike', description: 'The transformer serving 3 streets in Defence Colony was damaged in a lightning strike two days ago. All 3 streets have no power. We need a replacement transformer urgently.', category: 'electricity', location: 'Defence Colony, Block R', lat: 28.5760, lng: 77.230, citizenName: 'Sarla Batra', citizenPhone: '9823456780', status: 'pending' },
  { title: 'Electricity meter not working', description: 'My electricity meter has stopped working for the past month and I have been getting estimated bills. Please send someone to check and repair the meter.', category: 'electricity', location: 'Mayur Vihar Phase 2', lat: 28.6070, lng: 77.295, citizenName: 'Pradeep Nair', citizenPhone: '9834567801', status: 'resolved' },

  // Drainage complaints
  { title: 'Entire street flooded due to blocked drainage', description: 'The main drainage channel on Tilak Nagar road is completely blocked by silt and garbage. Every time it rains, the entire street gets flooded and water enters ground floor houses. The situation has worsened every monsoon and this year is catastrophic for the community. Please clear the drain and waterlogging immediately.', category: 'drainage', location: 'Tilak Nagar, Main Street', lat: 28.6430, lng: 77.095, citizenName: 'Girish Pandey', citizenPhone: '9845678912', status: 'in_progress' },
  { title: 'Open manhole on busy road – dangerous hazard', description: 'A manhole cover has gone missing on the main road in Connaught Place. The open hole is a major danger for vehicles and pedestrians, especially at night. Someone could fall in. Please cover it immediately.', category: 'drainage', location: 'Connaught Place, Block F', lat: 28.6315, lng: 77.218, citizenName: 'Shalini Arora', citizenPhone: '9856789023', status: 'pending' },
  { title: 'Sewage water overflowing on residential streets', description: 'Sewage is overflowing from the sewer lines and running on the streets of Rohini Sector 22. The stench is unbearable and it is a serious health hazard. Children and elderly are at risk of disease.', category: 'drainage', location: 'Rohini Sector 22', lat: 28.7320, lng: 77.115, citizenName: 'Mukesh Yadav', citizenPhone: '9867890234', status: 'pending' },
  { title: 'Drain blocked near school creating mud puddles', description: 'The drain near Saraswati Vidya Mandir school is clogged and creating muddy water pools on the road. Children going to school have to wade through dirty water every day.', category: 'drainage', location: 'Near Saraswati Vidya Mandir, Karol Bagh', lat: 28.6520, lng: 77.190, citizenName: 'Umesh Trivedi', citizenPhone: '9878901345', status: 'resolved' },
  { title: 'Waterlogging in basement due to poor drainage', description: 'Our entire basement and ground floor have been flooded due to the broken drainage system on our street. Furniture is damaged. The waterlogging is due to blocked civic drains not our building. Need urgent pump out and drain repair.', category: 'drainage', location: 'Kirti Nagar, Street 7', lat: 28.6590, lng: 77.127, citizenName: 'Pooja Bhatt', citizenPhone: '9889012456', status: 'pending' },

  // Streetlight complaints
  { title: 'No streetlights in entire sector for 2 weeks', description: 'All streetlights in Sector 15, Dwarka have been non-functional for the past two weeks. The area is completely dark at night. Incidents of chain snatching and theft have increased. Women and elderly feel unsafe walking after evening. Please restore streetlights urgently.', category: 'streetlight', location: 'Sector 15, Dwarka', lat: 28.5921, lng: 77.046, citizenName: 'Nalini Srivastava', citizenPhone: '9890123567', status: 'pending' },
  { title: 'Broken streetlight pole fallen on road', description: 'A streetlight pole has fallen on the road near Azadpur metro station. It is blocking one lane and the live wire is a danger. Please remove it immediately.', category: 'streetlight', location: 'Near Azadpur Metro Station', lat: 28.7150, lng: 77.175, citizenName: 'Bhavesh Jain', citizenPhone: '9801234678', status: 'in_progress' },
  { title: 'Streetlights not working on highway service lane', description: 'The highway service lane from Noida sector 62 to sector 63 has no functional streetlights. It is pitch dark and very dangerous for motorists at night.', category: 'streetlight', location: 'NH-24 Service Lane, Noida', lat: 28.6271, lng: 77.373, citizenName: 'Ramesh Dubey', citizenPhone: '9812345789', status: 'pending' },
  { title: 'Street light outside park blinking and causing disturbance', description: 'The street light near Indira Gandhi Park has been blinking all night for 3 weeks. It disturbs sleep for residents in adjacent houses and also causes distraction to vehicles.', category: 'streetlight', location: 'Near Indira Gandhi Park, Sector 9', lat: 28.6510, lng: 77.320, citizenName: 'Sundar Lal', citizenPhone: '9823456891', status: 'resolved' },

  // More mixed
  { title: 'Road waterlogged after rain due to poor drainage', description: 'After every rainfall, the road in front of Nehru Place market gets completely waterlogged due to blocked storm drains. The shops and pedestrians are severely affected. Traffic comes to a standstill. This is a recurring problem every monsoon and authorities have done nothing.', category: 'drainage', location: 'Nehru Place Market, Ring Road', lat: 28.5482, lng: 77.251, citizenName: 'Satish Kapoor', citizenPhone: '9834567912', status: 'pending' },
  { title: 'Garbage pile near water supply line – contamination risk', description: 'A large pile of garbage has accumulated near the water supply line in our area. There is a serious risk of contamination if the garbage seeps into the pipe. Please remove the garbage and inspect the pipe.', category: 'garbage', location: 'Janakpuri, Block B Water Line', lat: 28.6280, lng: 77.085, citizenName: 'Leela Krishnamurthy', citizenPhone: '9845679023', status: 'pending' },
  { title: 'Electric wire sparking near garbage dump', description: 'There is a low hanging electric wire that is sparking near a garbage dump in Seelampur. This is a fire and electrical hazard. Urgent action needed.', category: 'electricity', location: 'Seelampur, Road 3', lat: 28.6750, lng: 77.274, citizenName: 'Imran Hussain', citizenPhone: '9856790134', status: 'pending' },
  { title: 'Pothole in front of government hospital – ambulances affected', description: 'There is a very deep pothole right in front of the government hospital main gate. Ambulances and emergency vehicles face difficulty. Several patients have been jolted badly. This is critical and life-threatening. Please repair immediately.', category: 'road', location: 'Govt. Hospital Main Gate, Sector 3', lat: 28.6010, lng: 77.205, citizenName: 'Bimla Devi', citizenPhone: '9867891245', status: 'pending' },
  { title: 'Water supply timing erratic – only 30 minutes per day', description: 'The water supply timing in our colony has become very unpredictable. Sometimes water comes for only 30 minutes at odd hours like 2 AM. Residents cannot fill water and daily life is severely disrupted.', category: 'water', location: 'Trilokpuri Colony, Block 22', lat: 28.6230, lng: 77.310, citizenName: 'Lalita Sharma', citizenPhone: '9878902456', status: 'in_progress' },
  { title: 'Drainage blocked – mosquito breeding near residential area', description: 'The drainage near our residential complex has been blocked for weeks. Stagnant water has formed a breeding ground for mosquitoes. Dengue and malaria cases are rising in the area. This is a public health emergency.', category: 'drainage', location: 'Inderpuri Residential Complex', lat: 28.6590, lng: 77.163, citizenName: 'Tarun Malhotra', citizenPhone: '9889013567', status: 'pending' },
  { title: 'Streetlights installed but never turned on in new colony', description: 'The new streetlights in our colony Phase 3 were installed 6 months ago but have never been switched on. The colony is in complete darkness every night. Please connect the lights to power supply.', category: 'streetlight', location: 'Phase 3, Paschim Vihar', lat: 28.6680, lng: 77.103, citizenName: 'Manisha Goswami', citizenPhone: '9890124678', status: 'pending' },
  { title: 'Road sign missing at dangerous Y-junction', description: 'The road sign and reflectors at the Y-junction near Dwarka Mor metro station are missing. This junction has had 4 accidents in the last month due to no visibility at night. Need urgent road signs.', category: 'road', location: 'Dwarka Mor Y-Junction', lat: 28.6170, lng: 77.058, citizenName: 'Avinash Kapoor', citizenPhone: '9801235789', status: 'in_progress' },
  { title: 'Faulty transformer making noise all night', description: 'The transformer near our colony entrance has been making a loud humming and buzzing noise all night. It is affecting the sleep of residents and also seems to be a technical fault that could cause fire.', category: 'electricity', location: 'Wazirpur Colony, Gate 2', lat: 28.6980, lng: 77.173, citizenName: 'Rajni Chawla', citizenPhone: '9812346890', status: 'pending' },
  { title: 'Garbage truck not collecting waste from our area', description: 'The municipal garbage truck has stopped coming to our area (Shahdara Block 5) for the past 3 weeks. We have been told to leave garbage on the road which is not acceptable. Please resume garbage collection immediately.', category: 'garbage', location: 'Shahdara Block 5', lat: 28.6720, lng: 77.288, citizenName: 'Ramkumar Prasad', citizenPhone: '9823457901', status: 'pending' },
  { title: 'Broken road in front of school – kids in danger', description: 'The road in front of Greenfield School in Najafgarh is completely broken with large potholes. School buses are struggling and parents are very worried about the safety of students. Immediate repair is needed before the next academic session.', category: 'road', location: 'Greenfield School Road, Najafgarh', lat: 28.6093, lng: 76.974, citizenName: 'Poonam Chandra', citizenPhone: '9834568012', status: 'pending' },
  { title: 'Water pipe broken – road dug up but not repaired', description: 'The water department dug up the road 3 weeks ago to repair a pipe but the road has not been restored. The dug up portion is causing accidents and is very dangerous.', category: 'road', location: 'Subhash Nagar, Road 5', lat: 28.6440, lng: 77.116, citizenName: 'Vinod Kapila', citizenPhone: '9845679123', status: 'in_progress' },
];

// Generate IDs and timestamps for sample data
let baseTime = Date.now() - 30 * 24 * 60 * 60 * 1000;

export function generateSampleComplaints() {
  const complaints = RAW.map((raw, idx) => {
    const createdAt = new Date(baseTime + idx * 18 * 60 * 60 * 1000).toISOString();
    const id = `CA-SAMPLE${String(idx + 1).padStart(3, '0')}`;
    const base = {
      id,
      ...raw,
      createdAt,
      updatedAt: createdAt,
      image: null,
      statusNote: '',
      assignedDepartment: '',
    };

    const ai = processComplaint(base, []);
    const statusHistory = [{ status: 'pending', date: createdAt, note: 'Complaint received and queued for review.' }];

    if (raw.status === 'in_progress') {
      const t = new Date(new Date(createdAt).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();
      statusHistory.push({ status: 'in_progress', date: t, note: 'Complaint assigned to department for action.' });
    }
    if (raw.status === 'resolved') {
      const t1 = new Date(new Date(createdAt).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();
      const t2 = new Date(new Date(createdAt).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();
      statusHistory.push({ status: 'in_progress', date: t1, note: 'Complaint assigned to department for action.' });
      statusHistory.push({ status: 'resolved', date: t2, note: 'Issue has been resolved and verified on-site.' });
    }

    return {
      ...base,
      category: ai.detectedCategory,
      aiSummary: ai.aiSummary,
      priorityScore: ai.priorityScore,
      priority: ai.priority,
      priorityReasons: ai.priorityReasons,
      duplicates: [],
      actionBrief: ai.actionBrief,
      aiProcessedAt: ai.processedAt,
      statusHistory,
    };
  });

  // Now compute duplicates across all
  return complaints.map(c => ({
    ...c,
    duplicates: complaints
      .filter(o => o.id !== c.id && o.category === c.category)
      .slice(0, 0), // real dup detection is expensive for 40; done on demand in aiEngine
  }));
}
