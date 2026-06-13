export const tenants = [
  {
    id: "t1",
    name: "Kariuki & Associates",
    specialty: "Corporate & Commercial",
    logo: "K&A",
    color: "#D4A843",
    plan: "Enterprise",
    established: "2008",
    location: "Nairobi, Kenya",
  },
  {
    id: "t2",
    name: "Odhiambo Legal Partners",
    specialty: "Criminal & Civil Law",
    logo: "OLP",
    color: "#4A90D9",
    plan: "Professional",
    established: "2015",
    location: "Mombasa, Kenya",
  },
  {
    id: "t3",
    name: "Wanjiru & Mwangi LLP",
    specialty: "Family & Real Estate",
    logo: "W&M",
    color: "#2ECC71",
    plan: "Professional",
    established: "2012",
    location: "Kisumu, Kenya",
  },
];

export const staff = {
  t1: [
    { id: "s1", name: "Diana Kariuki", role: "Senior Partner", specialty: "M&A", email: "d.kariuki@ka.co.ke", phone: "+254 700 111 001", cases: 12, billableRate: 25000, avatar: "DK", status: "Active", joined: "2008-03-01" },
    { id: "s2", name: "Peter Maina", role: "Associate", specialty: "Corporate", email: "p.maina@ka.co.ke", phone: "+254 700 111 002", cases: 8, billableRate: 15000, avatar: "PM", status: "Active", joined: "2019-07-15" },
    { id: "s3", name: "Grace Njeri", role: "Partner", specialty: "Tax Law", email: "g.njeri@ka.co.ke", phone: "+254 700 111 003", cases: 10, billableRate: 20000, avatar: "GN", status: "Active", joined: "2013-01-10" },
    { id: "s4", name: "James Omondi", role: "Junior Associate", specialty: "Contracts", email: "j.omondi@ka.co.ke", phone: "+254 700 111 004", cases: 5, billableRate: 10000, avatar: "JO", status: "Active", joined: "2022-05-01" },
    { id: "s5", name: "Aisha Waweru", role: "Paralegal", specialty: "Research", email: "a.waweru@ka.co.ke", phone: "+254 700 111 005", cases: 15, billableRate: 6000, avatar: "AW", status: "On Leave", joined: "2020-02-20" },
  ],
  t2: [
    { id: "s1", name: "Tobias Odhiambo", role: "Managing Partner", specialty: "Criminal Defense", email: "t.odhiambo@olp.co.ke", phone: "+254 722 222 001", cases: 9, billableRate: 22000, avatar: "TO", status: "Active", joined: "2015-01-01" },
    { id: "s2", name: "Naomi Achieng", role: "Senior Associate", specialty: "Civil Litigation", email: "n.achieng@olp.co.ke", phone: "+254 722 222 002", cases: 14, billableRate: 16000, avatar: "NA", status: "Active", joined: "2017-09-01" },
  ],
  t3: [
    { id: "s1", name: "Irene Wanjiru", role: "Founding Partner", specialty: "Family Law", email: "i.wanjiru@wm.co.ke", phone: "+254 733 333 001", cases: 11, billableRate: 18000, avatar: "IW", status: "Active", joined: "2012-06-01" },
    { id: "s2", name: "Samuel Mwangi", role: "Partner", specialty: "Real Estate", email: "s.mwangi@wm.co.ke", phone: "+254 733 333 002", cases: 7, billableRate: 17000, avatar: "SM", status: "Active", joined: "2012-06-01" },
  ],
};

