'use client';
/* LIMITRA, Careers — ported from legacy/pages-careers.jsx */
import { useState, useMemo } from 'react';
import { Icon } from '@/components/icons/Icon';
import { useStore } from '@/components/store/StoreProvider';
import { EmptyState } from '@/components/ui/Shared';
import { FField, Modal, Dropdown } from '@/components/forms/Shared';

const JOBS = [
  { id:'eng-fe',  title:'Senior Frontend Engineer',        dept:'Engineering',            loc:'Lagos (Hybrid)',  type:'Full-time', level:'Senior',     posted:'2d ago',
    blurb:'Build fast, accessible storefront experiences in React used by millions of shoppers across Nigeria.' },
  { id:'eng-be',  title:'Backend Engineer (Node.js)',      dept:'Engineering',            loc:'Remote',          type:'Full-time', level:'Mid–Senior', posted:'4d ago',
    blurb:'Design resilient services powering checkout, payments and order fulfilment at scale.' },
  { id:'eng-mob', title:'Mobile Engineer (React Native)',  dept:'Engineering',            loc:'Lagos (Hybrid)',  type:'Full-time', level:'Mid',        posted:'1w ago',
    blurb:'Own and grow the Limitra shopping app across Android and iOS.' },
  { id:'des-pd',  title:'Product Designer',                dept:'Product & Design',       loc:'Lagos (Hybrid)',  type:'Full-time', level:'Mid–Senior', posted:'3d ago',
    blurb:'Shape end-to-end shopping journeys, from discovery to delivery tracking.' },
  { id:'des-pm',  title:'Senior Product Manager',          dept:'Product & Design',       loc:'Lagos',           type:'Full-time', level:'Senior',     posted:'5d ago',
    blurb:'Lead the roadmap for buyer experience and conversion across the marketplace.' },
  { id:'mkt-gm',  title:'Growth Marketing Manager',        dept:'Marketing',              loc:'Lagos',           type:'Full-time', level:'Mid–Senior', posted:'1d ago',
    blurb:'Drive acquisition and retention across paid, organic and lifecycle channels.' },
  { id:'mkt-soc', title:'Social Media & Content Lead',     dept:'Marketing',              loc:'Remote',          type:'Part-time', level:'Mid',        posted:'6d ago',
    blurb:'Own Limitra’s voice across social, turning drops and deals into culture moments.' },
  { id:'mkt-aff', title:'Affiliate Programme Manager',     dept:'Marketing',              loc:'Lagos',           type:'Full-time', level:'Mid',        posted:'1w ago',
    blurb:'Grow and support our community of affiliates earning on every delivered sale.' },
  { id:'ops-wh',  title:'Warehouse Operations Lead',       dept:'Operations & Logistics', loc:'Ikeja, Lagos',    type:'Full-time', level:'Senior',     posted:'3d ago',
    blurb:'Run a fast, accurate fulfilment centre and keep next-day delivery promises.' },
  { id:'ops-lm',  title:'Last-Mile Delivery Coordinator',  dept:'Operations & Logistics', loc:'Abuja',           type:'Full-time', level:'Mid',        posted:'2w ago',
    blurb:'Coordinate riders and routes to deliver orders quickly and reliably.' },
  { id:'cx-assoc',title:'Customer Experience Associate',   dept:'Customer Experience',    loc:'Lagos',           type:'Full-time', level:'Entry',      posted:'2d ago',
    blurb:'Be the friendly, fast first response for shoppers across chat, email and phone.' },
  { id:'cx-night',title:'Customer Experience Associate (Night)', dept:'Customer Experience', loc:'Remote',      type:'Contract',  level:'Entry',      posted:'5d ago',
    blurb:'Support customers around the clock with empathy and quick problem-solving.' },
  { id:'fin-an',  title:'Finance Analyst',                 dept:'Finance',                loc:'Lagos',           type:'Full-time', level:'Mid',        posted:'1w ago',
    blurb:'Turn marketplace data into the reporting and insight that guides decisions.' },
  { id:'sp-sell', title:'Seller Partnerships Manager',     dept:'Sales & Partnerships',   loc:'Lagos',           type:'Full-time', level:'Mid–Senior', posted:'4d ago',
    blurb:'Recruit and grow verified sellers across phones, beauty, hair and fashion.' },
  { id:'sp-buy',  title:'Category Buyer, Beauty & Hair',  dept:'Sales & Partnerships',   loc:'Lagos',           type:'Full-time', level:'Mid',        posted:'1w ago',
    blurb:'Curate the brands and products that define our beauty and hair categories.' },
];

