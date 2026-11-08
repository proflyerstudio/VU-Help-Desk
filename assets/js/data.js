/* Static reference content copied exactly from the original VU Student Help Website (client/src/data.ts).
   FAQ answers, grade scale, exam-centre addresses, guide steps and quiz bank are unchanged.
   Exam-centre addresses are reproduced as-is, including any '(confirm exact address…)' notes.
   Always confirm time-sensitive details on VULMS / vu.edu.pk. */
// Static reference content for the VU Student Help Website.
// FAQ answers, the grade scale and passing rules reflect VU's published
// academic regulations (researched from VU student handbook summaries);
// exam-centre addresses come from VU's official campus announcements.
// Always confirm time-sensitive details on VULMS / vu.edu.pk.


const FAQ_CATEGORIES = [
  "Admissions",
  "VULMS & Accounts",
  "Fees",
  "Assignments, Quizzes & GDB",
  "Exams & Datesheet",
  "Results & CGPA",
  "Degree & Campus",
];

const FAQS = [
  // ---- Admissions (7)
  { cat: "Admissions", q: "How do I apply for admission to Virtual University?", a: "Apply online through the VU admissions portal on vu.edu.pk when admissions open (usually twice a year, Spring and Fall). Fill the form, upload your documents, pay the admission processing fee via the generated challan, and wait for the merit list / confirmation email." },
  { cat: "Admissions", q: "What documents do I need for admission?", a: "You typically need your CNIC/B-Form, recent photographs, and attested copies of your academic certificates (Matric, Intermediate, and Bachelor's if applying to a Master's program). Keep scanned copies ready before you start the online form." },
  { cat: "Admissions", q: "Can I apply if my result is awaited?", a: "Yes. VU usually allows result-awaiting students to apply; you must submit your result card as soon as it is announced, otherwise your admission can be cancelled. Check the exact condition on the admission advertisement for your session." },
  { cat: "Admissions", q: "Does VU have an entry test?", a: "Most undergraduate programs do not require an entry test; admission is merit-based on your previous qualifications. Some MS programs may require GAT (General) or an interview — always check the prospectus for your program." },
  { cat: "Admissions", q: "Can I change my study program after admission?", a: "Yes, VU allows program conversion in the first semesters through an online application on VULMS / the admission portal, subject to eligibility and availability. A conversion fee may apply." },
  { cat: "Admissions", q: "Can I study from outside Pakistan?", a: "Yes, overseas students can study at VU, but examinations must be taken at designated VU exam centres. Overseas students should confirm the exam arrangements for their country with the university before enrolling." },
  { cat: "Admissions", q: "What is the difference between a VU own campus and a virtual campus (PVC)?", a: "Own campuses are run directly by VU; private virtual campuses (PVCs) are affiliated centres that provide labs, exam facilities and local support. Your degree and LMS access are identical either way — the campus is mainly your exam and support point." },
  // ---- VULMS & Accounts (8)
  { cat: "VULMS & Accounts", q: "What is VULMS and where do I log in?", a: "VULMS (vulms.vu.edu.pk) is VU's Learning Management System — your lectures, announcements, assignments, quizzes, GDBs, grades and fee records all live there. Log in with the student ID and password VU emails you after admission." },
  { cat: "VULMS & Accounts", q: "I forgot my VULMS password. What should I do?", a: "Use the 'Forgot Password' option on the VULMS login page; the reset link goes to the email address registered with VU. If you no longer have access to that email, contact your campus or the VU helpdesk to update it." },
  { cat: "VULMS & Accounts", q: "Where do I watch my lectures?", a: "Lectures are linked inside each course on VULMS (and on VU's YouTube channels / VUTube). On VULMS, open your course, go to the lectures section, and follow them in order — most courses have 45 lectures per semester." },
  { cat: "VULMS & Accounts", q: "Where can I download handouts and course material?", a: "Each course page on VULMS has a downloads section with handouts (PDF), slides and reading material. Download them at the start of the semester so you can study offline." },
  { cat: "VULMS & Accounts", q: "How do I check announcements and due dates?", a: "The VULMS home page and each course's announcement section list assignment, quiz and GDB due dates. Check daily — VU does not extend deadlines because a student missed an announcement." },
  { cat: "VULMS & Accounts", q: "My VULMS account is blocked. Why?", a: "Accounts are commonly blocked for unpaid fee installments. Pay the outstanding dues, and the account is usually unblocked automatically within a working day. If it stays blocked, raise a ticket via the VU support system." },
  { cat: "VULMS & Accounts", q: "How do I select my courses for the semester?", a: "During the course selection window, log in to VULMS, open 'Course Selection', and pick courses within your allowed credit-hour limit. Your selection becomes final (and fee is generated) once the window closes, so choose carefully." },
  { cat: "VULMS & Accounts", q: "Can I freeze my semester?", a: "Yes, semester freeze is available through an online application on VULMS within the announced window. Frozen semesters do not count toward your degree duration in the same way, but read the freeze policy carefully before applying." },
  // ---- Fees (6)
  { cat: "Fees", q: "How do I pay my VU fee?", a: "Download the fee challan from VULMS (Accounts section) and pay it at any branch of the designated banks, or through supported mobile/internet banking apps using the challan/consumer number. Keep the paid receipt until the payment shows in VULMS." },
  { cat: "Fees", q: "Can I pay my fee in installments?", a: "Yes, VU usually allows the semester fee to be paid in installments according to the schedule shown on your challan/VULMS. Missing an installment deadline can block your VULMS account and exam entry." },
  { cat: "Fees", q: "My fee payment is not showing in VULMS. What now?", a: "Bank payments usually reflect within 1–2 working days. If it still does not show, submit the paid challan copy through the VU support/ticket system or visit your campus with the receipt." },
  { cat: "Fees", q: "Does VU offer scholarships or fee concessions?", a: "Yes — merit scholarships are awarded each semester based on CGPA/performance, and need-based assistance is considered on application. Gold medalists and top position holders also receive recognition. Check the scholarships section on vu.edu.pk." },
  { cat: "Fees", q: "What happens if I pay the fee late?", a: "Late payment can attract a late fee and, more importantly, your VULMS account can be blocked — which means no assignment or quiz submission. Always pay before the last date printed on the challan." },
  { cat: "Fees", q: "Is the admission fee refundable?", a: "Fee refund follows VU's refund policy depending on when you withdraw (before/after classes start). Apply for admission withdrawal through the proper channel as early as possible to maximise any refund." },
  // ---- Assignments, Quizzes & GDB (9)
  { cat: "Assignments, Quizzes & GDB", q: "What happens if I miss an assignment deadline?", a: "Late assignments are generally not accepted on VULMS — the upload link closes at the deadline. Submit at least a few hours early; server rush and load-shedding at the last minute are the most common reasons students lose these marks." },
  { cat: "Assignments, Quizzes & GDB", q: "In which format should I upload my assignment?", a: "Follow the instructions on the assignment page exactly — most require a single .doc/.docx or PDF file, sometimes a .zip for programming tasks. Wrong format or a corrupt file means zero marks, so re-download your upload to verify it." },
  { cat: "Assignments, Quizzes & GDB", q: "What is a GDB and how is it graded?", a: "A Graded Discussion Board is a short written response (usually on the course discussion board) on a given topic within a 2–3 day window. It carries a small weight (commonly 2–5%) and is graded on relevance, clarity and originality — copied content is penalised." },
  { cat: "Assignments, Quizzes & GDB", q: "How do online quizzes work at VU?", a: "Quizzes open inside the course on VULMS for a limited window (often 24–48 hours) with a per-quiz timer once you start. You cannot pause: answer all questions and submit before the timer ends. A stable internet connection is essential." },
  { cat: "Assignments, Quizzes & GDB", q: "What is the typical weightage of assessments in a course?", a: "A very common scheme is: Assignments 10%, Quizzes 3–10%, GDB 2–5%, Midterm 35%, Final term 50%. Your exact scheme is shown on your course page on VULMS under the grading scheme — always check it for each course." },
  { cat: "Assignments, Quizzes & GDB", q: "What is the passing rule for a course?", a: "Three conditions must all be met: (1) at least 20% in the formative part (assignments + quizzes + GDB + midterm, i.e. the first half), (2) at least 20% in the final term exam, and (3) at least 40% aggregate overall. Failing any one of them means failing the course." },
  { cat: "Assignments, Quizzes & GDB", q: "Is copying from the internet or other students punished?", a: "Yes. VU uses plagiarism detection; copied assignments and GDBs receive zero, and repeated offences can lead to disciplinary action including failing the course. Write in your own words and cite sources where needed." },
  { cat: "Assignments, Quizzes & GDB", q: "I uploaded the wrong assignment file. Can I fix it?", a: "If the deadline has not passed, most courses allow you to upload again — the latest submission replaces the old one. After the deadline there is no way to change it, which is why verifying your upload matters." },
  { cat: "Assignments, Quizzes & GDB", q: "How many lectures should I watch per week?", a: "A full-time load of 5–6 courses means roughly 15–18 lectures a week. Students who watch lectures daily almost never cram; use the Study Routine Builder on this site to spread them across your week." },
  // ---- Exams & Datesheet (8)
  { cat: "Exams & Datesheet", q: "Where are VU exams held?", a: "Midterm and final term exams are held physically at VU campuses and designated exam centres across Pakistan (and select overseas locations). You choose your exam city when making your datesheet on VULMS." },
  { cat: "Exams & Datesheet", q: "How do I make my datesheet?", a: "When the datesheet window opens, log in to VULMS, open the datesheet section, select your exam city/centre, and assign each course a date and session from the available slots. Save and print your roll number slip — you cannot sit the exam without it." },
  { cat: "Exams & Datesheet", q: "Can I change my datesheet after submitting?", a: "VU usually allows limited changes within the datesheet-making window, subject to seat availability at the centre. After the window closes, changes are generally not possible, so plan gaps between tough papers carefully." },
  { cat: "Exams & Datesheet", q: "What should I bring to the exam centre?", a: "Your printed roll number slip, original CNIC (and student ID card if issued). Arrive at least 30 minutes early. Mobile phones and smart watches are not allowed inside the exam hall." },
  { cat: "Exams & Datesheet", q: "What if I miss an exam?", a: "A missed paper is marked absent and the course must be repeated in a later semester — VU does not hold re-sits for absentees except in formally approved extraordinary cases. Protect your datesheet plan and set reminders." },
  { cat: "Exams & Datesheet", q: "How many papers can I take in one day?", a: "The datesheet system offers morning and evening sessions; taking two papers in one day is possible but exhausting. Most students do best with at least one free day between heavy subjects — test your plan in the Datesheet Scheduler here." },
  { cat: "Exams & Datesheet", q: "When are midterm and final term exams held?", a: "A semester is roughly 18 weeks: midterm around week 8–9 and final term at the end. Exact dates are announced in the academic calendar on vu.edu.pk and on VULMS each semester." },
  { cat: "Exams & Datesheet", q: "I have a clash or a problem at my exam centre. Who do I contact?", a: "Report centre issues to the centre superintendent on the spot, and follow up through the examination department via the VU support system. For choosing a reliable centre in the first place, read student reviews in the Exam Center Navigator on this site." },
  // ---- Results & CGPA (7)
  { cat: "Results & CGPA", q: "How is my GPA calculated?", a: "Each course's grade converts to grade points (A = 4.00, A- = 3.67, B+ = 3.33, B = 3.00, B- = 2.67, C+ = 2.33, C = 2.00, C- = 1.67, D+ = 1.33, D = 1.00, F = 0). Multiply by the course's credit hours, add everything, and divide by total credit hours." },
  { cat: "Results & CGPA", q: "What is the difference between GPA and CGPA?", a: "GPA is for one semester; CGPA is the credit-weighted average of all semesters so far. Your CGPA is what appears on your transcript and decides scholarships and degree eligibility." },
  { cat: "Results & CGPA", q: "What minimum CGPA do I need to graduate?", a: "You need a minimum CGPA of 2.00 to be awarded an undergraduate degree at VU. If your CGPA falls below the required threshold, you may be placed on probation and must improve it within the allowed semesters." },
  { cat: "Results & CGPA", q: "Where can I see my result?", a: "Results are published on VULMS in the grade book / result section after each exam session. VU announces result dates on VULMS and its official social media pages." },
  { cat: "Results & CGPA", q: "I think my paper was marked wrongly. Can I get a recheck?", a: "Yes, VU opens a paper rechecking window after results. Apply through VULMS within the announced dates (a small fee per paper applies). Rechecking verifies totalling and unmarked questions — it is not a re-marking of answers." },
  { cat: "Results & CGPA", q: "If I repeat a failed course, which grade counts?", a: "When you repeat a course, the better grade is counted toward your CGPA, but the F grade's credit hours affect your CGPA until the course is passed — one F can pull a CGPA down sharply, so repeat failures as early as possible." },
  { cat: "Results & CGPA", q: "Does VU use relative grading?", a: "Yes, VU applies relative grading — your final grade also depends on the overall performance of the class in that course, which is why grade boundaries can shift slightly between semesters. Use the CGPA Target Planner here to plan with the standard grade-point table." },
  // ---- Degree & Campus (5)
  { cat: "Degree & Campus", q: "How do I apply for my degree and transcript?", a: "After completing all requirements, apply for the degree/transcript through VULMS or the VU website's degree application section, pay the prescribed fee, and provide your postal address. Degrees are also conferred at convocation ceremonies." },
  { cat: "Degree & Campus", q: "How many credit hours does a BS degree require?", a: "Most VU BS (4-year) programs require around 130–134 credit hours over 8 semesters. Your exact requirement is in your program's study scheme on VULMS — set it in the Degree Progress Dashboard here to track yourself accurately." },
  { cat: "Degree & Campus", q: "Can I transfer credits from another university to VU?", a: "Credit transfer/exemption is possible for courses passed at HEC-recognised institutions with matching content and grades, subject to VU's exemption rules and a maximum transferable limit. Apply with transcripts at admission time." },
  { cat: "Degree & Campus", q: "What is the maximum duration to complete my degree?", a: "Every program has a maximum completion window (for example, a 4-year BS must typically be finished within 6 years). Exceeding it can cancel your enrolment, so avoid freezing or skipping many semesters." },
  { cat: "Degree & Campus", q: "Who do I contact when I have a problem VU hasn't solved?", a: "Use the online support/ticket system linked from VULMS for official matters (accounts, fees, exams), visit your nearest campus for in-person help, and ask fellow students in the Questions section here for experience-based guidance." },
];