export const clients = {
  t1: [
    { id: "c1", name: "Safaricom PLC", type: "Corporate", contact: "John Njoroge", email: "legal@safaricom.co.ke", phone: "+254 722 000 100", industry: "Telecommunications", cases: 3, totalBilled: 4500000, status: "Active", since: "2015-03-01" },
    { id: "c2", name: "Kenya Breweries Ltd", type: "Corporate", contact: "Mary Wanjiku", email: "legal@kbl.co.ke", phone: "+254 722 000 200", industry: "FMCG", cases: 2, totalBilled: 2800000, status: "Active", since: "2018-07-15" },
    { id: "c3", name: "Allan Kimani", type: "Individual", contact: "Allan Kimani", email: "a.kimani@gmail.com", phone: "+254 700 333 001", industry: "Private", cases: 1, totalBilled: 450000, status: "Active", since: "2023-01-20" },
    { id: "c4", name: "Equity Bank Kenya", type: "Corporate", contact: "Susan Otieno", email: "legal@equity.co.ke", phone: "+254 722 000 400", industry: "Banking", cases: 4, totalBilled: 7200000, status: "Active", since: "2010-05-01" },
    { id: "c5", name: "Nairobi County Govt", type: "Government", contact: "Hon. David Mwai", email: "legal@nairobi.go.ke", phone: "+254 20 222 5000", industry: "Government", cases: 2, totalBilled: 3100000, status: "Active", since: "2019-11-01" },
  ],
  t2: [
    { id: "c1", name: "Michael Otieno", type: "Individual", contact: "Michael Otieno", email: "m.otieno@gmail.com", phone: "+254 722 500 001", industry: "Private", cases: 1, totalBilled: 320000, status: "Active", since: "2023-06-01" },
    { id: "c2", name: "Coastal Traders Ltd", type: "Corporate", contact: "Fatuma Hassan", email: "legal@coastaltraders.co.ke", phone: "+254 722 500 002", industry: "Trade", cases: 2, totalBilled: 890000, status: "Active", since: "2021-03-15" },
  ],
  t3: [
    { id: "c1", name: "Wanjiku Kamau", type: "Individual", contact: "Wanjiku Kamau", email: "w.kamau@gmail.com", phone: "+254 733 600 001", industry: "Private", cases: 1, totalBilled: 180000, status: "Active", since: "2024-01-10" },
    { id: "c2", name: "Nyeri Properties Ltd", type: "Corporate", contact: "Charles Mutua", email: "legal@nyerip.co.ke", phone: "+254 733 600 002", industry: "Real Estate", cases: 3, totalBilled: 2200000, status: "Active", since: "2020-08-01" },
  ],
};

export const cases = {
  t1: [
    { id: "ca1", title: "Safaricom vs Airtel - Patent Dispute", client: "Safaricom PLC", clientId: "c1", type: "Intellectual Property", status: "Active", assignedTo: "Diana Kariuki", priority: "High", filed: "2024-01-15", nextHearing: "2025-06-10", court: "High Court, Nairobi", caseNo: "HCCC 045/2024", description: "Patent infringement dispute over 5G network technology.", fee: 1200000 },
    { id: "ca2", title: "KBL Merger - Regulatory Filing", client: "Kenya Breweries Ltd", clientId: "c2", type: "Corporate M&A", status: "Active", assignedTo: "Grace Njeri", priority: "High", filed: "2024-03-01", nextHearing: null, court: "Competition Authority", caseNo: "CAK/023/2024", description: "Regulatory approval for acquisition of a regional brewery.", fee: 950000 },
    { id: "ca3", title: "Kimani Estate Planning", client: "Allan Kimani", clientId: "c3", type: "Estate & Probate", status: "Pending", assignedTo: "Peter Maina", priority: "Medium", filed: "2024-11-20", nextHearing: "2025-05-20", court: "Milimani Law Courts", caseNo: "PROB 112/2024", description: "Drafting of will and trust instruments.", fee: 250000 },
    { id: "ca4", title: "Equity Bank - NPA Recovery", client: "Equity Bank Kenya", clientId: "c4", type: "Banking & Finance", status: "Active", assignedTo: "Diana Kariuki", priority: "Critical", filed: "2023-09-10", nextHearing: "2025-06-02", court: "Commercial Court", caseNo: "COMM 301/2023", description: "Recovery of non-performing loans from defaulting corporate borrowers.", fee: 3500000 },
    { id: "ca5", title: "Nairobi County Land Acquisition", client: "Nairobi County Govt", clientId: "c5", type: "Public Law", status: "Closed", assignedTo: "Grace Njeri", priority: "Low", filed: "2023-04-01", nextHearing: null, court: "Environment & Land Court", caseNo: "ELC 088/2023", description: "Compulsory acquisition proceedings for infrastructure expansion.", fee: 1800000 },
    { id: "ca6", title: "Equity Bank - Employment Dispute", client: "Equity Bank Kenya", clientId: "c4", type: "Employment Law", status: "Active", assignedTo: "James Omondi", priority: "Medium", filed: "2024-08-05", nextHearing: "2025-07-15", court: "Employment & Labour Court", caseNo: "ELC 220/2024", description: "Wrongful termination claim by former senior manager.", fee: 420000 },
  ],
  t2: [
    { id: "ca1", title: "Otieno - Criminal Defense", client: "Michael Otieno", clientId: "c1", type: "Criminal Defense", status: "Active", assignedTo: "Tobias Odhiambo", priority: "Critical", filed: "2023-10-01", nextHearing: "2025-06-05", court: "High Court, Mombasa", caseNo: "CR 099/2023", description: "Defense on charges of financial fraud.", fee: 320000 },
    { id: "ca2", title: "Coastal Traders - Commercial Dispute", client: "Coastal Traders Ltd", clientId: "c2", type: "Commercial Litigation", status: "Pending", assignedTo: "Naomi Achieng", priority: "High", filed: "2024-05-12", nextHearing: "2025-06-20", court: "Commercial Court, Mombasa", caseNo: "COMM 041/2024", description: "Dispute over breach of supply contract.", fee: 550000 },
  ],
  t3: [
    { id: "ca1", title: "Kamau Divorce Proceedings", client: "Wanjiku Kamau", clientId: "c1", type: "Family Law", status: "Active", assignedTo: "Irene Wanjiru", priority: "High", filed: "2024-02-01", nextHearing: "2025-06-18", court: "Family Court, Kisumu", caseNo: "FAM 033/2024", description: "Contested divorce with child custody and property division.", fee: 180000 },
    { id: "ca2", title: "Nyeri Properties - Conveyancing", client: "Nyeri Properties Ltd", clientId: "c2", type: "Real Estate", status: "Active", assignedTo: "Samuel Mwangi", priority: "Medium", filed: "2024-07-10", nextHearing: null, court: "N/A", caseNo: "CONV 201/2024", description: "Title transfer for 15-acre commercial development parcel.", fee: 1200000 },
    { id: "ca3", title: "Nyeri Properties - Tenant Dispute", client: "Nyeri Properties Ltd", clientId: "c2", type: "Real Estate", status: "Closed", assignedTo: "Samuel Mwangi", priority: "Low", filed: "2023-11-01", nextHearing: null, court: "Rent Tribunal, Kisumu", caseNo: "RT 077/2023", description: "Eviction proceedings against commercial tenant.", fee: 85000 },
  ],
};