const DEPTS = ['All departments', ...Array.from(new Set(JOBS.map(j => j.dept)))];
const DEPT_ICON = {
  'Engineering':'grid', 'Product & Design':'spark', 'Marketing':'tag',
  'Operations & Logistics':'truck', 'Customer Experience':'headset', 'Finance':'dollar', 'Sales & Partnerships':'store',
};

function ApplyJobForm({ job, onDone }) {
  const { toast } = useStore();
  const [f, setF] = useState({ name:'', email:'', phone:'', link:'', note:'' });
  const [errs, setErrs] = useState({});
  const submit = e => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = 'Enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = 'Enter a valid email';
    if (f.phone.replace(/\D/g, '').length < 10) er.phone = 'Enter a valid phone number';
    setErrs(er);
    if (Object.keys(er).length) return;
    toast('Application submitted, we’ll be in touch!');
    onDone();
  };
  return (
    <form onSubmit={submit}>
      <div className="form-grid">
        <FField label="Full name" value={f.name} onChange={v => setF(s => ({ ...s, name: v }))} err={errs.name} placeholder="Lucy Limitra" />
        <FField label="Email" value={f.email} onChange={v => setF(s => ({ ...s, email: v }))} err={errs.email} placeholder="you@email.com" />
        <FField label="Phone" value={f.phone} onChange={v => setF(s => ({ ...s, phone: v }))} err={errs.phone} placeholder="+234 800 000 0000" />
        <FField label="Portfolio / LinkedIn" value={f.link} onChange={v => setF(s => ({ ...s, link: v }))} placeholder="linkedin.com/in/you" />
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Why Limitra? <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></label>
          <textarea className="input" rows={3} style={{ resize: 'vertical', fontFamily: 'inherit' }} value={f.note} placeholder="Tell us a little about you…" onChange={e => setF(s => ({ ...s, note: e.target.value }))} />
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Résumé / CV</label>
          <div className="cv-drop"><Icon name="download" size={18} /> Drag &amp; drop your CV, or <span className="link-btn" style={{ display: 'inline' }}>browse</span> <small className="muted" style={{ display: 'block', marginTop: 4 }}>PDF or DOCX, max 5MB</small></div>
        </div>
      </div>
      <div className="modal-foot">
        <button type="button" className="btn btn-ghost" onClick={onDone}>Cancel</button>
        <button type="submit" className="btn btn-primary">Submit application</button>
      </div>
    </form>
  );
}