const GRADE_SCALE = [
  { grade: "A", points: 4.0, range: "85–100%" },
  { grade: "A-", points: 3.67, range: "80–84%" },
  { grade: "B+", points: 3.33, range: "75–79%" },
  { grade: "B", points: 3.0, range: "71–74%" },
  { grade: "B-", points: 2.67, range: "68–70%" },
  { grade: "C+", points: 2.33, range: "64–67%" },
  { grade: "C", points: 2.0, range: "61–63%" },
  { grade: "C-", points: 1.67, range: "58–60%" },
  { grade: "D+", points: 1.33, range: "54–57%" },
  { grade: "D", points: 1.0, range: "50–53%" },
  { grade: "F", points: 0, range: "Below 50%" },
];

const GRADE_POINTS = Object.fromEntries(
  GRADE_SCALE.map((g) => [g.grade, g.points]),
);


const CENTRES = [
  { id: "lahore-hq", city: "Lahore", campus: "M.A. Jinnah Campus (Head Office)", address: "Defence Road, Off Raiwind Road, Lahore", province: "Punjab", facilities: ["Exam halls", "Computer labs", "Student services", "Library corner"] },
  { id: "lahore-ft", city: "Lahore", campus: "Faisal Town Campus", address: "34-A, Block B, Faisal Town, Lahore", province: "Punjab", facilities: ["Exam halls", "Computer labs", "Help desk"] },
  { id: "islamabad", city: "Islamabad", campus: "Islamabad Campus (Blue Area)", address: "9-E, Rizwan Plaza, Blue Area, Islamabad", province: "Capital", facilities: ["Exam halls", "Computer labs", "Student services"] },
  { id: "karachi-sf", city: "Karachi", campus: "Shahrah-e-Faisal Campus", address: "A-21, KCHS, Near Duty Free Centre, Baloch Colony Bus Stop, Main Shahrah-e-Faisal, Karachi", province: "Sindh", facilities: ["Exam halls", "Computer labs", "Help desk"] },
  { id: "karachi-nn", city: "Karachi", campus: "North Nazimabad Campus", address: "Block D, Near Five Star Chowrangi, North Nazimabad, Karachi", province: "Sindh", facilities: ["Exam halls", "Computer labs"] },
  { id: "rawalpindi", city: "Rawalpindi", campus: "Rawalpindi Campus", address: "Satellite Town area, Rawalpindi (confirm exact block on vu.edu.pk campus list)", province: "Punjab", facilities: ["Exam halls", "Computer labs", "Student services"] },
  { id: "faisalabad", city: "Faisalabad", campus: "Faisalabad Campus", address: "P-17/1, Bilal Road, New Civil Lines, Faisalabad", province: "Punjab", facilities: ["Exam halls", "Computer labs", "Help desk"] },
  { id: "multan", city: "Multan", campus: "Multan Campus", address: "23/3, Officers Colony, Near Chungi No. 9, Bosan Road, Multan", province: "Punjab", facilities: ["Exam halls", "Computer labs", "Student services"] },
  { id: "gujranwala", city: "Gujranwala", campus: "Gujranwala Campus", address: "Near Jamia Muhammadia, Kangniwala, G.T. Road, Gujranwala", province: "Punjab", facilities: ["Exam halls", "Computer labs"] },
  { id: "peshawar", city: "Peshawar", campus: "Peshawar Campus", address: "8-Jamrud Road, Tehkal Bala, Adjacent Toyota Frontier Motors, Peshawar", province: "KPK", facilities: ["Exam halls", "Computer labs", "Help desk"] },
  { id: "quetta", city: "Quetta", campus: "Quetta Campus", address: "B-1, Model Town, Quetta", province: "Balochistan", facilities: ["Exam halls", "Computer labs"] },
  { id: "hyderabad", city: "Hyderabad", campus: "Hyderabad Campus", address: "Near McDonald's, Main Auto Bhan Road, Latifabad, Hyderabad", province: "Sindh", facilities: ["Exam halls", "Computer labs"] },
  { id: "sialkot", city: "Sialkot", campus: "Sialkot Campus", address: "Sialkot city campus (confirm exact address on vu.edu.pk campus list)", province: "Punjab", facilities: ["Exam halls", "Computer labs"] },
  { id: "bahawalpur", city: "Bahawalpur", campus: "Bahawalpur Campus", address: "Bahawalpur city campus (confirm exact address on vu.edu.pk campus list)", province: "Punjab", facilities: ["Exam halls", "Computer labs"] },
];