export const invoices = {
  t1: [
    { id: "inv1", number: "INV-2025-001", client: "Safaricom PLC", caseId: "ca1", amount: 600000, paid: 600000, status: "Paid", issued: "2025-01-31", due: "2025-02-28", items: [{ desc: "Legal representation - Q4 2024", hours: 40, rate: 15000 }] },
    { id: "inv2", number: "INV-2025-002", client: "Equity Bank Kenya", caseId: "ca4", amount: 1200000, paid: 0, status: "Overdue", issued: "2025-03-01", due: "2025-03-31", items: [{ desc: "NPA Recovery - Q1 2025", hours: 48, rate: 25000 }] },
    { id: "inv3", number: "INV-2025-003", client: "Kenya Breweries Ltd", caseId: "ca2", amount: 475000, paid: 475000, status: "Paid", issued: "2025-02-15", due: "2025-03-15", items: [{ desc: "M&A Advisory - Phase 1", hours: 30, rate: 20000 }] },
    { id: "inv4", number: "INV-2025-004", client: "Allan Kimani", caseId: "ca3", amount: 125000, paid: 0, status: "Pending", issued: "2025-04-01", due: "2025-05-01", items: [{ desc: "Estate planning consultation", hours: 12, rate: 15000 }] },
    { id: "inv5", number: "INV-2025-005", client: "Equity Bank Kenya", caseId: "ca6", amount: 210000, paid: 210000, status: "Paid", issued: "2025-04-15", due: "2025-05-15", items: [{ desc: "Employment case - initial filing", hours: 21, rate: 10000 }] },
  ],
  t2: [
    { id: "inv1", number: "INV-2025-001", client: "Michael Otieno", caseId: "ca1", amount: 160000, paid: 80000, status: "Partial", issued: "2025-01-10", due: "2025-02-10", items: [{ desc: "Criminal defense retainer", hours: 20, rate: 22000 }] },
    { id: "inv2", number: "INV-2025-002", client: "Coastal Traders Ltd", caseId: "ca2", amount: 275000, paid: 0, status: "Pending", issued: "2025-04-01", due: "2025-05-01", items: [{ desc: "Commercial litigation - Phase 1", hours: 25, rate: 16000 }] },
  ],
  t3: [
    { id: "inv1", number: "INV-2025-001", client: "Wanjiku Kamau", caseId: "ca1", amount: 90000, paid: 90000, status: "Paid", issued: "2025-02-01", due: "2025-03-01", items: [{ desc: "Divorce proceedings - Q1", hours: 15, rate: 18000 }] },
    { id: "inv2", number: "INV-2025-002", client: "Nyeri Properties Ltd", caseId: "ca2", amount: 600000, paid: 300000, status: "Partial", issued: "2025-03-15", due: "2025-04-15", items: [{ desc: "Conveyancing - Phase 1", hours: 35, rate: 17000 }] },
  ],
};