export function CareersPage() {
  const { toast } = useStore();
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('All departments');
  const [type, setType] = useState('All types');
  const [applyJob, setApplyJob] = useState(null);

  const types = ['All types', 'Full-time', 'Part-time', 'Contract', 'Remote', 'Hybrid'];
  const counts = useMemo(() => {
    const m = {}; JOBS.forEach(j => { m[j.dept] = (m[j.dept] || 0) + 1; }); return m;
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return JOBS.filter(j =>
      (dept === 'All departments' || j.dept === dept) &&
      (type === 'All types'
        || (type === 'Remote' && /remote/i.test(j.loc))
        || (type === 'Hybrid' && /hybrid/i.test(j.loc))
        || j.type === type) &&
      (!term || (j.title + ' ' + j.dept + ' ' + j.loc + ' ' + j.blurb).toLowerCase().includes(term))
    );
  }, [q, dept, type]);

  const benefits = [
    ['dollar', 'Competitive pay & equity', 'Market-leading salary, performance bonus and share options so you own a piece of what you build.'],
    ['shield', 'Health & wellness', 'Comprehensive private health insurance for you and your family, plus mental-wellness support.'],
    ['spark', 'Learning & growth', 'An annual learning budget, mentorship and a clear path to grow your career with us.'],
    ['refresh', 'Flexible & hybrid work', 'Hybrid schedules and fully-remote roles, with the tools to do your best work anywhere.'],
    ['tag', 'Staff discount', 'Generous discounts across phones, beauty, hair, fashion and everything on Limitra.'],
    ['gift', 'Time off & parental leave', 'Generous paid time off, public holidays and fully-paid parental leave for new parents.'],
  ];

  return (
    <div className="page page-fade">
      <section className="help-hero careers-hero">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <span className="badge badge-soft" style={{ marginBottom: 16 }}><Icon name="spark" size={14} /> Careers at Limitra</span>
          <h1 style={{ fontSize: 40, marginBottom: 10 }}>Build the future of shopping in Africa</h1>
          <p className="muted" style={{ fontSize: 16, maxWidth: 600, marginInline: 'auto' }}>Join a team making quality products accessible, with secure shopping and reliable delivery for millions across Nigeria.</p>
        </div>
      </section>

      <div className="wrap">
        {/* our benefits */}
        <section className="benefits-sec">
          <div className="aff-sec-head">
            <span className="eyebrow">Our Benefits</span>
            <h2>Why you’ll love working here</h2>
            <p className="muted" style={{ marginTop: 10, textWrap: 'pretty' }}>We invest in our team the way we invest in our customers, generously, and for the long term.</p>
          </div>
          <div className="benefits-grid">
            {benefits.map(([ic, t, s]) => (
              <div key={t} className="benefit-card">
                <span className="benefit-ic"><Icon name={ic} size={22} /></span>
                <b>{t}</b>
                <p className="muted">{s}</p>
              </div>
            ))}
          </div>
        </section>

        {/* open roles heading + search + filters */}
        <div className="careers-roles-head">
          <span className="eyebrow">Open roles</span>
          <h2>Find your next role</h2>
        </div>
        <div className="careers-toolbar">
          <div className="careers-searchbar">
            <Icon name="search" size={19} className="muted" />
            <input placeholder="Search roles by title, location or keyword…" value={q} onChange={e => setQ(e.target.value)} />
            {q && <button className="sm-clear" onClick={() => setQ('')} aria-label="Clear"><Icon name="close" size={16} /></button>}
          </div>
          <div className="careers-selects">
            <div className="sel-field">
              <label>Department</label>
              <Dropdown
                value={dept}
                onChange={setDept}
                width={232}
                getIcon={v => v === 'All departments' ? 'grid' : (DEPT_ICON[v] || 'grid')}
                getMeta={v => v === 'All departments' ? JOBS.length : counts[v]}
                options={DEPTS} />
            </div>
            <div className="sel-field">
              <label>Type</label>
              <Dropdown
                value={type}
                onChange={setType}
                width={170}
                getIcon={v => ({ 'All types':'list', 'Full-time':'clock', 'Part-time':'clock', 'Contract':'edit', 'Remote':'location', 'Hybrid':'refresh' }[v] || 'clock')}
                options={types} />
            </div>
          </div>
        </div>

        {/* results */}
        <div className="careers-count">{results.length} {results.length === 1 ? 'open role' : 'open roles'}{dept !== 'All departments' ? ' in ' + dept : ''}</div>

        {results.length === 0 ? (
          <EmptyState icon="search" title="No roles match your search" body="Try a different keyword or clear the filters, new roles open often." action="Clear filters" onAction={() => { setQ(''); setDept('All departments'); setType('All types'); }} />
        ) : (
          <div className="job-list">
            {results.map(j => (
              <div key={j.id} className="job-card">
                <div className="job-ic"><Icon name={DEPT_ICON[j.dept] || 'grid'} size={20} /></div>
                <div className="job-main">
                  <div className="job-top">
                    <h3>{j.title}</h3>
                    <span className="job-posted">{j.posted}</span>
                  </div>
                  <p className="muted job-blurb">{j.blurb}</p>
                  <div className="job-meta">
                    <span className="jm"><Icon name="grid" size={13} /> {j.dept}</span>
                    <span className="jm"><Icon name="location" size={13} /> {j.loc}</span>
                    <span className="jm"><Icon name="clock" size={13} /> {j.type}</span>
                    <span className="jm"><Icon name="user" size={13} /> {j.level}</span>
                  </div>
                </div>
                <div className="job-action">
                  <button className="btn btn-primary" onClick={() => setApplyJob(j)}>Apply <Icon name="arrowr" size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* no-fit CTA */}
        <div className="careers-cta">
          <div>
            <b>Don’t see the right role?</b>
            <span className="muted">We’re always meeting great people. Send us your CV and we’ll reach out when something fits.</span>
          </div>
          <button className="btn btn-outline" onClick={() => toast('Open application, drop your CV any time!')}>Send open application</button>
        </div>
      </div>

      {applyJob && (
        <Modal title={'Apply, ' + applyJob.title} sub={applyJob.dept + ' · ' + applyJob.loc + ' · ' + applyJob.type} onClose={() => setApplyJob(null)}>
          <ApplyJobForm job={applyJob} onDone={() => setApplyJob(null)} />
        </Modal>
      )}
    </div>
  );
}