const GUIDE_STEPS = [
  { id: "admission-confirm", phase: "Week 0 · Admission", title: "Confirm your admission & save your student ID", detail: "After the merit list, pay your admission dues and note your Student ID (e.g. bc…/mc…) from the confirmation email. This ID is your identity for VULMS, exams and every official request.", tip: "Screenshot the confirmation email and keep a copy in your phone gallery." },
  { id: "vulms-login", phase: "Week 0 · Admission", title: "Log in to VULMS for the first time", detail: "Go to vulms.vu.edu.pk, sign in with your student ID and the password emailed to you, then change the password and verify your email and mobile number in your profile.", tip: "Never share your VULMS password — no teacher or senior will ever ask for it." },
  { id: "explore-courses", phase: "Week 1 · Orientation", title: "Explore your courses & download handouts", detail: "Open each enrolled course, read its description and grading scheme, and download the handouts PDF. Knowing the weightage (assignments, quizzes, midterm, final) tells you where the marks live.", tip: "Create a folder per course on your phone/laptop on day one — future you says thanks." },
  { id: "lecture-rhythm", phase: "Week 1 · Orientation", title: "Set a daily lecture rhythm", detail: "VU courses have ~45 lectures. Watching 3 lectures a day per course load keeps you ahead. Use the Study Routine Builder on this site to generate a weekly plan around your job or family time.", tip: "Morning lectures + same-day 10-minute revision beats weekend cramming every time." },
  { id: "first-assignment", phase: "Weeks 2–3 · First tasks", title: "Submit your first assignment — early", detail: "Open the assignment from your course page, read the instructions twice, prepare the file in the exact format asked, upload it, then re-download it from VULMS to confirm it opens correctly.", tip: "Submit 24 hours before the deadline. Last-hour uploads are the #1 cause of zero marks." },
  { id: "first-quiz-gdb", phase: "Weeks 2–4 · First tasks", title: "Attempt your first quiz and GDB calmly", detail: "Quizzes are timed and cannot be paused — sit somewhere quiet with stable internet. For GDBs, write a short, original, to-the-point answer in your own words before the board closes.", tip: "Draft GDB answers in the GDB Drafter here first, check the character count, then paste." },
  { id: "fee-routine", phase: "Monthly · Money", title: "Make fee payment a routine", detail: "Download each installment challan from VULMS, pay before the last date, and keep receipts until the payment appears in your account. A blocked VULMS account during quiz week is a nightmare you can avoid.", tip: "Set a phone reminder 3 days before every installment due date." },
  { id: "midterm-prep", phase: "Week 8–9 · Midterm", title: "Prepare for midterm like a pro", detail: "Revise lectures 1–22 (roughly the first half), solve past papers, and attempt practice quizzes. Check your exam centre and reach 30 minutes early with your roll number slip and CNIC.", tip: "Test yourself with the Quiz Practice Engine here to build exam-speed clicking." },
  { id: "datesheet", phase: "Week 15+ · Finals", title: "Make a smart datesheet", detail: "When the datesheet window opens, choose your exam city and spread tough subjects with gaps. Then print your roll number slip immediately — don't leave it for the last day.", tip: "Plan your datesheet in the Datesheet Scheduler here before touching the real one." },
  { id: "results-reflect", phase: "After results", title: "Read your result & plan the next semester", detail: "Check your grade book on VULMS, compute your CGPA with the planner here, repeat any failed course early, and select next semester's courses within the course-selection window.", tip: "One F repeated early costs far less CGPA than one F ignored for three semesters." },
];