export const documents = {
  t1: [
    { id: "d1", name: "Safaricom Patent Filing.pdf", case: "ca1", client: "Safaricom PLC", type: "Court Filing", size: "2.4 MB", uploaded: "2024-01-20", uploadedBy: "Diana Kariuki", tags: ["patent", "filing"] },
    { id: "d2", name: "KBL Merger Agreement Draft v3.docx", case: "ca2", client: "Kenya Breweries Ltd", type: "Contract", size: "1.1 MB", uploaded: "2024-03-15", uploadedBy: "Grace Njeri", tags: ["M&A", "contract"] },
    { id: "d3", name: "Equity Bank - Loan Agreements Bundle.pdf", case: "ca4", client: "Equity Bank Kenya", type: "Evidence", size: "8.7 MB", uploaded: "2023-09-15", uploadedBy: "Diana Kariuki", tags: ["NPA", "loans"] },
    { id: "d4", name: "Kimani Last Will and Testament.docx", case: "ca3", client: "Allan Kimani", type: "Legal Instrument", size: "0.5 MB", uploaded: "2024-12-01", uploadedBy: "Peter Maina", tags: ["will", "estate"] },
    { id: "d5", name: "County Land Valuation Report.pdf", case: "ca5", client: "Nairobi County Govt", type: "Report", size: "5.2 MB", uploaded: "2023-04-20", uploadedBy: "Grace Njeri", tags: ["land", "valuation"] },
    { id: "d6", name: "Employment Contract - Terminated Staff.pdf", case: "ca6", client: "Equity Bank Kenya", type: "Evidence", size: "0.8 MB", uploaded: "2024-08-10", uploadedBy: "James Omondi", tags: ["employment", "HR"] },
  ],
  t2: [
    { id: "d1", name: "Otieno - Police Statement.pdf", case: "ca1", client: "Michael Otieno", type: "Evidence", size: "1.2 MB", uploaded: "2023-10-05", uploadedBy: "Tobias Odhiambo", tags: ["criminal", "statement"] },
    { id: "d2", name: "Coastal - Supply Contract.pdf", case: "ca2", client: "Coastal Traders Ltd", type: "Contract", size: "0.9 MB", uploaded: "2024-05-20", uploadedBy: "Naomi Achieng", tags: ["contract", "commercial"] },
  ],
  t3: [
    { id: "d1", name: "Kamau Marriage Certificate.pdf", case: "ca1", client: "Wanjiku Kamau", type: "Evidence", size: "0.3 MB", uploaded: "2024-02-05", uploadedBy: "Irene Wanjiru", tags: ["family", "certificate"] },
    { id: "d2", name: "Nyeri Properties - Title Deed.pdf", case: "ca2", client: "Nyeri Properties Ltd", type: "Legal Instrument", size: "1.5 MB", uploaded: "2024-07-15", uploadedBy: "Samuel Mwangi", tags: ["title", "property"] },
  ],
};