const QUIZ_BANK = [
  { subject: "CS101 · Computer Science", q: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Control Processing Unit"], answer: 0, explain: "CPU = Central Processing Unit, the processor that executes instructions." },
  { subject: "CS101 · Computer Science", q: "Which of these is an input device?", options: ["Monitor", "Printer", "Keyboard", "Speaker"], answer: 2, explain: "A keyboard sends data into the computer; the others are output devices." },
  { subject: "CS101 · Computer Science", q: "How many bits are in one byte?", options: ["4", "8", "16", "32"], answer: 1, explain: "One byte = 8 bits." },
  { subject: "CS101 · Computer Science", q: "Which memory is volatile (loses data when power is off)?", options: ["ROM", "Hard disk", "RAM", "SSD"], answer: 2, explain: "RAM is volatile; storage devices and ROM are non-volatile." },
  { subject: "MTH101 · Mathematics", q: "What is the derivative of x²?", options: ["x", "2x", "x²/2", "2"], answer: 1, explain: "Power rule: d/dx(xⁿ) = n·xⁿ⁻¹, so d/dx(x²) = 2x." },
  { subject: "MTH101 · Mathematics", q: "What is the value of log₁₀(1000)?", options: ["2", "3", "10", "100"], answer: 1, explain: "10³ = 1000, so log₁₀(1000) = 3." },
  { subject: "MTH101 · Mathematics", q: "If f(x) = 3x + 5, what is f(4)?", options: ["12", "17", "20", "32"], answer: 1, explain: "f(4) = 3(4) + 5 = 17." },
  { subject: "ENG101 · English", q: "Choose the correct sentence:", options: ["She don't like tea.", "She doesn't likes tea.", "She doesn't like tea.", "She not like tea."], answer: 2, explain: "With doesn't, the main verb stays in base form: 'She doesn't like tea.'" },
  { subject: "ENG101 · English", q: "What is the synonym of 'rapid'?", options: ["Slow", "Swift", "Weak", "Late"], answer: 1, explain: "Rapid and swift both mean fast." },
  { subject: "ENG101 · English", q: "Which is a proper noun?", options: ["city", "river", "Lahore", "school"], answer: 2, explain: "Lahore names a specific place, so it is a proper noun and is capitalised." },
  { subject: "MGT101 · Management", q: "Which management function involves setting goals and deciding how to achieve them?", options: ["Organising", "Planning", "Leading", "Controlling"], answer: 1, explain: "Planning is the function of setting objectives and courses of action." },
  { subject: "MGT101 · Management", q: "In SWOT analysis, 'O' stands for:", options: ["Objectives", "Operations", "Opportunities", "Outcomes"], answer: 2, explain: "SWOT = Strengths, Weaknesses, Opportunities, Threats." },
  { subject: "STA301 · Statistics", q: "What is the mean of 4, 8, 6, 10, 2?", options: ["5", "6", "7", "8"], answer: 1, explain: "Sum = 30, count = 5, mean = 30/5 = 6." },
  { subject: "STA301 · Statistics", q: "The middle value of an ordered data set is called the:", options: ["Mean", "Mode", "Median", "Range"], answer: 2, explain: "The median is the middle value when data is arranged in order." },
  { subject: "CS201 · Programming", q: "In C++, which symbol ends most statements?", options: [".", ",", ";", ":"], answer: 2, explain: "Statements in C++ end with a semicolon." },
  { subject: "CS201 · Programming", q: "Which loop runs at least once even if the condition is false?", options: ["for loop", "while loop", "do-while loop", "foreach loop"], answer: 2, explain: "A do-while loop checks its condition after the first execution." },
  // ---- Added 2026-11-08: 18 more original practice questions (3 per subject) ----
  { subject: "CS101 · Computer Science", q: "Which of these is an operating system?", options: ["Microsoft Word", "Windows", "Google Chrome", "Adobe Reader"], answer: 1, explain: "Windows is an operating system; the others are applications that run on one." },
  { subject: "CS101 · Computer Science", q: "What does WWW stand for?", options: ["World Wide Web", "World Web Window", "Wide World Web", "Web World Wide"], answer: 0, explain: "WWW = World Wide Web, the system of linked pages on the internet." },
  { subject: "CS101 · Computer Science", q: "Which storage unit is the largest?", options: ["Kilobyte", "Megabyte", "Gigabyte", "Byte"], answer: 2, explain: "1 Gigabyte = 1024 Megabytes, so it is the largest of the four." },
  { subject: "MTH101 · Mathematics", q: "What is 15% of 200?", options: ["20", "25", "30", "45"], answer: 2, explain: "15% of 200 = 0.15 × 200 = 30." },
  { subject: "MTH101 · Mathematics", q: "If 2x + 6 = 14, what is x?", options: ["3", "4", "5", "7"], answer: 1, explain: "2x = 14 − 6 = 8, so x = 4." },
  { subject: "MTH101 · Mathematics", q: "What is the square root of 144?", options: ["11", "12", "13", "14"], answer: 1, explain: "12 × 12 = 144, so √144 = 12." },
  { subject: "ENG101 · English", q: "What is the past tense of 'go'?", options: ["Goed", "Went", "Gone to", "Going"], answer: 1, explain: "'Go' is irregular: its past tense is 'went'." },
  { subject: "ENG101 · English", q: "Which word is an adjective?", options: ["Quickly", "Happiness", "Happy", "Run"], answer: 2, explain: "'Happy' describes a noun; 'quickly' is an adverb, 'happiness' a noun, 'run' a verb." },
  { subject: "ENG101 · English", q: "Choose the correct spelling:", options: ["Recieve", "Receive", "Receeve", "Recive"], answer: 1, explain: "'Receive' follows the rule 'i before e, except after c'." },
  { subject: "MGT101 · Management", q: "Who is known as the father of scientific management?", options: ["Henri Fayol", "Frederick Taylor", "Max Weber", "Elton Mayo"], answer: 1, explain: "Frederick Taylor developed scientific management in the early 1900s." },
  { subject: "MGT101 · Management", q: "Which management function checks whether work matches the plan?", options: ["Planning", "Organising", "Leading", "Controlling"], answer: 3, explain: "Controlling means measuring performance and correcting it against the plan." },
  { subject: "MGT101 · Management", q: "A manager who makes all decisions alone uses which leadership style?", options: ["Democratic", "Laissez-faire", "Autocratic", "Participative"], answer: 2, explain: "Autocratic leadership keeps all decision-making with the leader." },
  { subject: "STA301 · Statistics", q: "What is the probability of getting heads in one fair coin toss?", options: ["1/4", "1/3", "1/2", "1"], answer: 2, explain: "One favourable outcome (heads) out of two equally likely outcomes = 1/2." },
  { subject: "STA301 · Statistics", q: "What is the mode of 2, 3, 3, 5, 7?", options: ["2", "3", "5", "7"], answer: 1, explain: "The mode is the most frequent value — 3 appears twice." },
  { subject: "STA301 · Statistics", q: "What is the range of 5, 9, 3 and 12?", options: ["7", "8", "9", "12"], answer: 2, explain: "Range = largest − smallest = 12 − 3 = 9." },
  { subject: "CS201 · Programming", q: "Which keyword declares a constant in C++?", options: ["static", "const", "final", "constant"], answer: 1, explain: "const makes a variable read-only after it is initialised." },
  { subject: "CS201 · Programming", q: "Which operator assigns a value to a variable in C++?", options: ["==", "=", "!=", "=>"], answer: 1, explain: "A single '=' assigns; '==' compares two values." },
  { subject: "CS201 · Programming", q: "Which header file is needed for cout and cin in C++?", options: ["stdio.h", "iostream", "conio.h", "string.h"], answer: 1, explain: "cout and cin are declared in <iostream>." },
];

const STORY_TAGS = [
  "Student life",
  "Exam diaries",
  "Funny moments",
  "Work + study",
  "Motivation",
  "Confession",
];

const QUESTION_CATEGORIES = [
  "General",
  "VULMS",
  "Assignments & Quizzes",
  "Exams",
  "Fees",
  "Courses & Electives",
  "Technical help",
];

const PROGRAMS = [
  "BS Computer Science",
  "BS Software Engineering",
  "BS Information Technology",
  "BBA (Business Administration)",
  "BS English",
  "BS Psychology",
  "BS Mathematics",
  "B.Com / BS Commerce",
  "MS Computer Science",
  "MBA",
  "Other",
];

/* NOTE (2026-11-08): the old deep link https://www.vu.edu.pk/PVCs/Default?type=Private
   returns a genuine IIS 404 on a direct fetch (checked with curl, browser UA and
   plain UA). The VU homepage below was verified HTTP 200 the same day, so the
   site links there and tells students to search "Virtual Campuses" on vu.edu.pk.
   If VU restores the directory deep link, point this constant back at it. */
const VU_OFFICIAL_CAMPUS_URL = "https://www.vu.edu.pk/";
const VULMS_URL = "https://vulms.vu.edu.pk";
window.VU_DATA = { FAQS, FAQ_CATEGORIES, GRADE_SCALE, GRADE_POINTS, CENTRES, GUIDE_STEPS, QUIZ_BANK, STORY_TAGS, QUESTION_CATEGORIES, PROGRAMS, VU_OFFICIAL_CAMPUS_URL, VULMS_URL };