export const calendarEvents = {
  t1: [
    { id: "e1", title: "Safaricom Patent Hearing", caseId: "ca1", date: "2025-06-10", time: "09:00", type: "Court Hearing", court: "High Court, Nairobi", lawyer: "Diana Kariuki", notes: "Bring all patent documentation", priority: "High" },
    { id: "e2", title: "Equity NPA Hearing", caseId: "ca4", date: "2025-06-02", time: "14:00", type: "Court Hearing", court: "Commercial Court", lawyer: "Diana Kariuki", notes: "Prepare witness list", priority: "Critical" },
    { id: "e3", title: "Kimani Estate Filing Deadline", caseId: "ca3", date: "2025-05-20", time: "16:30", type: "Deadline", court: "Milimani Law Courts", lawyer: "Peter Maina", notes: "File will instrument", priority: "Medium" },
    { id: "e4", title: "Equity Employment Pre-Trial", caseId: "ca6", date: "2025-07-15", time: "10:00", type: "Pre-Trial Conference", court: "Employment & Labour Court", lawyer: "James Omondi", notes: "Mediation attempt before full hearing", priority: "Medium" },
    { id: "e5", title: "KBL Competition Authority Review", caseId: "ca2", date: "2025-06-25", time: "11:00", type: "Regulatory Meeting", court: "Competition Authority", lawyer: "Grace Njeri", notes: "Final review of merger documents", priority: "High" },
  ],
  t2: [
    { id: "e1", title: "Otieno Criminal Hearing", caseId: "ca1", date: "2025-06-05", time: "09:30", type: "Court Hearing", court: "High Court, Mombasa", lawyer: "Tobias Odhiambo", notes: "Expert witness scheduled", priority: "Critical" },
    { id: "e2", title: "Coastal - Pre-Trial Conference", caseId: "ca2", date: "2025-06-20", time: "14:00", type: "Pre-Trial Conference", court: "Commercial Court, Mombasa", lawyer: "Naomi Achieng", notes: "Settlement discussions expected", priority: "High" },
  ],
  t3: [
    { id: "e1", title: "Kamau Divorce Hearing", caseId: "ca1", date: "2025-06-18", time: "10:00", type: "Court Hearing", court: "Family Court, Kisumu", lawyer: "Irene Wanjiru", notes: "Child custody testimony", priority: "High" },
  ],
};

export const timeEntries = {
  t1: [
    { id: "te1", date: "2025-04-28", lawyer: "Diana Kariuki", client: "Safaricom PLC", caseId: "ca1", description: "Patent document review and analysis", hours: 3.5, rate: 25000, billable: true, billed: true },
    { id: "te2", date: "2025-04-29", lawyer: "Grace Njeri", client: "Kenya Breweries Ltd", caseId: "ca2", description: "Merger agreement drafting - Section 4", hours: 5, rate: 20000, billable: true, billed: false },
    { id: "te3", date: "2025-04-30", lawyer: "Peter Maina", client: "Allan Kimani", caseId: "ca3", description: "Will instrument consultation", hours: 2, rate: 15000, billable: true, billed: false },
    { id: "te4", date: "2025-05-01", lawyer: "Diana Kariuki", client: "Equity Bank Kenya", caseId: "ca4", description: "NPA file review and strategy meeting", hours: 6, rate: 25000, billable: true, billed: false },
    { id: "te5", date: "2025-05-02", lawyer: "James Omondi", client: "Equity Bank Kenya", caseId: "ca6", description: "Employment case research - unfair dismissal precedents", hours: 4, rate: 10000, billable: true, billed: false },
    { id: "te6", date: "2025-05-03", lawyer: "Grace Njeri", client: "Internal", caseId: null, description: "Firm admin and compliance review", hours: 2, rate: 20000, billable: false, billed: false },
  ],
  t2: [
    { id: "te1", date: "2025-04-30", lawyer: "Tobias Odhiambo", client: "Michael Otieno", caseId: "ca1", description: "Defense strategy prep", hours: 4, rate: 22000, billable: true, billed: false },
    { id: "te2", date: "2025-05-01", lawyer: "Naomi Achieng", client: "Coastal Traders Ltd", caseId: "ca2", description: "Contract clause analysis", hours: 3, rate: 16000, billable: true, billed: false },
  ],
  t3: [
    { id: "te1", date: "2025-05-01", lawyer: "Irene Wanjiru", client: "Wanjiku Kamau", caseId: "ca1", description: "Custody agreement negotiation prep", hours: 3, rate: 18000, billable: true, billed: false },
    { id: "te2", date: "2025-05-02", lawyer: "Samuel Mwangi", client: "Nyeri Properties Ltd", caseId: "ca2", description: "Title search and verification", hours: 5, rate: 17000, billable: true, billed: false },
  ],
};
